"use server";

/**
 * Server Actions for OAuth Provider Management
 * All actions require global admin authentication
 */

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { ZodError } from "zod/v4";
import { db } from "@/db";
import {
	createOAuthProviderFormSchema,
	oauthProviders,
	updateOAuthProviderFormSchema,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { encrypt, safeDecrypt } from "@/lib/encryption";

/**
 * Verify that the current user is a global admin
 * Returns the session if authorized, throws error otherwise
 */
async function verifyGlobalAdmin() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		throw new Error("You must be logged in");
	}

	if (!session.user.isGlobalAdmin) {
		throw new Error("You must be a global admin to perform this action");
	}

	return session;
}

/**
 * Get all OAuth providers with decrypted client secrets
 * Only accessible to global admins
 */
export async function getOAuthProvidersDecrypted() {
	await verifyGlobalAdmin();

	const providers = await db.select().from(oauthProviders);

	return Promise.all(
		providers.map(async (provider) => ({
			...provider,
			clientSecret:
				(await safeDecrypt(provider.clientSecret)) ||
				"*** DECRYPTION FAILED ***",
		})),
	);
}

/**
 * Create a new OAuth provider
 */
export async function createOAuthProvider(formData: FormData) {
	try {
		// Verify admin access
		await verifyGlobalAdmin();

		// Parse and validate form data
		const data = {
			name: formData.get("name") as string,
			providerId: formData.get("providerId") as string,
			clientId: formData.get("clientId") as string,
			clientSecret: formData.get("clientSecret") as string,
			authorizationUrl: formData.get("authorizationUrl") as string,
			tokenUrl: formData.get("tokenUrl") as string,
			userInfoUrl: formData.get("userInfoUrl") as string | null,
			scopes: formData.get("scopes") as string,
			enabled: formData.get("enabled") === "on",
		};

		// Validate with Zod schema
		const validated = createOAuthProviderFormSchema.parse(data);

		// Check for duplicate provider ID
		const [existing] = await db
			.select()
			.from(oauthProviders)
			.where(eq(oauthProviders.providerId, validated.providerId))
			.limit(1);

		if (existing) {
			return {
				success: false,
				error: "A provider with this Provider ID already exists",
				errors: {
					providerId: ["Provider ID must be unique"],
				},
			};
		}

		// Insert with encrypted client secret
		await db.insert(oauthProviders).values({
			...validated,
			clientSecret: await encrypt(validated.clientSecret),
		});

		// Revalidate the system page
		revalidatePath("/system");

		return {
			success: true,
		};
	} catch (error) {
		console.error("Error creating OAuth provider:", error);

		if (error instanceof Error) {
			// Handle Zod validation errors
			if (error instanceof ZodError) {
				const errors: Record<string, string[]> = {};
				for (const issue of error.issues) {
					const field = issue.path[0] as string;
					if (!errors[field]) {
						errors[field] = [];
					}
					errors[field].push(issue.message);
				}
				return {
					success: false,
					error: "Validation failed",
					errors,
				};
			}

			return {
				success: false,
				error: error.message,
			};
		}

		return {
			success: false,
			error: "An unexpected error occurred",
		};
	}
}

/**
 * Update an existing OAuth provider
 */
export async function updateOAuthProvider(formData: FormData) {
	try {
		// Verify admin access
		await verifyGlobalAdmin();

		// Parse form data
		// Note: providerId is disabled when editing, so it won't be in formData
		const id = Number.parseInt(formData.get("id") as string, 10);
		const data = {
			id,
			name: formData.get("name") as string,
			clientId: formData.get("clientId") as string,
			clientSecret: formData.get("clientSecret") as string,
			authorizationUrl: formData.get("authorizationUrl") as string,
			tokenUrl: formData.get("tokenUrl") as string,
			userInfoUrl: formData.get("userInfoUrl") as string | null,
			scopes: formData.get("scopes") as string,
			enabled: formData.get("enabled") === "on",
		};

		// Validate with Zod schema (providerId is omitted from update schema)
		const validated = updateOAuthProviderFormSchema.parse(data);

		// Check if provider exists
		const [existing] = await db
			.select()
			.from(oauthProviders)
			.where(eq(oauthProviders.id, id))
			.limit(1);

		if (!existing) {
			return {
				success: false,
				error: "Provider not found",
			};
		}

		let clientSecret: string | undefined;
		if (validated.clientSecret) {
			clientSecret = await encrypt(validated.clientSecret);
		}

		await db
			.update(oauthProviders)
			.set({
				updatedAt: new Date(),
				name: validated.name,
				clientId: validated.clientId,
				authorizationUrl: validated.authorizationUrl,
				tokenUrl: validated.tokenUrl,
				scopes: validated.scopes,
				enabled: validated.enabled,
				// Transform only what needs transforming
				clientSecret,
				userInfoUrl: validated.userInfoUrl ?? null,
			})
			.where(eq(oauthProviders.id, id));

		// Revalidate the system page
		revalidatePath("/system");

		return {
			success: true,
		};
	} catch (error) {
		console.error("Error updating OAuth provider:", error);

		if (error instanceof Error) {
			// Handle Zod validation errors
			if ("issues" in error) {
				const zodError = error as {
					issues: Array<{ path: string[]; message: string }>;
				};
				const errors: Record<string, string[]> = {};
				for (const issue of zodError.issues) {
					const field = issue.path[0] as string;
					if (!errors[field]) {
						errors[field] = [];
					}
					errors[field].push(issue.message);
				}
				return {
					success: false,
					error: "Validation failed",
					errors,
				};
			}

			return {
				success: false,
				error: error.message,
			};
		}

		return {
			success: false,
			error: "An unexpected error occurred",
		};
	}
}

/**
 * Delete an OAuth provider
 */
export async function deleteOAuthProvider(id: number) {
	try {
		// Verify admin access
		await verifyGlobalAdmin();

		// Check if provider exists
		const existing = await db
			.select()
			.from(oauthProviders)
			.where(eq(oauthProviders.id, id))
			.limit(1);

		if (existing.length === 0) {
			return {
				success: false,
				error: "Provider not found",
			};
		}

		// Delete from database
		await db.delete(oauthProviders).where(eq(oauthProviders.id, id));

		// Revalidate the system page
		revalidatePath("/system");

		return {
			success: true,
		};
	} catch (error) {
		console.error("Error deleting OAuth provider:", error);

		if (error instanceof Error) {
			return {
				success: false,
				error: error.message,
			};
		}

		return {
			success: false,
			error: "An unexpected error occurred",
		};
	}
}

/**
 * Toggle OAuth provider enabled status
 */
export async function toggleOAuthProvider(id: number, enabled: boolean) {
	try {
		// Verify admin access
		await verifyGlobalAdmin();

		// Check if provider exists
		const existing = await db
			.select()
			.from(oauthProviders)
			.where(eq(oauthProviders.id, id))
			.limit(1);

		if (existing.length === 0) {
			return {
				success: false,
				error: "Provider not found",
			};
		}

		// Update enabled status
		await db
			.update(oauthProviders)
			.set({
				enabled,
				updatedAt: new Date(),
			})
			.where(eq(oauthProviders.id, id));

		// Revalidate the system page
		revalidatePath("/system");

		return {
			success: true,
		};
	} catch (error) {
		console.error("Error toggling OAuth provider:", error);

		if (error instanceof Error) {
			return {
				success: false,
				error: error.message,
			};
		}

		return {
			success: false,
			error: "An unexpected error occurred",
		};
	}
}
