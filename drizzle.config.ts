/**
 * Drizzle Kit Configuration
 * Configuration for database migrations and schema management
 */

import { defineConfig } from "drizzle-kit";
import { env } from "./envConfig";

export default defineConfig({
	out: "./migrations",
	schema: ["./db/schema.ts", "./auth-schema.ts"],
	dialect: "turso",
	dbCredentials: {
		url: env.DATABASE_URL,
		authToken: env.DATABASE_AUTH_TOKEN,
	},
});
