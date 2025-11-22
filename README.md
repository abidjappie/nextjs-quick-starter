# Next.js Quick Starter

A modern Next.js starter template with best practices built-in. Features Next.js 16, React 19, TypeScript, Drizzle ORM, TanStack libraries, and Vercel AI SDK.

## ✨ Features

- ⚡️ **Next.js 16** with App Router and React Server Components
- ⚛️ **React 19** with latest features (useActionState, useFormStatus, useOptimistic)
- 📝 **TypeScript** with strict mode
- 🔐 **better-auth** for modern authentication (email/password, OAuth, sessions)
- 🔄 **Workflow DevKit** for durable, long-running workflows with auto-retry
- 🎨 **Tailwind CSS v4** with CSS variables
- 🧩 **shadcn/ui** (New York style) for beautiful components
- 🗄️ **Drizzle ORM** with libSQL/Turso database
- ✅ **Zod** for runtime validation
- 🔗 **drizzle-zod** for seamless schema validation
- 🔄 **TanStack React Query** for data fetching and caching
- 💾 **TanStack React Store** for state management
- 🎉 **Sonner** for beautiful toast notifications
- 📅 **date-fns** for date manipulation and formatting
- 🤖 **Vercel AI SDK** with OpenAI, Anthropic, and Google providers
- 🔗 **nuqs** for type-safe URL search params management
- 🔧 **Biome** for fast linting and formatting
- 🪝 **Lefthook** for git hooks
- 🌍 **i18next** for internationalization

### 💡 Recommended for Production

- **Vercel KV** (Redis) - For rate limiting, caching, and distributed state management

## 🚀 Stack

### Core
- **Framework**: Next.js 16 with App Router
- **React**: 19 with Server Components
- **TypeScript**: 5
- **Node.js**: 24 LTS (recommended)
- **Package Manager**: pnpm (required)

### UI & Styling
- **Tailwind CSS**: v4
- **shadcn/ui**: Component library (New York style)
- **lucide-react**: Icons
- **class-variance-authority**: Component variants
- **tw-animate-css**: Animations
- **sonner**: v2 for toast notifications

### Database, Auth & Validation
- **Drizzle ORM**: with drizzle-kit
- **libSQL**: @libsql/client for Turso database
- **better-auth**: v1.3 for authentication
- **Zod**: v4 for runtime validation
- **drizzle-zod**: Auto-generate Zod schemas from Drizzle

### Data & State Management
- **TanStack React Query**: v5 for server state
- **@tanstack/react-query-devtools**: DevTools for debugging queries
- **TanStack React Store**: Client-side state management

### Utilities
- **date-fns**: v4 for date manipulation and formatting
- **nuqs**: v2.8 for type-safe URL search params

### AI & ML
- **Vercel AI SDK**: v5
- **@ai-sdk/react**: React hooks (useObject, useChat, etc.)
- **@ai-sdk/openai**: OpenAI provider
- **@ai-sdk/anthropic**: Anthropic provider
- **@ai-sdk/google**: Google AI provider

### Code Quality
- **Biome**: v2 for linting and formatting
- **Lefthook**: Git hooks automation

## 📋 Prerequisites

- **Node.js 24 LTS** (recommended)
- **pnpm** (install with `npm install -g pnpm`)
- A Turso database (or local SQLite for development)

