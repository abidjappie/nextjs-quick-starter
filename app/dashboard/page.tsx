/**
 * Dashboard Page
 * Protected route that requires authentication
 * Demonstrates session access in Server Components
 */

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

/**
 * Dashboard Page Component
 * Server Component with authentication check
 */
export default async function DashboardPage() {
	// Get session from better-auth
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	// Redirect to login if not authenticated
	if (!session) {
		redirect("/login");
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-4xl font-bold tracking-tight mb-2">Dashboard</h1>
				<p className="text-muted-foreground">
					Welcome back, {session.user.name}!
				</p>
			</div>

			{/* User Info Card */}
			<div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm mb-6">
				<h2 className="text-xl font-semibold mb-4">Your Account</h2>
				<div className="space-y-3">
					<div className="flex items-center justify-between py-2 border-b">
						<span className="text-sm font-medium text-muted-foreground">
							Name
						</span>
						<span className="text-sm font-medium">{session.user.name}</span>
					</div>
					<div className="flex items-center justify-between py-2 border-b">
						<span className="text-sm font-medium text-muted-foreground">
							Email
						</span>
						<span className="text-sm font-medium">{session.user.email}</span>
					</div>
					<div className="flex items-center justify-between py-2">
						<span className="text-sm font-medium text-muted-foreground">
							User ID
						</span>
						<span className="text-sm font-mono">{session.user.id}</span>
					</div>
				</div>
			</div>

			{/* Quick Actions */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
				<Link
					href="/"
					className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm hover:bg-accent transition-colors"
				>
					<h3 className="text-lg font-semibold mb-2">View Todos</h3>
					<p className="text-sm text-muted-foreground">
						Manage your todo list and track your tasks
					</p>
				</Link>

				<div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm opacity-50">
					<h3 className="text-lg font-semibold mb-2">Settings</h3>
					<p className="text-sm text-muted-foreground">
						Update your profile and preferences (Coming soon)
					</p>
				</div>
			</div>

			{/* Info Box */}
			<div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-sm">
				<p className="text-foreground">
					<strong>🎉 Authentication is working!</strong> This page is protected
					by better-auth. Only authenticated users can see this content.
				</p>
			</div>

			{/* Back Link */}
			<div className="mt-6 text-center">
				<Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
					← Back to home
				</Link>
			</div>
		</div>
	);
}

