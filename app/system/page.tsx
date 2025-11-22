/**
 * System Administration Page
 * Main page for OAuth provider management
 */

import { getOAuthProvidersDecrypted } from "@/app/system/actions";
import { OAuthProviderTable } from "@/components/system/oauth-provider-table";

export default async function SystemPage() {
	// Fetch all OAuth providers with decrypted secrets
	// (Only accessible to global admins via layout protection)
	const providers = await getOAuthProvidersDecrypted();

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-3xl font-bold tracking-tight">
					OAuth Provider Management
				</h2>
				<p className="text-muted-foreground">
					Configure and manage OAuth authentication providers for your
					application.
				</p>
			</div>

			<OAuthProviderTable providers={providers} />
		</div>
	);
}
