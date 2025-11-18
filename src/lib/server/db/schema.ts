import { relations, sql } from "drizzle-orm";
import {
	boolean,
	integer,
	numeric,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const activities = pgTable("activity", {
	id: text("id").primaryKey().notNull(),
	name: text("name").notNull(),
	description: text("description"), // Single activitity api does return this but not activities api
	kudos: integer("kudos").notNull(),
	start: timestamp("start", { withTimezone: true }).notNull(),
	elapsedTime: numeric("elapsedTime").notNull(),
	movingTime: numeric("movingTime").notNull(),
	type: text("type").notNull(),
	elevation: numeric("elevation").notNull(),
	distance: numeric("distance").notNull(),
	visibility: text("visibility").notNull(),
	summaryPolyline: text("summaryPolyline").notNull(),
	startCoords: text(),
	endCoords: text(),

	updatedAt: text()
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`)
		.$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),

	// isPrivate: boolean("isPrivate"), // API DOESN'T RETURN THIS.
	//   athlete: {
	// 	resource_state: number;
	// 	firstname: string;
	// 	lastname: string;
	//   },
	//   distance?: number;
	//   moving_time?: number;
	//   elapsed_time?: number;
	//   total_elevation_gain?: number;
	//   elev_high?: number;
	//   elev_low?: number;
	//   sport_type: SportType;
	//   start_date: Date;
	//   start_date_local: Date;
	//   timezone?: string;
	//   utc_offset?: number;
	//   location_city?: string;
	//   location_state?: string;
	//   location_country?: string;
	//   achievement_count?: number;
	//   kudos_count?: number;
	//   comment_count?: number;
	//   athlete_count?: number;
	//   photo_count?: number;
	//   total_photo_count?: number;
	//   map?: PolylineMapResponse;
	//   trainer?: boolean;
	//   commute?: boolean;
	//   manual?: boolean;
	//   private?: boolean;
	//   flagged?: boolean;
	//   average_speed?: number;
	//   max_speed?: number;
	//   has_kudoed?: boolean;
	//   hide_from_home?: boolean;
	//   gear_id?: string;
	//   description?: string;
	//   calories?: number;
	//   start_latlng?: Array<number>;
	//   end_latlng?: Array<number>;
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	providerAccountId: text("provider_account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	access_token: text("access_token").notNull(),
	refresh_token: text("refresh_token").notNull(),
	id_token: text("id_token"),
	access_token_expires: timestamp("access_token_expires").notNull(),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const userRelations = relations(user, ({ one }) => ({
	provider: one(account, {
		fields: [user.id],
		references: [account.userId],
	}),
}));

export const jwks = pgTable("jwks", {
	id: text("id").primaryKey(),
	publicKey: text("public_key").notNull(),
	privateKey: text("private_key").notNull(),
	createdAt: timestamp("created_at").notNull(),
});
