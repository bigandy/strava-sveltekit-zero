import { defineConfig } from 'drizzle-kit';

if (!process.env.ZERO_UPSTREAM_DB) throw new Error('ZERO_UPSTREAM_DB is not set');

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.ZERO_UPSTREAM_DB,
	},
	verbose: true,
	strict: true
});
