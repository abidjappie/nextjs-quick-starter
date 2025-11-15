/**
 * Todo List Component
 * Client Component for displaying and interacting with todos
 * Demonstrates optimistic updates and Server Actions
 */

"use client";

import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import type { Todo } from "@/db/schema";
import { deleteTodo, toggleTodo } from "./actions";

interface TodoListProps {
	todos: Todo[];
}

/**
 * Todo Item Component
 * Individual todo with toggle and delete actions
 */
function TodoItem({
	todo,
	onToggle,
	onDelete,
}: {
	todo: Todo;
	onToggle: (id: number) => void;
	onDelete: (id: number) => void;
}) {
	return (
		<div className="flex items-center gap-3 p-4 bg-card border rounded-lg hover:shadow-md transition-shadow group">
			{/* Checkbox */}
			<input
				type="checkbox"
				checked={todo.completed}
				onChange={() => onToggle(todo.id)}
				className="w-5 h-5 rounded border-input focus:ring-2 focus:ring-ring cursor-pointer"
				aria-label={`Mark "${todo.description}" as ${todo.completed ? "incomplete" : "complete"}`}
			/>

			{/* Description */}
			<span
				className={`flex-1 ${
					todo.completed
						? "line-through text-muted-foreground"
						: "text-foreground"
				}`}
			>
				{todo.description}
			</span>

			{/* Created date */}
			<span className="text-xs text-muted-foreground">
				{new Date(todo.createdAt).toLocaleDateString()}
			</span>

			{/* Delete button */}
			<button
				onClick={() => onDelete(todo.id)}
				className="opacity-0 group-hover:opacity-100 px-3 py-1 text-sm text-destructive hover:bg-destructive/10 rounded transition-all"
				aria-label={`Delete "${todo.description}"`}
			>
				Delete
			</button>
		</div>
	);
}

/**
 * Todo List Component
 * Uses optimistic updates for instant UI feedback
 */
export function TodoList({ todos: initialTodos }: TodoListProps) {
	const [isPending, startTransition] = useTransition();
	const [optimisticTodos, setOptimisticTodos] = useOptimistic(
		initialTodos,
		(state, action: { type: "toggle" | "delete"; id: number }) => {
			switch (action.type) {
				case "toggle":
					return state.map((todo) =>
						todo.id === action.id
							? { ...todo, completed: !todo.completed }
							: todo,
					);
				case "delete":
					return state.filter((todo) => todo.id !== action.id);
				default:
					return state;
			}
		},
	);

	const handleToggle = (id: number) => {
		const todo = optimisticTodos.find((t) => t.id === id);
		startTransition(async () => {
			setOptimisticTodos({ type: "toggle", id });
			const result = await toggleTodo(id);

			if (result.success) {
				// Show different messages based on the new state
				if (todo?.completed) {
					toast.info("Todo marked as incomplete", {
						description: "Keep up the good work!",
					});
				} else {
					toast.success("Todo completed!", {
						description: "Great job! 🎉",
					});
				}
			} else if (result.errors?._form) {
				toast.error("Failed to update todo", {
					description: result.errors._form[0],
				});
			}
		});
	};

	const handleDelete = (id: number) => {
		const todo = optimisticTodos.find((t) => t.id === id);
		startTransition(async () => {
			setOptimisticTodos({ type: "delete", id });
			const result = await deleteTodo(id);

			if (result.success) {
				toast.success("Todo deleted", {
					description: "The todo has been removed from your list.",
				});
			} else if (result.errors?._form) {
				toast.error("Failed to delete todo", {
					description: result.errors._form[0],
				});
			}
		});
	};

	// Group todos by completion status
	const activeTodos = optimisticTodos.filter((todo) => !todo.completed);
	const completedTodos = optimisticTodos.filter((todo) => todo.completed);

	if (optimisticTodos.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground text-lg">No todos yet</p>
				<p className="text-muted-foreground text-sm mt-2">
					Add your first todo above to get started!
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Active Todos */}
			{activeTodos.length > 0 && (
				<div>
					<h2 className="text-lg font-semibold mb-3">
						Active ({activeTodos.length})
					</h2>
					<div className="space-y-2">
						{activeTodos.map((todo) => (
							<TodoItem
								key={todo.id}
								todo={todo}
								onToggle={handleToggle}
								onDelete={handleDelete}
							/>
						))}
					</div>
				</div>
			)}

			{/* Completed Todos */}
			{completedTodos.length > 0 && (
				<div>
					<h2 className="text-lg font-semibold mb-3">
						Completed ({completedTodos.length})
					</h2>
					<div className="space-y-2">
						{completedTodos.map((todo) => (
							<TodoItem
								key={todo.id}
								todo={todo}
								onToggle={handleToggle}
								onDelete={handleDelete}
							/>
						))}
					</div>
				</div>
			)}

			{/* Loading indicator */}
			{isPending && (
				<div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg">
					Updating...
				</div>
			)}
		</div>
	);
}

