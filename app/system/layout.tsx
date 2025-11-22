/**
 * System Layout
 * Protected layout for system operator pages
 * Only accessible by global admin users
 */

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const metadata = {
	title: "System | Admin Panel",
	description: "System administration and configuration",
};

export default async function SystemLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// Check authentication
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	// Redirect to login if not authenticated
	if (!session?.user) {
		redirect("/login?callbackUrl=/system");
	}

	// Check if user is global admin
	// @ts-expect-error - isGlobalAdmin is added to the user type via better-auth
	if (!session.user.isGlobalAdmin) {
		// Not a global admin, redirect to dashboard
		redirect("/dashboard");
	}

	return (
		<div className="min-h-screen bg-background">
			<header className="border-b">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold">System Administration</h1>
							<p className="text-sm text-muted-foreground">
								Global admin panel - {session.user.email}
							</p>
						</div>
						<div className="flex items-center gap-4">
							<a
								href="/dashboard"
								className="text-sm text-muted-foreground hover:text-foreground"
							>
								← Back to Dashboard
							</a>
						</div>
					</div>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8">
				{/* Warning banner about restart requirement */}
				<div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
					<div className="flex">
						<div className="flex-shrink-0">
							<svg
								className="h-5 w-5 text-yellow-400"
								viewBox="0 0 20 20"
								fill="currentColor"
								aria-hidden="true"
							>
								<path
									fillRule="evenodd"
									d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
						<div className="ml-3">
							<h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
								Important Notice
							</h3>
							<p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
								Changes to OAuth provider configurations require an application
								restart to take effect. This is the recommended pattern from
								better-auth for security and stability.
							</p>
						</div>
					</div>
				</div>

				{children}
			</main>
		</div>
	);
}
