/**
 * Proxy (Next.js 16)
 * Handles route protection and authentication
 * Replaces middleware.ts in Next.js 16
 */

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Protected routes that require authentication
 * Add routes here that should be accessible only to authenticated users
 */
const protectedRoutes: string[] = [
	"/dashboard",
	"/system",
	// "/profile",
	// "/settings",
	// Add your protected routes here
];

/**
 * Routes that require global admin access
 */
const globalAdminRoutes: string[] = ["/system"];

/**
 * Public routes that should redirect to dashboard if user is already authenticated
 */
const authRoutes: string[] = ["/login", "/register"];

/**
 * Proxy function (default export for Next.js 16)
 * Handles authentication checks and route protection logic
 * @param request - The incoming Next.js request
 * @returns NextResponse with redirect or next()
 */
export default async function proxy(
	request: NextRequest,
): Promise<NextResponse> {
	const pathname = request.nextUrl.pathname;

	// Check if the current route is protected, requires admin, or is an auth route
	const isProtectedRoute = protectedRoutes.some((route) =>
		pathname.startsWith(route),
	);
	const isGlobalAdminRoute = globalAdminRoutes.some((route) =>
		pathname.startsWith(route),
	);
	const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

	// Get session from better-auth
	const session = await auth.api.getSession({
		headers: request.headers,
	});

	// Redirect to login if accessing protected route without session
	if (isProtectedRoute && !session) {
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("callbackUrl", pathname);
		return NextResponse.redirect(loginUrl);
	}

	// Check global admin access for admin routes
	if (isGlobalAdminRoute && session) {
		console.log("[DEBUG] System route accessed by:", session.user.email);
		console.log(
			"[DEBUG] Session user object:",
			JSON.stringify(session.user, null, 2),
		);

		// @ts-expect-error - isGlobalAdmin is added to the user type via better-auth
		const isGlobalAdmin = session.user.isGlobalAdmin === true;

		console.log("[DEBUG] isGlobalAdmin value:", isGlobalAdmin);

		if (!isGlobalAdmin) {
			// Not a global admin, redirect to dashboard
			return NextResponse.redirect(new URL("/dashboard", request.url));
		}

		console.log("[DEBUG] User is global admin, allowing access");
	}

	// Redirect to dashboard if accessing auth routes with active session
	if (isAuthRoute && session) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	// Allow request to proceed
	return NextResponse.next();
}

/**
 * Matcher configuration
 * Specifies which routes the proxy should run on
 */
export const config = {
	matcher: [
		/*
		 * Match all request paths except for:
		 * - api/auth (better-auth endpoints)
		 * - .well-known/workflow (Workflow DevKit internal paths)
		 * - _next/static (static files)
		 * - _next/image (image optimization)
		 * - favicon.ico (favicon file)
		 * - public files (public folder)
		 */
		"/((?!api/auth|\\.well-known/workflow|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
