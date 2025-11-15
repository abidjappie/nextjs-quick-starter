/**
 * Login Page
 * Client Component for user authentication
 * Uses better-auth for email/password login
 */

"use client";

import { signIn } from "@/lib/auth-client";
import { useState, useActionState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

/**
 * Login Page Component
 * Handles email/password authentication with better-auth
 */
export default function LoginPage() {
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl") || "/";

	/**
	 * Handle form submission
	 * Validates and submits credentials to better-auth
	 */
	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);
		setError("");

		const formData = new FormData(e.currentTarget);
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;

		try {
			await signIn.email(
				{
					email,
					password,
				},
				{
					onSuccess: () => {
						router.push(callbackUrl);
					},
					onError: (ctx) => {
						setError(ctx.error.message || "Invalid email or password");
					},
				},
			);
		} catch (err) {
			setError("An unexpected error occurred. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-background px-4">
			<div className="w-full max-w-md">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold tracking-tight mb-2">
						Welcome Back
					</h1>
					<p className="text-muted-foreground">
						Sign in to your account to continue
					</p>
				</div>

				{/* Login Form */}
				<div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Email Field */}
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium mb-2"
							>
								Email
							</label>
							<input
								type="email"
								id="email"
								name="email"
								required
								autoComplete="email"
								placeholder="you@example.com"
								className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
								disabled={loading}
							/>
						</div>

						{/* Password Field */}
						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium mb-2"
							>
								Password
							</label>
							<input
								type="password"
								id="password"
								name="password"
								required
								autoComplete="current-password"
								placeholder="Enter your password"
								className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
								disabled={loading}
							/>
						</div>

						{/* Error Message */}
						{error && (
							<div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
								{error}
							</div>
						)}

						{/* Submit Button */}
						<button
							type="submit"
							disabled={loading}
							className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
						>
							{loading ? "Signing in..." : "Sign In"}
						</button>

						{/* Divider */}
						<div className="relative my-6">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-card px-2 text-muted-foreground">
									Don't have an account?
								</span>
							</div>
						</div>

						{/* Register Link */}
						<div className="text-center">
							<Link
								href="/register"
								className="text-sm text-primary hover:underline"
							>
								Create an account
							</Link>
						</div>
					</form>
				</div>

				{/* Back to Home */}
				<div className="text-center mt-6">
					<Link
						href="/"
						className="text-sm text-muted-foreground hover:text-foreground"
					>
						← Back to home
					</Link>
				</div>
			</div>
		</div>
	);
}

