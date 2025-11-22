/**
 * System Administration Page
 * Main page for OAuth provider management
 */

import { OAuthProviderTable } from "@/components/system/oauth-provider-table";
import { db } from "@/db";
import { oauthProviders } from "@/db/schema";

export default async function SystemPage() {
	// Fetch all OAuth providers from database
	const providers = await db.select().from(oauthProviders);

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
