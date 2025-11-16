/**
 * Home Page
 * Server Component that fetches todos from the database
 * Demonstrates Next.js 16 + React 19 best practices
 */

import { desc } from "drizzle-orm";
import { Suspense } from "react";
import { TodoForm } from "@/components/todo-form";
import { TodoList } from "@/components/todo-list";
import { UserMenu } from "@/components/user-menu";
import { db } from "@/db";
import { todos } from "@/db/schema";

/**
 * Fetch todos from database
 * This runs on the server and is cached by default
 */
async function getTodos() {
	try {
		return await db.select().from(todos).orderBy(desc(todos.createdAt));
	} catch (error) {
		console.error("Failed to fetch todos:", error);
		return [];
	}
}

/**
 * Loading skeleton for todo list
 */
function TodoListSkeleton() {
	return (
		<div className="space-y-2" aria-busy="true">
			<span className="sr-only">Loading todos...</span>
			{[1, 2, 3].map((i) => (
				<div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
			))}
		</div>
	);
}

/**
 * Home Page Component
 * Server Component that fetches data and delegates interactivity to Client Components
 */
export default async function Page() {
	const todoList = await getTodos();

	return (
		<main className="container mx-auto px-4 py-8 max-w-2xl">
			{/* User Menu */}
			<div className="mb-6 flex justify-end">
				<UserMenu />
			</div>

			{/* Header */}
			<div className="mb-8">
				<h1 className="text-4xl font-bold tracking-tight mb-2">
					Next.js Quick Starter
				</h1>
				<p className="text-muted-foreground">
					Modern todo app demonstrating Next.js 16, React 19, Drizzle ORM, and
					Zod validation
				</p>
			</div>

			{/* Todo Form - Client Component */}
			<div className="mb-8">
				<TodoForm />
			</div>

			{/* Todo List - Client Component with Suspense */}
			<Suspense fallback={<TodoListSkeleton />}>
				<TodoList todos={todoList} />
			</Suspense>

			{/* Footer */}
			<footer className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
				<p>
					Built with Next.js 16, React 19, Drizzle ORM, TanStack libraries, and
					Zod
				</p>
			</footer>
		</main>
	);
}
