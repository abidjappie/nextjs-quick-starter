"use client";

import { useQueryState } from "nuqs";

/**
 * Safe callback URL hook - only allows relative paths starting with "/"
 */
export function useSafeCallbackUrl(defaultPath = "/"): string {
	const [callbackUrl] = useQueryState("callbackUrl");

	// Only allow relative paths starting with "/"
	if (callbackUrl?.startsWith("/")) {
		return callbackUrl;
	}

	return defaultPath;
}
