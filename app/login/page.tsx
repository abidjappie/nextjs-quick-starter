/**
 * Login Page
 * Server Component that fetches OAuth providers and renders login form
 */

import { LoginForm } from "@/components/login/login-form";
import { getEnabledOAuthProviders } from "@/lib/auth";

/**
 * Login Page Component
 * Fetches enabled OAuth providers from database and displays login form
 */
export default async function LoginPage() {
	// Fetch enabled OAuth providers from database
	const oauthProviders = await getEnabledOAuthProviders();

	// Remove sensitive data from the providers before passing to the client
	const clientSafeOAuthProviders = oauthProviders.map((provider) => ({
		id: provider.id,
		providerId: provider.providerId,
		name: provider.name,
	}));

	return <LoginForm oauthProviders={clientSafeOAuthProviders} />;
}
