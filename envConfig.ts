import { loadEnvConfig } from "@next/env";
import { z } from "zod";

// Load environment variables from .env.local, .env, etc.
const projectDir = process.cwd();
loadEnvConfig(projectDir);

// Define validation schema for environment variables
const envSchema = z.object({
	// Server-side only variables
	DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
	DATABASE_AUTH_TOKEN: z.string().optional(), // Optional for local SQLite

	// Authentication (better-auth) - Required for production
	BETTER_AUTH_SECRET: z
		.string()
		.min(32, "BETTER_AUTH_SECRET must be at least 32 characters")
		.default("development-secret-change-in-production-min-32-chars"),

	// AI Provider API Keys (all optional, but at least one recommended)
	OPENAI_API_KEY: z.string().optional(),
	ANTHROPIC_API_KEY: z.string().optional(),
	GOOGLE_API_KEY: z.string().optional(),

	// Optional: Social Auth Providers (uncomment if using)
	// GITHUB_CLIENT_ID: z.string().min(1).optional(),
	// GITHUB_CLIENT_SECRET: z.string().min(1).optional(),
	// GOOGLE_CLIENT_ID: z.string().min(1).optional(),
	// GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),

	// Custom OAuth IDP Configuration
	OAUTH_IDP_ENABLED: z
		.string()
		.optional()
		.default("false")
		.transform((val) => val === "true"),
	OAUTH_IDP_NAME: z.string().optional().default("Custom IDP"), // Display name for the IDP
	OAUTH_IDP_CLIENT_ID: z.string().optional(),
	OAUTH_IDP_CLIENT_SECRET: z.string().optional(),
	OAUTH_IDP_AUTHORIZATION_ENDPOINT: z.string().url().optional(), // e.g., https://idp.example.com/oauth/authorize
	OAUTH_IDP_TOKEN_ENDPOINT: z.string().url().optional(), // e.g., https://idp.example.com/oauth/token
	OAUTH_IDP_USERINFO_ENDPOINT: z.string().url().optional(), // e.g., https://idp.example.com/oauth/userinfo
	OAUTH_IDP_SCOPES: z.string().optional().default("openid profile email"), // Space-separated scopes

	// Application configuration
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),

	// Client-safe variables (NEXT_PUBLIC_ prefix)
	NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
	NEXT_PUBLIC_OAUTH_IDP_ENABLED: z
		.string()
		.optional()
		.default("false")
		.transform((val) => val === "true"),
	NEXT_PUBLIC_OAUTH_IDP_NAME: z.string().optional().default("Custom IDP"),
});

// Validate environment variables at startup
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
	throw new Error(JSON.stringify(z.treeifyError(parsed.error)));
}

// Export validated and typed environment variables
export const env = parsed.data;

// Usage:
// import { env } from "@/envConfig";
// const dbUrl = env.DATABASE_URL;
// const apiUrl = env.NEXT_PUBLIC_APP_URL;
