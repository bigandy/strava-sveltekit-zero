import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customSession, genericOAuth, jwt } from "better-auth/plugins";
import { db } from "./server/db"; // your drizzle instance

import { env } from '$env/dynamic/private';

if (!env.AUTH_STRAVA_ID) throw new Error('AUTH_STRAVA_ID is not set');
if (!env.AUTH_STRAVA_SECRET) throw new Error('AUTH_STRAVA_SECRET is not set');
if (!env.AUTH_STRAVA_REDIRECT_URL) throw new Error('AUTH_STRAVA_REDIRECT_URL is not set');

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg", // or "mysql", "sqlite"
	}),

	account: {
		accountLinking: {
			enabled: true,
			allowDifferentEmails: true,
			trustedProviders: ["strava"],
		},
		fields: {
			accountId: "providerAccountId",
			refreshToken: "refresh_token",
			accessToken: "access_token",
			accessTokenExpiresAt: "access_token_expires",
			idToken: "id_token",
		},
	},

	plugins: [
		genericOAuth({
			config: [
				{
					providerId: "strava",
					responseMode: "query",
					clientId: env.AUTH_STRAVA_ID,
					clientSecret: env.AUTH_STRAVA_SECRET,
					redirectURI: `${env.AUTH_STRAVA_REDIRECT_URL}/api/auth/oauth2/callback/strava`,
					authorizationUrl: "https://www.strava.com/oauth/authorize",
					tokenUrl: "https://www.strava.com/oauth/token",
					userInfoUrl: "https://www.strava.com/api/v3/athlete",
					scopes: ["activity:read_all,activity:write"],
					// mapProfileToUser: async (profile) => {
					// 	console.log({ profile });
					// 	return {
					// 		athleteId: profile.id,
					// 		// firstName: profile.given_name,
					// 		// ... map other fields as needed
					// 	};
					// },
					getUserInfo: async (tokens) => {
						const data = await fetch("https://www.strava.com/api/v3/athlete", {
							headers: { Authorization: `Bearer ${tokens.accessToken}` },
						}).then((data) => data.json());

						return {
							...data,
							email: data.username, // This is required to fix the error, even though it makes no sense b/c it isn't an email
							emailVerified: true,
							name: `${data.firstname} ${data.lastname}`,
							image: data.profile,
						};
					},
				},
			],
		}),
		customSession(async ({ user, session }) => {
			const account = await db.query.account.findFirst({
				where: (account, { eq }) => eq(account.userId, user.id),
			});

			return {
				user,
				session,
				account,
			};
		}),
		jwt(),
	],
	baseURL: process.env.BETTER_AUTH_URL,
});
