import { query, command, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import * as v from 'valibot';

import { getStravaActivities, writeActivitiesToDB, deleteActivities, getAllStravaActivities } from '$lib/server/strava/utils';
import { auth } from '$lib/auth';

export const getActivities = query(async () => {
	const activities = await db.query.activities.findMany();

	return activities;
});

export const getActivity = query(v.string(), async (id) => {
	const activity = await db.query.activities.findFirst({
        where: (activities, { eq }) => eq(activities.id, id),
    });

	return activity;
});

export const deleteStravaActivities = query(async () => {
    await deleteActivities();
})


export const fetchLatestActivities = query(async () => {

    const event = getRequestEvent();
    const session = await auth.api.getSession({
        headers: event.request.headers,
    });

    const stravaActivities = await getStravaActivities(session.account);

	// Delete activities from DB
	await deleteActivities();

	// Put them in the database!
	await writeActivitiesToDB(stravaActivities);

});

export const fetchAllStravaActivities = command(async () => {

    const event = getRequestEvent();
    const session = await auth.api.getSession({
        headers: event.request.headers,
    });

    await getAllStravaActivities(session.account);
});