## 🛠️ Local Development

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd nextjs-quick-starter
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```bash
# Database (required)
DATABASE_URL="file:local.db"  # For local development with SQLite

# Authentication (required for auth features)
BETTER_AUTH_SECRET="your-secret-key-min-32-characters-long"  # Generate with: openssl rand -base64 32

# Global Admin (required for /system admin panel access)
GLOBAL_ADMIN_EMAIL="admin@example.com"
GLOBAL_ADMIN_PASSWORD="YourSecure123!Pass"  # Min 12 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char

# Encryption Key (required for encrypting OAuth client secrets)
# Generate with: openssl rand -hex 32
ENCRYPTION_KEY="$(openssl rand -hex 32)"  # MUST be exactly 64 hex characters (32 bytes)

# AI Providers (at least one recommended for AI features)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_API_KEY="..."

# Optional: Social Auth Providers
# GITHUB_CLIENT_ID=""
# GITHUB_CLIENT_SECRET=""
# GOOGLE_CLIENT_ID=""
# GOOGLE_CLIENT_SECRET=""

# Optional
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

For Turso (production):

```bash
DATABASE_URL="libsql://your-database.turso.io"
DATABASE_AUTH_TOKEN="your-auth-token"
```

> **Security Note**: 
> - `GLOBAL_ADMIN_PASSWORD` must be at least 12 characters with 1 uppercase, 1 lowercase, 1 digit, and 1 special character
> - `ENCRYPTION_KEY` must be generated with `openssl rand -hex 32` (never use a simple pattern)
> - Environment variables are validated at startup using Zod. See `envConfig.ts` for the validation schema.

### 4. Generate authentication schema

```bash
# Generate better-auth schema for authentication tables
pnpm auth:generate
```

This creates `auth-schema.ts` with Drizzle tables for authentication (user, session, account, verification).

### 5. Set up the database

```bash
# Generate migration files from schema (includes auth tables)
pnpm db:generate

# Apply migrations to database
pnpm db:migrate

# Seed the global admin user (required for /system access)
pnpm db:seed

# Or push schema directly (development only - skip seeding)
# pnpm db:push
```

### 6. Start the development server

```bash
pnpm dev

# Or with Turbopack (faster)
pnpm dev --turbo
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Available Scripts

### Development
```bash
pnpm dev          # Start development server
pnpm dev --turbo  # Start with Turbopack (faster)
pnpm build        # Build for production
pnpm start        # Start production server
```

### Authentication
```bash
pnpm auth:generate  # Generate better-auth schema (auth-schema.ts)
```

### Database
```bash
pnpm db:generate  # Generate migrations from schema changes
pnpm db:push      # Push schema directly to database (dev only)
pnpm db:migrate   # Run migrations
pnpm db:seed      # Seed global admin user
pnpm db:studio    # Open Drizzle Studio (database GUI)
```

### Code Quality
```bash
biome check --write  # Lint and format code
tsc --noEmit        # Type check without emitting files
```

## 🏗️ Project Structure

```
nextjs-quick-starter/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   └── auth/             # better-auth API endpoints
│   ├── system/               # Admin panel for OAuth management
│   │   ├── page.tsx          # System dashboard
│   │   ├── layout.tsx        # Protected layout (global admin only)
│   │   └── actions.ts        # Provider CRUD operations
│   ├── actions.ts            # Server actions (CRUD operations)
│   ├── layout.tsx            # Root layout with Toaster
│   ├── page.tsx              # Home page
│   ├── globals.css           # Global styles (Tailwind v4)
│   └── favicon.ico           # App icon
├── components/               # React components
│   ├── system/               # System admin components
│   │   ├── oauth-provider-table.tsx  # Provider list UI
│   │   └── oauth-provider-form.tsx   # Provider form UI
│   ├── ui/                   # shadcn/ui components
│   │   └── sonner.tsx        # Toast component
├── db/                       # Database (Drizzle ORM)
│   ├── index.ts              # Database client
│   ├── schema.ts             # Drizzle schema with Zod schemas
│   └── seed.ts               # Database seeding (global admin)
├── lib/                      # Utility functions
│   ├── auth.ts               # better-auth server configuration
│   ├── auth-client.ts        # better-auth client hooks
│   └── utils.ts              # Utility functions (cn, etc.)
├── stores/                   # TanStack React Store
├── migrations/               # Drizzle database migrations
├── auth-schema.ts            # better-auth Drizzle schema (generated)
├── proxy.ts                  # Route protection (Next.js 16)
├── envConfig.ts              # Environment variable validation (Zod)
├── drizzle.config.ts         # Drizzle configuration
├── biome.json                # Biome linter configuration
├── lefthook.yml              # Git hooks configuration
├── components.json           # shadcn/ui configuration
├── tsconfig.json             # TypeScript configuration
```

