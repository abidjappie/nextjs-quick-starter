/**
 * User Menu Component
 * Displays authentication state and user options
 * Client Component using better-auth hooks
 */

"use client";

import { useSession, signOut } from "@/lib/auth-client";
import Link from "next/link";

/**
 * User Menu Component
 * Shows login/register buttons or user info with logout
 */
export function UserMenu() {
	const { data: session, isPending } = useSession();

	// Loading state
	if (isPending) {
		return (
			<div className="flex items-center gap-2">
				<div className="h-8 w-20 bg-muted animate-pulse rounded-md" />
			</div>
		);
	}

	// Not authenticated - show login/register buttons
	if (!session) {
		return (
			<div className="flex items-center gap-2">
				<Link
					href="/login"
					className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
				>
					Sign In
				</Link>
				<Link
					href="/register"
					className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
				>
					Sign Up
				</Link>
			</div>
		);
	}

	// Authenticated - show user info and logout
	return (
		<div className="flex items-center gap-4">
			<div className="hidden sm:block text-right">
				<p className="text-sm font-medium">{session.user.name}</p>
				<p className="text-xs text-muted-foreground">{session.user.email}</p>
			</div>
			<div className="flex items-center gap-2">
				<Link
					href="/dashboard"
					className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
				>
					Dashboard
				</Link>
				<button
					onClick={() => signOut()}
					className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-destructive hover:text-destructive-foreground h-9 px-4 py-2"
				>
					Sign Out
				</button>
			</div>
		</div>
	);
}

