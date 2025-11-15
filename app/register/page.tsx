/**
 * Register Page
 * Client Component for user registration
 * Uses better-auth for email/password signup
 */

"use client";

import { signUp } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * Register Page Component
 * Handles new user registration with better-auth
 */
export default function RegisterPage() {
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	/**
	 * Handle form submission
	 * Validates and creates new user account
	 */
	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);
		setError("");

		const formData = new FormData(e.currentTarget);
		const name = formData.get("name") as string;
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;
		const confirmPassword = formData.get("confirmPassword") as string;

		// Validate passwords match
		if (password !== confirmPassword) {
			setError("Passwords do not match");
			setLoading(false);
			return;
		}

		// Validate password strength
		if (password.length < 8) {
			setError("Password must be at least 8 characters long");
			setLoading(false);
			return;
		}

		try {
			await signUp.email(
				{
					email,
					password,
					name,
				},
				{
					onSuccess: () => {
						router.push("/");
					},
					onError: (ctx) => {
						setError(
							ctx.error.message ||
								"Failed to create account. Email may already be in use.",
						);
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
						Create Account
					</h1>
					<p className="text-muted-foreground">
						Sign up to get started with your account
					</p>
				</div>

				{/* Register Form */}
				<div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Name Field */}
						<div>
							<label htmlFor="name" className="block text-sm font-medium mb-2">
								Full Name
							</label>
							<input
								type="text"
								id="name"
								name="name"
								required
								autoComplete="name"
								placeholder="John Doe"
								className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
								disabled={loading}
							/>
						</div>

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
								autoComplete="new-password"
								placeholder="At least 8 characters"
								minLength={8}
								className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
								disabled={loading}
							/>
							<p className="text-xs text-muted-foreground mt-1">
								Must be at least 8 characters long
							</p>
						</div>

						{/* Confirm Password Field */}
						<div>
							<label
								htmlFor="confirmPassword"
								className="block text-sm font-medium mb-2"
							>
								Confirm Password
							</label>
							<input
								type="password"
								id="confirmPassword"
								name="confirmPassword"
								required
								autoComplete="new-password"
								placeholder="Re-enter your password"
								minLength={8}
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
							{loading ? "Creating account..." : "Create Account"}
						</button>

						{/* Divider */}
						<div className="relative my-6">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-card px-2 text-muted-foreground">
									Already have an account?
								</span>
							</div>
						</div>

						{/* Login Link */}
						<div className="text-center">
							<Link
								href="/login"
								className="text-sm text-primary hover:underline"
							>
								Sign in instead
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

