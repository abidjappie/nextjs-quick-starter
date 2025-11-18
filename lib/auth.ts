/**
 * Better Auth Configuration
 * Authentication setup using better-auth with Drizzle ORM
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { genericOAuth } from "better-auth/plugins";
import * as schema from "@/auth-schema";
import { db } from "@/db";
import { env } from "@/envConfig";

/**
 * Better Auth Instance
 * Configured with Drizzle adapter for database operations
 * With custom OAuth IDP support via genericOAuth plugin
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
	// Optional: Built-in social providers
	// socialProviders: {
	//   github: {
	//     clientId: env.GITHUB_CLIENT_ID || "",
	//     clientSecret: env.GITHUB_CLIENT_SECRET || "",
	//   },
	//   google: {
	//     clientId: env.GOOGLE_CLIENT_ID || "",
	//     clientSecret: env.GOOGLE_CLIENT_SECRET || "",
	//   },
	// },
	plugins: [
		// Custom OAuth IDP Configuration
		...(env.OAUTH_IDP_ENABLED &&
		env.OAUTH_IDP_CLIENT_ID &&
		env.OAUTH_IDP_CLIENT_SECRET &&
		env.OAUTH_IDP_AUTHORIZATION_ENDPOINT &&
		env.OAUTH_IDP_TOKEN_ENDPOINT
			? [
					genericOAuth({
						config: [
							{
								providerId: "custom-idp",
								discoveryUrl: env.OAUTH_IDP_USERINFO_ENDPOINT
									? undefined
									: `${env.OAUTH_IDP_AUTHORIZATION_ENDPOINT.split("/oauth")[0]}/.well-known/openid-configuration`,
								clientId: env.OAUTH_IDP_CLIENT_ID,
								clientSecret: env.OAUTH_IDP_CLIENT_SECRET,
								authorizationUrl: env.OAUTH_IDP_AUTHORIZATION_ENDPOINT,
								tokenUrl: env.OAUTH_IDP_TOKEN_ENDPOINT,
								userInfoUrl: env.OAUTH_IDP_USERINFO_ENDPOINT,
								scopes: env.OAUTH_IDP_SCOPES.split(" "),
								redirectURI: `${env.NEXT_PUBLIC_APP_URL}/api/auth/callback/custom-idp`,
								// Map the user info response to better-auth user format
								pkce: true, // Use PKCE for enhanced security
							},
						],
					}),
				]
			: []),
	],
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
