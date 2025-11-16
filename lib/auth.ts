/**
 * Better Auth Configuration
 * Authentication setup using better-auth with Drizzle ORM
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@/auth-schema";
import { db } from "@/db";
import { env } from "@/envConfig";

/**
 * Better Auth Instance
 * Configured with Drizzle adapter for database operations
 */
export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "sqlite",
		schema: schema,
	}),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false, // Set to true in production
	},
	// Optional: Add social providers
	// socialProviders: {
	//   github: {
	//     clientId: env.GITHUB_CLIENT_ID,
	//     clientSecret: env.GITHUB_CLIENT_SECRET,
	//   },
	//   google: {
	//     clientId: env.GOOGLE_CLIENT_ID,
	//     clientSecret: env.GOOGLE_CLIENT_SECRET,
	//   },
	// },
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // 1 day
	},
	basePath: "/api/auth",
	baseURL: env.NEXT_PUBLIC_APP_URL,
	secret: env.BETTER_AUTH_SECRET,
});

/**
 * Export auth types for type safety
 */
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
