/**
 * Database Client Configuration
 * Using Drizzle ORM with libSQL/Turso
 */

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "../envConfig";
import * as schema from "./schema";

/**
 * Create libSQL client
 * Uses validated environment variables from envConfig
 */
const client = createClient({
	url: env.DATABASE_URL,
	authToken: env.DATABASE_AUTH_TOKEN,
});

/**
 * Drizzle database instance
 * Includes schema for type-safe queries
 */
export const db = drizzle({ client, schema });