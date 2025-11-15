/**
 * Todo Form Component
 * Client Component using React 19's useActionState and useFormStatus
 * Demonstrates form handling with Server Actions and Zod validation
 */

"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createTodo } from "./actions";

/**
 * Submit Button
 * Uses useFormStatus to show pending state
 * Must be a child of the form to access form status
 */
function SubmitButton() {
	const { pending } = useFormStatus();

	return (
		<button
			type="submit"
			disabled={pending}
			className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
		>
			{pending ? "Adding..." : "Add Todo"}
		</button>
	);
}

/**
 * Todo Form Component
 * Uses React 19's useActionState for progressive enhancement
 */
export function TodoForm() {
	const [state, formAction] = useActionState(createTodo, null);

	return (
		<div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
			<h2 className="text-xl font-semibold mb-4">Add New Todo</h2>

			<form action={formAction} className="space-y-4">
				<div>
					<label
						htmlFor="description"
						className="block text-sm font-medium mb-2"
					>
						Description
					</label>
					<input
						type="text"
						id="description"
						name="description"
						required
						placeholder="What needs to be done?"
						className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
					/>
					{state && !state.success && state.errors?.description && (
						<p className="text-destructive text-sm mt-1">
							{state.errors.description[0]}
						</p>
					)}
				</div>

				<div className="flex items-center justify-between">
					<SubmitButton />
					{state?.success && (
						<p className="text-green-600 text-sm">Todo added successfully!</p>
					)}
					{state && !state.success && state.errors?._form && (
						<p className="text-destructive text-sm">{state.errors._form[0]}</p>
					)}
				</div>
			</form>
		</div>
	);
}

