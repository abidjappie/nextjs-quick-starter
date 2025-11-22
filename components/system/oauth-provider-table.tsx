"use client";

/**
 * OAuth Provider Table Component
 * Displays list of OAuth providers with actions
 */

import { useState } from "react";
import { toast } from "sonner";
import { deleteOAuthProvider, toggleOAuthProvider } from "@/app/system/actions";
import type { OAuthProvider } from "@/db/schema";
import { OAuthProviderForm } from "./oauth-provider-form";

interface OAuthProviderTableProps {
	providers: OAuthProvider[];
}

export function OAuthProviderTable({ providers }: OAuthProviderTableProps) {
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingProvider, setEditingProvider] = useState<
		OAuthProvider | undefined
	>(undefined);

	const handleEdit = (provider: OAuthProvider) => {
		setEditingProvider(provider);
		setIsFormOpen(true);
	};

	const handleDelete = async (id: number, name: string) => {
		if (
			!confirm(
				`Are you sure you want to delete the provider "${name}"? This action cannot be undone.`,
			)
		) {
			return;
		}

		const result = await deleteOAuthProvider(id);
		if (result.success) {
			toast.success("Provider deleted", {
				description: "The OAuth provider has been deleted successfully.",
			});
			// Refresh the page to show updated list
			window.location.reload();
		} else {
			toast.error("Failed to delete provider", {
				description: result.error || "An error occurred",
			});
		}
	};

	const handleToggle = async (id: number, currentState: boolean) => {
		const result = await toggleOAuthProvider(id, !currentState);
		if (result.success) {
			toast.success(`Provider ${!currentState ? "enabled" : "disabled"}`, {
				description: "The provider status has been updated.",
			});
			// Refresh the page to show updated list
			window.location.reload();
		} else {
			toast.error("Failed to update provider", {
				description: result.error || "An error occurred",
			});
		}
	};

	const handleFormClose = () => {
		setIsFormOpen(false);
		setEditingProvider(undefined);
	};

	return (
		<div className="space-y-4">
			<div className="space-y-3">
				<div className="flex justify-between items-center">
					<p className="text-sm text-muted-foreground">
						{providers.length} provider{providers.length !== 1 ? "s" : ""}{" "}
						configured
					</p>
					<button
						type="button"
						onClick={() => {
							setEditingProvider(undefined);
							setIsFormOpen(true);
						}}
						className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
					>
						+ Add Provider
					</button>
				</div>
			</div>

			{providers.length === 0 ? (
				<div className="rounded-lg border border-dashed p-8 text-center">
					<p className="text-sm text-muted-foreground">
						No OAuth providers configured yet.
					</p>
					<button
						type="button"
						onClick={() => {
							setEditingProvider(undefined);
							setIsFormOpen(true);
						}}
						className="mt-4 inline-flex items-center text-sm text-primary hover:underline"
					>
						Add your first provider →
					</button>
				</div>
			) : (
				<div className="rounded-lg border">
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b bg-muted/50">
									<th className="p-4 text-left font-medium">Name</th>
									<th className="p-4 text-left font-medium">Provider ID</th>
									<th className="p-4 text-left font-medium">Client ID</th>
									<th className="p-4 text-left font-medium">Status</th>
									<th className="p-4 text-right font-medium">Actions</th>
								</tr>
							</thead>
							<tbody>
								{providers.map((provider) => (
									<tr key={provider.id} className="border-b last:border-0">
										<td className="p-4 font-medium">{provider.name}</td>
										<td className="p-4 font-mono text-xs text-blue-600 dark:text-blue-400">
											{provider.providerId}
										</td>
										<td className="p-4 font-mono text-xs text-muted-foreground">
											{provider.clientId.slice(0, 20)}...
										</td>
										<td className="p-4">
											<span
												className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
													provider.enabled
														? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
														: "bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-400"
												}`}
											>
												{provider.enabled ? "Enabled" : "Disabled"}
											</span>
										</td>
										<td className="p-4 text-right">
											<div className="flex justify-end gap-2">
												<button
													type="button"
													onClick={() =>
														handleToggle(provider.id, provider.enabled)
													}
													className="text-xs text-blue-600 hover:underline dark:text-blue-400"
												>
													{provider.enabled ? "Disable" : "Enable"}
												</button>
												<button
													type="button"
													onClick={() => handleEdit(provider)}
													className="text-xs text-primary hover:underline"
												>
													Edit
												</button>
												<button
													type="button"
													onClick={() =>
														handleDelete(provider.id, provider.name)
													}
													className="text-xs text-red-600 hover:underline dark:text-red-400"
												>
													Delete
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{isFormOpen && (
				<OAuthProviderForm
					provider={editingProvider}
					onClose={handleFormClose}
				/>
			)}
		</div>
	);
}
