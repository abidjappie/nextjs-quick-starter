/**
 * Better Auth Configuration
 * Authentication setup using better-auth with Drizzle ORM
 * Dynamically loads OAuth providers from database
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { genericOAuth } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import * as schema from "@/auth-schema";
import { db } from "@/db";
import { oauthProviders } from "@/db/schema";
import { env } from "@/envConfig";

/**
 * Load OAuth providers from database
 * Returns array of provider configurations for better-auth
 */
async function loadOAuthProvidersFromDB() {
	try {
		const providers = await db
			.select()
			.from(oauthProviders)
			.where(eq(oauthProviders.enabled, true));

		return providers.map((p) => ({
			providerId: p.providerId,
			clientId: p.clientId,
			clientSecret: p.clientSecret,
			authorizationUrl: p.authorizationUrl,
			tokenUrl: p.tokenUrl,
			userInfoUrl: p.userInfoUrl || undefined,
			scopes: p.scopes.split(" "),
			pkce: true,
			redirectURI: `${env.NEXT_PUBLIC_APP_URL}/api/auth/callback/${p.providerId}`,
		}));
	} catch (error) {
		console.error("Error loading OAuth providers from database:", error);
		return [];
	}
}

// Load OAuth providers from database (top-level await supported in Node 24+)
const allOAuthProviders = await loadOAuthProvidersFromDB();

/**
 * Better Auth Instance
 * Configured with Drizzle adapter for database operations
 * Dynamically loads OAuth providers from database
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
	plugins: [
		// Load OAuth providers dynamically from database
		...(allOAuthProviders.length > 0
			? [genericOAuth({ config: allOAuthProviders })]
			: []),
	],
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // 1 day
	},
	user: {
		additionalFields: {
			isGlobalAdmin: {
				type: "boolean",
				default: false,
				required: false,
			},
		},
	},
	basePath: "/api/auth",
	baseURL: env.NEXT_PUBLIC_APP_URL,
	secret: env.BETTER_AUTH_SECRET,
});

/**
 * Get enabled OAuth providers from database
 * Use this function to display available providers in the login UI
 */
export async function getEnabledOAuthProviders() {
	try {
		return await db
			.select()
			.from(oauthProviders)
			.where(eq(oauthProviders.enabled, true));
	} catch (error) {
		console.error("Error fetching OAuth providers:", error);
		return [];
	}
}

/**
 * Note on Hot Reload:
 * Since better-auth config is created at module load time (top-level await),
 * changes to OAuth providers in the database require an application restart
 * to take effect. This is the recommended approach from better-auth.
 *
 * For immediate effect without restart, consider implementing a custom OAuth
 * handler that checks the database on each request, but this is more complex
 * and not covered in the standard better-auth pattern.
 */

/**
 * Export auth types for type safety
 */
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
