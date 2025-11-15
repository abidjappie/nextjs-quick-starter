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

// Insert schema with field validation
export const insertTodoSchema = createInsertSchema(todos, {
	description: z.string().min(1, "Description is required").max(500),
	completed: z.boolean().default(false),
});

// Select schema for query results
export const selectTodoSchema = createSelectSchema(todos);

// Form-specific schema (omit auto-generated fields)
export const createTodoFormSchema = insertTodoSchema.omit({
	id: true,
	createdAt: true,
});

// Update schema (all fields optional except id)
export const updateTodoSchema = insertTodoSchema
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
