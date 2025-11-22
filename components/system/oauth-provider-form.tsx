"use client";

/**
 * OAuth Provider Form Component
 * Form for creating and editing OAuth providers
 */

import { Eye, EyeOff, X } from "lucide-react";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { createOAuthProvider, updateOAuthProvider } from "@/app/system/actions";
import type { OAuthProvider } from "@/db/schema";

interface OAuthProviderFormProps {
	provider?: OAuthProvider;
	onClose: () => void;
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
	const { pending } = useFormStatus();

	return (
		<button
			type="submit"
			disabled={pending}
			className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
		>
			{pending ? "Saving..." : isEdit ? "Update Provider" : "Create Provider"}
		</button>
	);
}

export function OAuthProviderForm({
	provider,
	onClose,
}: OAuthProviderFormProps) {
	const [showSecret, setShowSecret] = useState(false);
	const [providerId, setProviderId] = useState(provider?.providerId || "");
	const isEdit = !!provider;

	const action = isEdit ? updateOAuthProvider : createOAuthProvider;

	// Generate the redirect URI dynamically
	const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
	const redirectUri = providerId
		? `${appUrl}/api/auth/callback/${providerId}`
		: `${appUrl}/api/auth/callback/{provider-id}`;

	const [state, formAction] = useActionState(
		async (_prevState: unknown, formData: FormData) => {
			const result = await action(formData);

			if (result.success) {
				toast.success(isEdit ? "Provider updated" : "Provider created", {
					description: `The OAuth provider has been ${isEdit ? "updated" : "created"} successfully.`,
				});
				// Refresh the page to show updated list
				window.location.reload();
			}

			return result;
		},
		null,
	);

	return (
		<div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
			<div className="fixed inset-0 flex items-center justify-center p-4">
				<div className="w-full max-w-2xl rounded-lg border bg-background p-6 shadow-lg">
					<div className="mb-6 flex items-center justify-between">
						<div>
							<h2 className="text-2xl font-bold">
								{isEdit ? "Edit OAuth Provider" : "Add OAuth Provider"}
							</h2>
							<p className="text-sm text-muted-foreground">
								{isEdit
									? "Update the OAuth provider configuration"
									: "Configure a new OAuth authentication provider"}
							</p>
						</div>
						<button
							type="button"
							onClick={onClose}
							className="rounded-md p-2 hover:bg-accent"
						>
							<X className="h-5 w-5" />
						</button>
					</div>

					<form action={formAction} className="space-y-4">
						{isEdit && <input type="hidden" name="id" value={provider.id} />}

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="name"
									className="block text-sm font-medium mb-2"
								>
									Provider Name *
								</label>
								<input
									type="text"
									id="name"
									name="name"
									defaultValue={provider?.name}
									required
									placeholder="e.g., Google Workspace"
									className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
								/>
								{state?.errors?.name && (
									<p className="mt-1 text-sm text-red-600">
										{state.errors.name[0]}
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="providerId"
									className="block text-sm font-medium mb-2"
								>
									Provider ID *
								</label>
								<input
									type="text"
									id="providerId"
									name="providerId"
									value={providerId}
									onChange={(e) =>
										setProviderId(
											e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
										)
									}
									required
									placeholder="e.g., google-workspace"
									disabled={isEdit}
									className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								/>
								{state?.errors?.providerId && (
									<p className="mt-1 text-sm text-red-600">
										{state.errors.providerId[0]}
									</p>
								)}
								{isEdit ? (
									<p className="mt-1 text-xs text-muted-foreground">
										Provider ID cannot be changed after creation
									</p>
								) : (
									<p className="mt-1 text-xs text-muted-foreground">
										Use lowercase letters, numbers, and hyphens only
									</p>
								)}
							</div>
						</div>

						{/* Redirect URI Notice */}
						{providerId && (
							<div className="rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/50">
								<p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
									📋 Redirect URI (add this to your OAuth provider):
								</p>
								<code className="block bg-white dark:bg-gray-900 rounded px-2 py-1.5 text-xs font-mono text-blue-900 dark:text-blue-100 break-all">
									{redirectUri}
								</code>
							</div>
						)}

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="clientId"
									className="block text-sm font-medium mb-2"
								>
									Client ID *
								</label>
								<input
									type="text"
									id="clientId"
									name="clientId"
									defaultValue={provider?.clientId}
									required
									placeholder="OAuth client ID"
									className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
								/>
								{state?.errors?.clientId && (
									<p className="mt-1 text-sm text-red-600">
										{state.errors.clientId[0]}
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="clientSecret"
									className="block text-sm font-medium mb-2"
								>
									Client Secret *
								</label>
								<div className="relative">
									<input
										type={showSecret ? "text" : "password"}
										id="clientSecret"
										name="clientSecret"
										defaultValue={provider?.clientSecret}
										required
										placeholder="OAuth client secret"
										className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
									/>
									<button
										type="button"
										onClick={() => setShowSecret(!showSecret)}
										className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-accent"
									>
										{showSecret ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</button>
								</div>
								{state?.errors?.clientSecret && (
									<p className="mt-1 text-sm text-red-600">
										{state.errors.clientSecret[0]}
									</p>
								)}
							</div>
						</div>

						<div>
							<label
								htmlFor="authorizationUrl"
								className="block text-sm font-medium mb-2"
							>
								Authorization URL *
							</label>
							<input
								type="url"
								id="authorizationUrl"
								name="authorizationUrl"
								defaultValue={provider?.authorizationUrl}
								required
								placeholder="https://provider.com/oauth/authorize"
								className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							/>
							{state?.errors?.authorizationUrl && (
								<p className="mt-1 text-sm text-red-600">
									{state.errors.authorizationUrl[0]}
								</p>
							)}
						</div>

						<div>
							<label
								htmlFor="tokenUrl"
								className="block text-sm font-medium mb-2"
							>
								Token URL *
							</label>
							<input
								type="url"
								id="tokenUrl"
								name="tokenUrl"
								defaultValue={provider?.tokenUrl}
								required
								placeholder="https://provider.com/oauth/token"
								className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							/>
							{state?.errors?.tokenUrl && (
								<p className="mt-1 text-sm text-red-600">
									{state.errors.tokenUrl[0]}
								</p>
							)}
						</div>

						<div>
							<label
								htmlFor="userInfoUrl"
								className="block text-sm font-medium mb-2"
							>
								User Info URL (Optional)
							</label>
							<input
								type="url"
								id="userInfoUrl"
								name="userInfoUrl"
								defaultValue={provider?.userInfoUrl || ""}
								placeholder="https://provider.com/oauth/userinfo"
								className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							/>
							{state?.errors?.userInfoUrl && (
								<p className="mt-1 text-sm text-red-600">
									{state.errors.userInfoUrl[0]}
								</p>
							)}
						</div>

						<div>
							<label
								htmlFor="scopes"
								className="block text-sm font-medium mb-2"
							>
								Scopes *
							</label>
							<input
								type="text"
								id="scopes"
								name="scopes"
								defaultValue={provider?.scopes || "openid profile email"}
								required
								placeholder="openid profile email"
								className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							/>
							<p className="mt-1 text-xs text-muted-foreground">
								Space-separated OAuth scopes
							</p>
							{state?.errors?.scopes && (
								<p className="mt-1 text-sm text-red-600">
									{state.errors.scopes[0]}
								</p>
							)}
						</div>

						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								id="enabled"
								name="enabled"
								defaultChecked={provider?.enabled ?? true}
								className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
							/>
							<label htmlFor="enabled" className="text-sm font-medium">
								Enable this provider
							</label>
						</div>

						{state?.error && (
							<div className="rounded-md bg-red-50 p-4 dark:bg-red-950">
								<p className="text-sm text-red-800 dark:text-red-200">
									{state.error}
								</p>
							</div>
						)}

						<div className="flex justify-end gap-2 pt-4">
							<button
								type="button"
								onClick={onClose}
								className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							>
								Cancel
							</button>
							<SubmitButton isEdit={isEdit} />
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
