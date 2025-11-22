"use client";

/**
 * Login Form Component
 * Handles email/password authentication with better-auth
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ClientSafeOAuthProvider } from "@/db/schema";
import { signIn } from "@/lib/auth-client";
import { useSafeCallbackUrl } from "@/lib/use-safe-callback-url";

interface LoginFormProps {
	oauthProviders: ClientSafeOAuthProvider[];
}

export function LoginForm({ oauthProviders }: LoginFormProps) {
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const callbackUrl = useSafeCallbackUrl("/");

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
		} catch (_err) {
			setError("An unexpected error occurred. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	/**
	 * Handle OAuth sign-in with dynamic provider
	 */
	async function handleOAuthSignIn(providerId: string) {
		setLoading(true);
		setError("");

		try {
			await signIn.social(
				{
					provider: providerId,
					callbackURL: callbackUrl,
				},
				{
					onError: (ctx) => {
						setError(ctx.error.message || "OAuth sign-in failed");
						setLoading(false);
					},
				},
			);
			// Note: User will be redirected to IDP, so loading state persists
		} catch (_err) {
			setError("An unexpected error occurred. Please try again.");
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
							<label htmlFor="email" className="block text-sm font-medium mb-2">
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
					</form>

					{/* OAuth Sign-in - Dynamic providers from database */}
					{oauthProviders.length > 0 && (
						<>
							{/* OAuth Divider */}
							<div className="relative my-6">
								<div className="absolute inset-0 flex items-center">
									<span className="w-full border-t" />
								</div>
								<div className="relative flex justify-center text-xs uppercase">
									<span className="bg-card px-2 text-muted-foreground">
										Or continue with
									</span>
								</div>
							</div>

							{/* OAuth Sign-in Buttons */}
							<div className="space-y-2">
								{oauthProviders.map((provider) => (
									<button
										key={provider.id}
										type="button"
										onClick={() => handleOAuthSignIn(provider.providerId)}
										disabled={loading}
										className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
									>
										<svg
											className="w-5 h-5"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											aria-hidden="true"
										>
											<title>{provider.name} Authentication Icon</title>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
											/>
										</svg>
										Sign in with {provider.name}
									</button>
								))}
							</div>
						</>
					)}

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
