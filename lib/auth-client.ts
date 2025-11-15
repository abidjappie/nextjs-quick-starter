/**
 * Better Auth Client
 * Client-side authentication hooks and utilities
 * Use in Client Components for auth operations
 */

"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Auth Client Instance
 * Provides hooks for authentication in Client Components
 * Uses NEXT_PUBLIC_ env var which is available on client
 */
export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

/**
 * Export commonly used hooks and methods
 */
export const { useSession, signIn, signUp, signOut } = authClient;