## 🎯 Best Practices

This starter follows these best practices:

### Validation
- **Always use Zod** for all input validation (forms, APIs, env vars)
- Use `drizzle-zod` to generate Zod schemas from Drizzle schemas
- Validate environment variables at startup with `envConfig.ts`

### Data Fetching & State
- Use **TanStack React Query** for server state and data fetching
- Use **TanStack React Store** for UI state (modals, themes, etc.)
- Use **Server Components** for initial data fetching
- Use **Server Actions** for mutations with progressive enhancement

### React Patterns
- Prefer **Server Components** by default
- Only use `"use client"` when necessary (hooks, interactivity, browser APIs)
- Use React 19 hooks: `useActionState`, `useFormStatus`, `useOptimistic`
- Use `useObject` from AI SDK for structured AI outputs

### Code Style
- **Biome** for linting with tabs and double quotes
- **TypeScript strict mode** enabled
- Well-commented code with JSDoc
- Descriptive variable and function names

### Database
- Define Drizzle schemas in `db/schema.ts`
- Use `createInsertSchema` and `createSelectSchema` from drizzle-zod
- Run migrations before deploying
- Use Drizzle Studio for database management

## 🧪 Adding Features

### Add a new shadcn/ui component

```bash
npx shadcn@latest add button
npx shadcn@latest add form
```

### Create a new database table

1. Define schema in `db/schema.ts`:

```typescript
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content").notNull(),
});

// Generate Zod schemas
export const insertPostSchema = createInsertSchema(posts, {
  title: z.string().min(3).max(200),
  content: z.string().min(10),
});

export const selectPostSchema = createSelectSchema(posts);
export type Post = typeof posts.$inferSelect;
```

2. Generate and run migration:

```bash
pnpm db:generate
pnpm db:migrate
```

### Add Rate Limiting (Recommended for Production)

Implement rate limiting using **Vercel KV** (Redis) to protect your API routes, server actions, and workflows:

**Use Cases:**
- 🤖 **AI API calls** - Prevent hitting provider rate limits
- 🔐 **Authentication** - Protect login/signup endpoints from brute force
- 📧 **Email sending** - Limit emails per user/hour
- 🔄 **API routes** - Prevent abuse and DDoS attacks
- 💾 **Database operations** - Control expensive queries
- 🎯 **User actions** - Implement per-user quotas

**Why Vercel KV:**
- ✅ Distributed rate limiting across all serverless instances
- ✅ Real-time tracking across all deployments
- ✅ Automatic expiration of rate limit windows
- ✅ Built-in atomic operations for accuracy
- ✅ Seamless Vercel deployment integration
- ✅ Included in Vercel plans (no extra service)

**Installation:**

```bash
pnpm add @vercel/kv
```

**Setup:**

