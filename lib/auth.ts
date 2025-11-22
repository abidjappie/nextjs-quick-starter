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
import { safeDecrypt } from "@/lib/encryption";

/**
 * Load OAuth providers from database with decrypted secrets
 * Returns configurations ready for better-auth
 */
async function loadOAuthProvidersFromDB() {
	const providers = await db
		.select()
		.from(oauthProviders)
		.where(eq(oauthProviders.enabled, true))
		.catch(() => []);

	const decryptedProviders = await Promise.all(
		providers.map(async (p) => {
			const clientSecret = await safeDecrypt(p.clientSecret);
			if (!clientSecret) {
				console.warn(`Skipping provider ${p.providerId}: decryption failed`);
				return null;
			}

			return {
				providerId: p.providerId,
				clientId: p.clientId,
				clientSecret,
				authorizationUrl: p.authorizationUrl,
				tokenUrl: p.tokenUrl,
				userInfoUrl: p.userInfoUrl || undefined,
				scopes: p.scopes.split(" "),
				pkce: true,
				redirectURI: `${env.NEXT_PUBLIC_APP_URL}/api/auth/callback/${p.providerId}`,
			};
		}),
	);

	return decryptedProviders.filter(
		(p): p is NonNullable<typeof p> => p !== null,
	);
}

// Load OAuth providers from database
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
