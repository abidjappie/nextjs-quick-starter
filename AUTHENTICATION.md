# Authentication with better-auth

This project uses **better-auth** for modern, type-safe authentication. This guide covers setup, usage, and best practices.

## 📚 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Usage Patterns](#usage-patterns)
- [Protecting Routes](#protecting-routes)
- [Best Practices](#best-practices)
- [Social OAuth](#social-oauth)
- [Troubleshooting](#troubleshooting)

## Overview

better-auth provides:
- ✅ **Type-safe sessions** with full TypeScript support
- ✅ **Email/password authentication** out of the box
- ✅ **OAuth providers** (GitHub, Google, etc.)
- ✅ **Seamless Drizzle ORM integration**
- ✅ **Automatic session management**
- ✅ **Built for Next.js 16 App Router**

## Quick Start

### 1. Environment Variables

Add to your `.env.local`:

\`\`\`bash
# Required for authentication
BETTER_AUTH_SECRET="your-secret-key-min-32-characters-long"

# Generate a secure secret:
# openssl rand -base64 32
\`\`\`

### 2. Generate Auth Schema

Run the better-auth CLI to generate Drizzle schema for auth tables:

\`\`\`bash
pnpm auth:generate
\`\`\`

This creates `auth-schema.ts` with table definitions for:
- `user` - User accounts
- `session` - Active sessions
- `account` - OAuth accounts (if using social auth)
- `verification` - Email verification tokens

### 3. Database Setup

After generating the auth schema, create and run migrations:

\`\`\`bash
# Generate migration files from auth-schema.ts
pnpm db:generate

# Apply migrations to database
pnpm db:migrate
\`\`\`

### 4. Start Development Server

\`\`\`bash
pnpm dev
\`\`\`

Auth endpoints are available at:
- `/api/auth/signin`
- `/api/auth/signup`
- `/api/auth/signout`
- And more...

## Configuration

### Server Configuration

The auth server is configured in \`lib/auth.ts\`:

\`\`\`typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { env } from "@/envConfig";
import * as schema from "@/auth-schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Enable in production
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  basePath: "/api/auth",
  baseURL: env.NEXT_PUBLIC_APP_URL,
  secret: env.BETTER_AUTH_SECRET,
});
\`\`\`

### Client Configuration

Client hooks are exported from \`lib/auth-client.ts\`:

\`\`\`typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const {
  useSession,
  signIn,
  signUp,
  signOut,
} = authClient;
\`\`\`

## Usage Patterns

### 1. Check Auth in Server Components

\`\`\`typescript
// app/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}!</h1>
      <p>Email: {session.user.email}</p>
    </div>
  );
}
\`\`\`

### 2. Check Auth in Client Components

\`\`\`typescript
// components/user-menu.tsx
"use client";

import { useSession, signOut } from "@/lib/auth-client";

export function UserMenu() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <a href="/login">Sign In</a>;
  }

  return (
    <div>
      <p>Hello, {session.user.name}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
\`\`\`

### 3. Protected Server Actions

Always validate sessions in server actions:

\`\`\`typescript
// app/actions.ts
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function createPost(formData: FormData) {
  // 1. Check authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      success: false,
      errors: { _form: ["You must be logged in"] },
    };
  }

  // 2. Verify ownership (if needed)
  const userId = session.user.id;
  
  // 3. Perform action
  // ... your logic here
  
  return { success: true };
}
\`\`\`

### 4. Login Form Example

\`\`\`typescript
// app/login/page.tsx
"use client";

import { signIn } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await signIn.email({
        email,
        password,
        callbackURL: "/dashboard",
      });
      router.push("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        placeholder="Email"
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        required
      />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
\`\`\`

## Protecting Routes

### Proxy Approach (Next.js 16)

**Next.js 16 uses `proxy.ts` instead of `middleware.ts`**

Use proxy to protect entire route groups:

\`\`\`typescript
// proxy.ts
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Define protected routes
const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/settings",
];

const authRoutes = ["/login", "/register"];

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if accessing auth routes with session
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
\`\`\`

### Add Route Groups for Protected Pages

\`\`\`
app/
├── (auth)/           # Routes that require authentication
│   ├── dashboard/
│   ├── profile/
│   └── settings/
├── (public)/         # Public routes
│   ├── login/
│   ├── register/
│   └── about/
\`\`\`

## Best Practices

### 1. Always Validate Sessions

✅ **Do**: Check authentication in every protected server action

\`\`\`typescript
export async function protectedAction(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, errors: { _form: ["Unauthorized"] } };
  }

  // ... rest of action
}
\`\`\`

❌ **Don't**: Assume the user is authenticated

### 2. Verify Ownership

✅ **Do**: Check that users own the resources they're modifying

\`\`\`typescript
export async function updatePost(id: number, data: any) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, errors: { _form: ["Unauthorized"] } };
  }

  const [post] = await db.select().from(posts).where(eq(posts.id, id));

  if (!post || post.userId !== session.user.id) {
    return { success: false, errors: { _form: ["Not found or unauthorized"] } };
  }

  // ... perform update
}
\`\`\`

### 3. Use Environment Variables

✅ **Do**: Use a strong secret in production

\`\`\`bash
# Generate a secure secret
openssl rand -base64 32
\`\`\`

❌ **Don't**: Use weak secrets or hardcode them

### 4. Enable Email Verification in Production

\`\`\`typescript
export const auth = betterAuth({
  // ...
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, // Enable in production
  },
});
\`\`\`

### 5. Implement Rate Limiting

Consider adding rate limiting to auth endpoints:

\`\`\`bash
pnpm add @upstash/ratelimit @upstash/redis
\`\`\`

## Social OAuth

### GitHub OAuth Setup

1. Create a GitHub OAuth App at https://github.com/settings/developers
2. Set callback URL to: \`http://localhost:3000/api/auth/callback/github\`
3. Add to \`.env.local\`:

\`\`\`bash
GITHUB_CLIENT_ID="your_client_id"
GITHUB_CLIENT_SECRET="your_client_secret"
\`\`\`

4. Update \`lib/auth.ts\`:

\`\`\`typescript
export const auth = betterAuth({
  // ... existing config
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  },
});
\`\`\`

5. Use in your login page:

\`\`\`typescript
import { signIn } from "@/lib/auth-client";

<button onClick={() => signIn.social({ provider: "github" })}>
  Sign in with GitHub
</button>
\`\`\`

### Google OAuth Setup

1. Create OAuth credentials in Google Cloud Console
2. Add authorized redirect URI: \`http://localhost:3000/api/auth/callback/google\`
3. Add to \`.env.local\`:

\`\`\`bash
GOOGLE_CLIENT_ID="your_client_id"
GOOGLE_CLIENT_SECRET="your_client_secret"
\`\`\`

4. Update \`lib/auth.ts\`:

\`\`\`typescript
export const auth = betterAuth({
  // ... existing config
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
});
\`\`\`

## Troubleshooting

### Issue: "Session not found"

**Cause**: The user is not authenticated.

**Solution**: Check that the user has signed in and the session cookie is being sent.

### Issue: "Invalid secret"

**Cause**: \`BETTER_AUTH_SECRET\` is not set or is too short.

**Solution**: Generate a secure secret (min 32 characters):

\`\`\`bash
openssl rand -base64 32
\`\`\`

### Issue: Auth tables not created

**Cause**: Database migrations haven't run.

**Solution**: Run migrations:

\`\`\`bash
pnpm db:migrate
\`\`\`

### Issue: Proxy not protecting routes

**Cause**: Proxy matcher might be incorrect.

**Solution**: Check your proxy config matches the routes you want to protect.

## Additional Resources

- [better-auth Documentation](https://better-auth.com)
- [Next.js Middleware Docs](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Drizzle ORM Docs](https://orm.drizzle.team)

## Need Help?

- Open an issue on GitHub
- Check the better-auth documentation
- Review the example implementations in this project