Follow the [official Vercel KV quickstart guide](https://vercel.com/docs/storage/vercel-kv/quickstart):

1. Create a KV database in your [Vercel dashboard](https://vercel.com/dashboard/stores)
2. Go to **Storage** → **Create Database** → Choose **KV**
3. Link to your project:
   ```bash
   vercel link
   vercel env pull .env.local
   ```

This automatically adds the required environment variables (`KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN`).

**Example Rate Limiter:**

Based on [Vercel's official examples](https://vercel.com/docs/storage/vercel-kv):

```typescript
// lib/rate-limit.ts
import { kv } from "@vercel/kv";

/**
 * Simple sliding window rate limiter using Vercel KV
 * Based on Vercel's official documentation
 * @see https://vercel.com/docs/storage/vercel-kv
 */
export async function rateLimit(
  identifier: string,
  limit: number = 10,
  windowSeconds: number = 3600
): Promise<{ allowed: boolean; remaining: number }> {
  const key = `ratelimit:${identifier}`;
  const current = await kv.incr(key);
  
  // Set expiration on first request
  if (current === 1) {
    await kv.expire(key, windowSeconds);
  }
  
  const allowed = current <= limit;
  const remaining = Math.max(0, limit - current);
  
  return { allowed, remaining };
}
```

**Use in API Routes:**

```typescript
// app/api/protected/route.ts
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const userId = request.headers.get("x-user-id") || "anonymous";
  
  // Limit to 10 requests per hour
  const { allowed, remaining } = await rateLimit(`api:${userId}`, 10, 3600);
  
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429 }
    );
  }
  
  // Process request...
  return NextResponse.json({ 
    success: true,
    rateLimit: { remaining }
  });
}
```

**Use in Server Actions:**

```typescript
// app/actions.ts
"use server";

import { rateLimit } from "@/lib/rate-limit";

export async function sendEmail(email: string) {
  // Limit emails to 5 per hour per email address
  const { allowed } = await rateLimit(`email:${email}`, 5, 3600);
  
  if (!allowed) {
    return { error: "Too many emails sent. Try again later." };
  }
  
  // Send email...
}
```

**Use in Workflows:**

```typescript
// workflows/ai-content.ts
import { FatalError } from "workflow";
import { rateLimit } from "@/lib/rate-limit";

async function checkRateLimitStep(userId: string) {
  "use step";
  
  const { allowed, remaining } = await rateLimit(`ai:${userId}`, 10, 3600);
  
  if (!allowed) {
    throw new FatalError("Rate limit exceeded. Try again in 1 hour.");
  }
  
  console.log(`${remaining} AI requests remaining`);
}
```

**Official Resources:**
- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [Vercel KV Quickstart](https://vercel.com/docs/storage/vercel-kv/quickstart)
- [Vercel KV SDK Reference](https://vercel.com/docs/storage/vercel-kv/kv-reference)
- [Next.js Redis Session Store Guide](https://vercel.com/guides/session-store-nextjs-redis-vercel-kv)
- [Redis Next.js Starter Template](https://vercel.com/templates/next.js/kv-redis-starter)

### Add React Query to a component

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";

export function MyComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-data"],
    queryFn: async () => {
      const res = await fetch("/api/my-data");
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  return <div>{data}</div>;
}
```

### Manage URL Search Params with nuqs

**nuqs** provides type-safe, performant URL search param management as a replacement for Next.js's `useSearchParams`. It offers better DX with automatic URL updates, TypeScript support, and built-in parsers.

**Why use nuqs over useSearchParams:**
- ✅ Type-safe with built-in parsers (string, number, boolean, etc.)
- ✅ Automatic URL synchronization
- ✅ Server-side rendering support
- ✅ Better performance (no unnecessary re-renders)
- ✅ Cleaner API with state-like syntax
- ✅ Built-in shallow routing

**Setup (Already configured):**

The `NuqsAdapter` is already set up in `app/layout.tsx`:

```typescript
import { NuqsAdapter } from "nuqs/adapters/next/app";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  );
}
```

**Basic Usage:**

```typescript
"use client";

import { useQueryState } from "nuqs";

export function SearchComponent() {
  // Simple string param with default value
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  
  return (
    <div>
      <input 
        value={search} 
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
      />
      <p>Searching for: {search}</p>
    </div>
  );
}
```

**Type-Safe Parsers:**

```typescript
import { useQueryState, parseAsInteger, parseAsBoolean } from "nuqs";

export function FilterComponent() {
  // Number parameter
  const [page, setPage] = useQueryState(
    "page", 
    parseAsInteger.withDefault(1)
  );
  
  // Boolean parameter
  const [showArchived, setShowArchived] = useQueryState(
    "archived",
    parseAsBoolean.withDefault(false)
  );
  
  return (
    <div>
      <button onClick={() => setPage(page + 1)}>
        Next Page (Current: {page})
      </button>
      <label>
        <input
          type="checkbox"
          checked={showArchived}
          onChange={(e) => setShowArchived(e.target.checked)}
        />
        Show Archived
      </label>
    </div>
  );
}
```

**Multiple Query States:**

```typescript
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs";

export function ProductFilters() {
  const [filters, setFilters] = useQueryStates({
    category: parseAsString.withDefault("all"),
    minPrice: parseAsInteger.withDefault(0),
    maxPrice: parseAsInteger.withDefault(1000),
    sort: parseAsString.withDefault("name"),
  });
  
  return (
    <div>
      <select 
        value={filters.category}
        onChange={(e) => setFilters({ category: e.target.value })}
      >
        <option value="all">All</option>
        <option value="electronics">Electronics</option>
      </select>
      
      <input
        type="number"
        value={filters.minPrice}
        onChange={(e) => setFilters({ minPrice: parseInt(e.target.value) })}
      />
      
      {/* Reset all filters */}
      <button onClick={() => setFilters(null)}>
        Clear Filters
      </button>
    </div>
  );
}
```

**With Callback URL (Login Example):**

```typescript
"use client";

import { useQueryState } from "nuqs";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [callbackUrl] = useQueryState("callbackUrl", { defaultValue: "/" });
  const router = useRouter();
  
  async function handleLogin() {
    // ... authentication logic
    router.push(callbackUrl); // Redirect to callback URL
  }
  
  return <form onSubmit={handleLogin}>...</form>;
}
```

**Server-Side Usage:**

```typescript
// app/products/page.tsx
import { parseAsInteger, parseAsString } from "nuqs/server";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  
  // Parse server-side search params
  const page = parseAsInteger.withDefault(1).parseServerSide(params.page);
  const category = parseAsString.withDefault("all").parseServerSide(params.category);
  
  const products = await fetchProducts({ page, category });
  
  return <ProductList products={products} />;
}
```

**Built-in Parsers:**
- `parseAsString` - String values
- `parseAsInteger` - Integer numbers
- `parseAsFloat` - Float numbers
- `parseAsBoolean` - Boolean values
- `parseAsTimestamp` - Unix timestamps
- `parseAsIsoDateTime` - ISO date strings
- `parseAsStringEnum` - Enum values
- `parseAsArrayOf` - Arrays of any type
- `parseAsJson` - JSON objects

**Official Documentation:**
- [nuqs Documentation](https://nuqs.dev/docs)

## 🌍 Environment Variables

Environment variables are validated using Zod in `envConfig.ts`. Add new variables:

```typescript
const envSchema = z.object({
  // Add your new variable
  MY_NEW_VAR: z.string().min(1),
  // ... existing variables
});
```

## 📚 Documentation

### Project Guides
- **[AUTHENTICATION.md](./AUTHENTICATION.md)** - Complete authentication guide with better-auth
- **[OAUTH_SETUP.md](./OAUTH_SETUP.md)** - Configure custom OAuth/OIDC providers
- **[WORKFLOW.md](./WORKFLOW.md)** - Build durable workflows with automatic retries
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Guidelines for contributing
- **[CHEATSHEET.md](./CHEATSHEET.md)** - Quick reference guide

### Framework Documentation
- [Next.js 16 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [Workflow DevKit Docs](https://useworkflow.dev/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Vercel AI SDK Docs](https://sdk.vercel.ai)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Zod Docs](https://zod.dev)
- [nuqs Docs](https://nuqs.dev)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Need Help?

1. Check the [cursor rules](.cursorrules) for detailed guidelines
2. Open an issue on GitHub
3. Review the [Next.js documentation](https://nextjs.org/docs)

## 🚀 Deploy

### Vercel (Recommended)

The easiest way to deploy is with [Vercel](https://vercel.com):

Remember to:
1. Set up environment variables in Vercel dashboard
2. Connect your Turso database
3. Migrations run automatically on build

### Other Platforms

This starter works on any platform supporting Node.js 24 LTS:
- Cloudflare Pages
- Railway
- Render
- Fly.io
- AWS (ECS, Fargate, Amplify)

---

Built with ❤️ using Next.js 16, React 19, and modern web technologies.
