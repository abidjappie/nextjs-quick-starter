/**
 * Server Actions
 * Using React 19's useActionState pattern with Zod validation
 */

"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { createTodoFormSchema, todos, updateTodoSchema } from "@/db/schema";

/**
 * Action result type for consistent error handling
 */
type ActionResult<T = void> =
	| { success: true; data?: T }
	| { success: false; errors: Record<string, string[]> };

/**
 * Create a new todo item
 * Validates input with Zod schema generated from Drizzle
 * TODO: Add authentication check when implementing auth-protected todos
 */
export async function createTodo(
	_prevState: unknown,
	formData: FormData,
): Promise<ActionResult> {
	try {
		// TODO: Uncomment when auth is enabled
		// const session = await auth.api.getSession({ headers: await headers() });
		// if (!session) {
		//   return {
		//     success: false,
		//     errors: { _form: ["You must be logged in to create todos"] },
		//   };
		// }

		// Validate input with Zod
		const result = createTodoFormSchema.safeParse({
			description: formData.get("description"),
			completed: formData.get("completed") === "true",
		});

		if (!result.success) {
			return {
				success: false,
				errors: result.error.flatten().fieldErrors,
			};
		}

		// Insert into database
		// TODO: Add userId when auth is enabled: { ...result.data, userId: session.user.id }
		await db.insert(todos).values(result.data);

		// Revalidate the page to show new data
		revalidatePath("/");

		return { success: true };
	} catch (error) {
		console.error("Failed to create todo:", error);
		return {
			success: false,
			errors: { _form: ["Failed to create todo"] },
		};
	}
}

/**
 * Update an existing todo item
 * Validates input with Zod schema
 * TODO: Add authentication check and ownership verification when implementing auth
 */
export async function updateTodo(
	_prevState: unknown,
	formData: FormData,
): Promise<ActionResult> {
	try {
		// TODO: Uncomment when auth is enabled
		// const session = await auth.api.getSession({ headers: await headers() });
		// if (!session) {
		//   return {
		//     success: false,
		//     errors: { _form: ["You must be logged in to update todos"] },
		//   };
		// }
		const id = formData.get("id");
		const description = formData.get("description");
		const completed = formData.get("completed");

		// Validate input
		const result = updateTodoSchema.safeParse({
			id: id ? Number(id) : undefined,
			description: description || undefined,
			completed: completed === "true",
		});

		if (!result.success) {
			return {
				success: false,
				errors: result.error.flatten().fieldErrors,
			};
		}

		// Update in database
		await db
			.update(todos)
			.set({
				description: result.data.description,
				completed: result.data.completed,
			})
			.where(eq(todos.id, result.data.id));

		revalidatePath("/");

		return { success: true };
	} catch (error) {
		console.error("Failed to update todo:", error);
		return {
			success: false,
			errors: { _form: ["Failed to update todo"] },
		};
	}
}

/**
 * Toggle todo completion status
 * Simple action for checkbox toggle
 * TODO: Add authentication check and ownership verification when implementing auth
 */
export async function toggleTodo(id: number): Promise<ActionResult> {
	try {
		// TODO: Uncomment when auth is enabled
		// const session = await auth.api.getSession({ headers: await headers() });
		// if (!session) {
		//   return {
		//     success: false,
		//     errors: { _form: ["You must be logged in to toggle todos"] },
		//   };
		// }

		// Get current todo
		const [todo] = await db.select().from(todos).where(eq(todos.id, id));

		// TODO: Verify ownership when auth is enabled
		// if (todo.userId !== session.user.id) {
		//   return {
		//     success: false,
		//     errors: { _form: ["You can only toggle your own todos"] },
		//   };
		// }

		if (!todo) {
			return {
				success: false,
				errors: { _form: ["Todo not found"] },
			};
		}

		// Toggle completion
		await db
			.update(todos)
			.set({ completed: !todo.completed })
			.where(eq(todos.id, id));

		revalidatePath("/");

		return { success: true };
	} catch (error) {
		console.error("Failed to toggle todo:", error);
		return {
			success: false,
			errors: { _form: ["Failed to toggle todo"] },
		};
	}
}

/**
 * Delete a todo item
 * TODO: Add authentication check and ownership verification when implementing auth
 */
export async function deleteTodo(id: number): Promise<ActionResult> {
	try {
		// TODO: Uncomment when auth is enabled
		// const session = await auth.api.getSession({ headers: await headers() });
		// if (!session) {
		//   return {
		//     success: false,
		//     errors: { _form: ["You must be logged in to delete todos"] },
		//   };
		// }

		// TODO: Verify ownership when auth is enabled
		// const [todo] = await db.select().from(todos).where(eq(todos.id, id));
		// if (!todo || todo.userId !== session.user.id) {
		//   return {
		//     success: false,
		//     errors: { _form: ["Todo not found or you don't have permission"] },
		//   };
		// }

		await db.delete(todos).where(eq(todos.id, id));

		revalidatePath("/");

		return { success: true };
	} catch (error) {
		console.error("Failed to delete todo:", error);
		return {
			success: false,
			errors: { _form: ["Failed to delete todo"] },
		};
	}
}
