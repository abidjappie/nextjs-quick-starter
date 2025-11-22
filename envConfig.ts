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

	// Global Admin Configuration (required for system operator access)
	GLOBAL_ADMIN_EMAIL: z
		.email("GLOBAL_ADMIN_EMAIL must be a valid email")
		.default("admin@example.com"),
	GLOBAL_ADMIN_PASSWORD: z
		.string()
		.min(8, "GLOBAL_ADMIN_PASSWORD must be at least 8 characters")
		.default("admin123"), // Change this in production!

	// AI Provider API Keys (all optional, but at least one recommended)
	OPENAI_API_KEY: z.string().optional(),
	ANTHROPIC_API_KEY: z.string().optional(),
	GOOGLE_API_KEY: z.string().optional(),

	// Optional: Social Auth Providers (uncomment if using)
	// GITHUB_CLIENT_ID: z.string().min(1).optional(),
	// GITHUB_CLIENT_SECRET: z.string().min(1).optional(),
	// GOOGLE_CLIENT_ID: z.string().min(1).optional(),
	// GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),

	// Application configuration
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),

	// Client-safe variables (NEXT_PUBLIC_ prefix)
	NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
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
