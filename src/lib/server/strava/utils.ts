import { setTimeout as sleep } from "node:timers/promises";
import dayjs from "dayjs";
import { eq, getTableColumns, sql } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import type { DetailedActivityResponse } from "strava-v3";
import { default as strava } from "strava-v3";
import { seconds, throttledQueue } from "throttled-queue";
import { db } from "$lib/server/db";
import { account, activities } from "$lib/server/db/schema";
import type { Account } from "$lib/schema";
import { env } from '$env/dynamic/private';

interface Activity extends DetailedActivityResponse {
	type: string;
	visibility: string;
}

export const throttle = throttledQueue({
	maxPerInterval: 1,
	interval: seconds(1),
}); // at most make 1 request every second.

const nowEpoc = () => Math.floor(Date.now()) / 1000;


if (!env.AUTH_STRAVA_ID) throw new Error('AUTH_STRAVA_ID is not set');
if (!env.AUTH_STRAVA_SECRET) throw new Error('AUTH_STRAVA_SECRET is not set');
if (!env.AUTH_STRAVA_REDIRECT_URL) throw new Error('AUTH_STRAVA_REDIRECT_URL is not set');

const getAccessToken = async ({
	refresh_token,
	access_token,
	access_token_expires,
	userId,
}: {
	refresh_token: string;
	access_token: string;
	access_token_expires: Date;
	userId: string;
}) => {
	const now = nowEpoc();
	const expires = dayjs(access_token_expires).valueOf() / 1000;

	if (now > expires) {
		console.log("NEED NEW TOKEN");
		strava.config({
			access_token: access_token,
			client_id: env.AUTH_STRAVA_ID,
			client_secret: env.AUTH_STRAVA_SECRET,
			redirect_uri: env.AUTH_STRAVA_REDIRECT_URL,
		});

		const {
			access_token: newAccessToken,
			refresh_token: newRefreshToken,
			expires_at: newExpiresAt,
		} = await strava.oauth.refreshToken(refresh_token);

		await db
			.update(account)
			.set({
				refresh_token: newRefreshToken,
				access_token: newAccessToken,
				access_token_expires: new Date(newExpiresAt * 1000),
			})
			.where(eq(account.userId, userId));
		return newAccessToken;
	} else {
		console.log("NOT EXPIRED YET");
		return access_token;
	}
};

export const getStravaClient = async (account: Account) => {
	if (!account.access_token_expires) {
		return null;
	}
	const accessToken = await getAccessToken({
		access_token: account.access_token,
		refresh_token: account.refresh_token,
		access_token_expires: account.access_token_expires,
		userId: account.userId,
	});

	if (!accessToken) {
		return null;
	}
	// @ts-expect-error
	const client = new strava.client(accessToken);
	return client;
};

export const writeActivitiesToDB = async (stravaActivities: any) => {
	return await db.insert(activities).values(
		stravaActivities.map((act: any) => {
			return {
				id: act.id,
				name: act.name,
				description: act.description,
				kudos: act.kudos,
				start: act.start,
				elapsedTime: act.elapsedTime,
				movingTime: act.movingTime,
				type: act.type,
				elevation: act.elevation,
				distance: act.distance,
				visibility: act.visibility,
				summaryPolyline: act.summaryPolyline,
				startCoords: act.startCoords,
				endCoords: act.endCoords,
			};
		}),
	);
};

// https://github.com/drizzle-team/drizzle-orm/issues/1728#issuecomment-3249156563
const conflictUpdateAllExcept = <
	T extends PgTable,
	C extends keyof T["$inferInsert"],
>(
	table: T,
	except: C[],
) =>
	Object.fromEntries(
		Object.entries(getTableColumns(table))
			.filter(
				([colName]) =>
					!except.includes(colName as keyof typeof table.$inferInsert),
			)
			.map(([colName, { name }]) => [colName, sql.raw(`EXCLUDED."${name}"`)]),
	);

const formatCoords = (coords, activityType) => {
	if (activityType === "VirtualRide") {
		return null;
	}

	if (Number.isNaN(Number(coords[0])) || Number.isNaN(Number(coords[1]))) {
		return null;
	}

	return JSON.stringify(coords);
};

