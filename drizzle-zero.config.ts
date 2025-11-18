import { drizzleZeroConfig } from "drizzle-zero";
// directly glob import your original Drizzle schema w/ tables/relations
import * as drizzleSchema from "./src/lib/server/db/schema.ts";

// Define your configuration file for the CLI
export default drizzleZeroConfig(drizzleSchema, {
	// Specify which tables and columns to include in the Zero schema.
	// This allows for the "expand/migrate/contract" pattern recommended in the Zero docs.

	// All tables/columns must be defined, but can be omitted or set to false to exclude them from the Zero schema.
	// Column names match your Drizzle schema definitions
	tables: {
		providers: true,
		account: true,
		activities: true,
		user: true,
		jwks: false,
	},

	// Specify the casing style to use for the schema.
	// This is useful for when you want to use a different casing style than the default.
	// This works in the same way as the `casing` option in the Drizzle ORM.
	//
	// @example
	// casing: "snake_case",
});
