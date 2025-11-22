/**
 * Database Schema
 * Using Drizzle ORM with drizzle-zod for automatic Zod schema generation
 * Auth tables are managed by better-auth
 */

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Todos Table
 * Stores user todo items with completion status
 * TODO: Add userId foreign key when implementing auth-protected todos
 */
export const todos = sqliteTable("todos", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	description: text("description").notNull(),
	completed: integer("completed", { mode: "boolean" }).notNull().default(false),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
	// userId: text("user_id").references(() => user.id), // Uncomment when auth is enabled
});

/**
 * OAuth Providers Table
 * Stores configurable OAuth provider configurations for dynamic authentication
 */
export const oauthProviders = sqliteTable("oauth_providers", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(), // Display name
	providerId: text("provider_id").notNull().unique(), // Unique identifier for the provider
	clientId: text("client_id").notNull(),
	clientSecret: text("client_secret").notNull(), // Should be encrypted in production
	authorizationUrl: text("authorization_url").notNull(),
	tokenUrl: text("token_url").notNull(),
	userInfoUrl: text("user_info_url"), // Optional
	scopes: text("scopes").notNull().default("openid profile email"), // Space-separated
	enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date())
		.$onUpdate(() => new Date()),
});

/**
 * Auth Tables (managed by better-auth)
 * These tables are automatically created and managed by better-auth:
 * - user: Stores user accounts
 * - session: Stores active sessions
 * - account: Stores OAuth accounts (if using social auth)
 * - verification: Stores email verification tokens
 *
 * Better-auth will create these tables automatically on first run.
 * You can export them from better-auth if you need to reference them:
 * import { user, session, account, verification } from "better-auth/schema"
 */

/**
 * Zod Schemas
 * Auto-generated from Drizzle schema with additional validation
 */

// Todos schemas
export const insertTodoSchema = createInsertSchema(todos, {
	description: z.string().min(1, "Description is required").max(500),
	completed: z.boolean().default(false),
});

export const selectTodoSchema = createSelectSchema(todos);

export const createTodoFormSchema = insertTodoSchema.omit({
	id: true,
	createdAt: true,
});

export const updateTodoSchema = insertTodoSchema
	.partial()
	.required({ id: true });

// OAuth Providers schemas
export const insertOAuthProviderSchema = createInsertSchema(oauthProviders, {
	name: z.string().min(1, "Provider name is required").max(100),
	providerId: z
		.string()
		.min(1, "Provider ID is required")
		.max(50)
		.regex(
			/^[a-z0-9-]+$/,
			"Provider ID must be lowercase alphanumeric with hyphens only",
		),
	clientId: z.string().min(1, "Client ID is required"),
	clientSecret: z.string().min(1, "Client Secret is required"),
	authorizationUrl: z.string().url("Must be a valid URL"),
	tokenUrl: z.string().url("Must be a valid URL"),
	userInfoUrl: z.string().url("Must be a valid URL").optional(),
	scopes: z
		.string()
		.min(1, "Scopes are required")
		.default("openid profile email"),
	enabled: z.boolean().default(true),
});

export const selectOAuthProviderSchema = createSelectSchema(oauthProviders);

export const createOAuthProviderFormSchema = insertOAuthProviderSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

export const updateOAuthProviderFormSchema = insertOAuthProviderSchema
	.omit({
		createdAt: true,
		updatedAt: true,
	})
	.partial()
	.required({ id: true });

/**
 * TypeScript Types
 * Inferred from Drizzle and Zod schemas
 */
export type Todo = typeof todos.$inferSelect;
export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type CreateTodoForm = z.infer<typeof createTodoFormSchema>;
export type UpdateTodo = z.infer<typeof updateTodoSchema>;

export type OAuthProvider = typeof oauthProviders.$inferSelect;
export type InsertOAuthProvider = z.infer<typeof insertOAuthProviderSchema>;
export type CreateOAuthProviderForm = z.infer<
	typeof createOAuthProviderFormSchema
>;
export type UpdateOAuthProviderForm = z.infer<
	typeof updateOAuthProviderFormSchema
>;