export const formatStravaActivities = (activities: any) => {
	return activities?.map((activity: Activity) => {
		return {
			name: activity.name,
			distance: activity.distance,
			id: activity.id,
			kudos: activity.kudos_count,
			start: dayjs(activity.start_date_local),
			elevation: activity.total_elevation_gain,
			description: activity.description,
			type: activity.type,
			athletes: activity.athlete_count,
			elapsedTime: activity.elapsed_time,
			movingTime: activity.moving_time,
			visibility: activity.visibility,
			summaryPolyline:
				activity.type !== "VirtualRide" && activity?.map?.summary_polyline,
			startCoords: formatCoords(activity.start_latlng, activity.type),
			endCoords: formatCoords(activity.end_latlng, activity.type),
		};
	});
};

export const upsertActivitiesToDB = async (stravaActivities: any) => {
	return await db
		.insert(activities)
		.values(
			stravaActivities.map((act: any) => {
				return {
					id: act.id,
					name: act.name,
					description: act.description,
					kudos: act.kudos,
					start: act.start,
					elapsedTime: act.elapsedTime,
					movingTime: act.movingTime,
					type: act.type,
					elevation: act.elevation,
					distance: act.distance,
					visibility: act.visibility,
					summaryPolyline: act.summaryPolyline,
					startCoords: act.startCoords,
					endCoords: act.endCoords,
				};
			}),
		)
		.onConflictDoUpdate({
			target: activities.id,
			set: conflictUpdateAllExcept(activities, ["id"]),
		});
};

export const deleteActivities = async () => {
	return await db.delete(activities);
};

export const getAllStravaActivities = async (account: Account) => {
	const strava = await getStravaClient(account);

	const allStravaActivities = [];
	let page = 1;
	const per_page = 100;

	let continueFetching = true;

	while (continueFetching) {
		await throttle(async () => {
			const activities = await strava?.athlete.listActivities({
				page,
				per_page,
			});

			// format so can go into db
			const formattedActivities = formatStravaActivities(activities);

			// write to the db
			await upsertActivitiesToDB(formattedActivities);

			continueFetching = formattedActivities.length === per_page;
			allStravaActivities.push(formattedActivities);

			page++;

			console.log(page, formattedActivities.length);

			// Do I need this line??
			return Promise.resolve("done");
		});
	}

	return "done";
};

export const getStravaActivities = async (
	account: Account,
	options = {},
	formatted = true,
) => {
	const strava = await getStravaClient(account);
	const payload = await strava?.athlete.listActivities(options);

	return formatted ? formatStravaActivities(payload) : payload;
};

export const getOneStravaActivity = async (
	account: Account,
	activityId: string,
) => {
	const strava = await getStravaClient(account);
	const payload = await strava?.activities.get({ id: activityId });

	return formatStravaActivities([payload]);
};

export const getOneRawStravaActivity = async (
	account: Account,
	activityId: string,
) => {
	const strava = await getStravaClient(account);
	const payload = await strava?.activities.get({ id: activityId });

	return payload;
};

export const updateOneStravaActivity = async (
	account: Account,
	activityId: string,
	data: any,
) => {
	const strava = await getStravaClient(account);

	return await strava?.activities.update({
		id: activityId,
		...data,
	});
};

export const getStravaUserInformation = async (account: Account) => {
	const strava = await getStravaClient(account);

	const athlete = await strava.athlete.get({});

	return { athlete };
};

/**
 * Streams the response back to the user. In future possible to also pass back the activities themselves?
 * @param account
 * @param maxPages
 * @returns
 */
export const getAllStravaActivitiesWithStreaming = async (
	account: Account,
	maxPages: number = Infinity,
) => {
	const strava = await getStravaClient(account);

	const allStravaActivities = [];
	let page = 1;
	const per_page = 100;

	let continueFetching = true;

	const stream = new ReadableStream({
		start(controller) {
			const getActivities = async () => {
				while (continueFetching && page <= maxPages) {
					const newActivities = await throttle(async () => {
						const activities = await strava?.athlete.listActivities({
							page,
							per_page,
						});

						// format so can go into db
						const formattedActivities = formatStravaActivities(activities);

						// write to the db
						await upsertActivitiesToDB(formattedActivities);

						continueFetching = formattedActivities.length === per_page;

						controller.enqueue(
							JSON.stringify({
								page,
								status: "loading",
							}),
						);

						page++;

						return formattedActivities;
					});

					allStravaActivities.push(newActivities);
				}

				// For some reason this is needed to prevent two messages being sent at the same time. The finished message and the one before.
				await sleep(10);

				controller.enqueue(
					JSON.stringify({
						page: page - 1,
						status: "finished",
					}),
				);

				controller.close();
			};

			getActivities();
		},
	});

	return stream;
};
