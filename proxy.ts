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
	// "/profile",
	// "/settings",
	// Add your protected routes here
];

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
export default async function proxy(request: NextRequest): Promise<NextResponse> {
	const pathname = request.nextUrl.pathname;

	// Check if the current route is protected or an auth route
	const isProtectedRoute = protectedRoutes.some((route) =>
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
		 * - _next/static (static files)
		 * - _next/image (image optimization)
		 * - favicon.ico (favicon file)
		 * - public files (public folder)
		 */
		"/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
