import type { Row } from "@rocicorp/zero";
import { ANYONE_CAN_DO_ANYTHING, definePermissions } from "@rocicorp/zero";

import { type Schema, schema } from "./zero-schema.gen";

export { schema, type Schema };

export type User = Row<typeof schema.tables.user>;
export type Activity = Row<typeof schema.tables.activities>;

type _Account = Row<typeof schema.tables.account>;

export interface Account
	extends Omit<
		_Account,
		"access_token_expires" | "createdAt" | "updatedAt" | "refreshTokenExpiresAt"
	> {
	access_token_expires: Date | null;
	createdAt: Date | null;
	updatedAt: Date | null;
	refreshTokenExpiresAt: Date | null;
}

// Define permissions with the inferred types from Drizzle
export const permissions = definePermissions(schema, () => ({
	user: ANYONE_CAN_DO_ANYTHING,
	account: ANYONE_CAN_DO_ANYTHING,
	activities: ANYONE_CAN_DO_ANYTHING,
}));
