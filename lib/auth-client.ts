/**
 * Better Auth Client
 * Client-side authentication hooks and utilities
 * Use in Client Components for auth operations
 */

"use client";

import { env } from "@/envConfig";
import { createAuthClient } from "better-auth/react";

/**
 * Auth Client Instance
 * Provides hooks for authentication in Client Components
 */
export const authClient = createAuthClient({
	baseURL: env.NEXT_PUBLIC_APP_URL,
});

/**
 * Export commonly used hooks and methods
 */
export const { useSession, signIn, signUp, signOut } = authClient;

