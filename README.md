# Next.js Quick Starter

A modern, production-ready Next.js starter template with best practices built-in. Features Next.js 16, React 19, TypeScript, Drizzle ORM, TanStack libraries, and Vercel AI SDK.

<img width="1200" alt="Next.js Starter" src="https://github.com/user-attachments/assets/b78fd54e-574b-43b9-8f8f-943d14722e64" />

## ✨ Features

- ⚡️ **Next.js 16** with App Router and React Server Components
- ⚛️ **React 19** with latest features (useActionState, useFormStatus, useOptimistic)
- 📝 **TypeScript** with strict mode
- 🔐 **better-auth** for modern authentication (email/password, OAuth, sessions)
- 🎨 **Tailwind CSS v4** with CSS variables
- 🧩 **shadcn/ui** (New York style) for beautiful components
- 🗄️ **Drizzle ORM** with libSQL/Turso database
- ✅ **Zod** for runtime validation
- 🔗 **drizzle-zod** for seamless schema validation
- 🔄 **TanStack React Query** for data fetching and caching
- 💾 **TanStack React Store** for state management
- 🤖 **Vercel AI SDK** with OpenAI, Anthropic, and Google providers
- 🔧 **Biome** for fast linting and formatting
- 🪝 **Lefthook** for git hooks
- 🌍 **i18next** for internationalization

## 🚀 Stack

### Core
- **Framework**: Next.js 16.0.3 with App Router
- **React**: 19.2.0 with Server Components
- **TypeScript**: 5
- **Node.js**: 24 LTS (recommended)
- **Package Manager**: pnpm (required)

### UI & Styling
- **Tailwind CSS**: v4
- **shadcn/ui**: Component library (New York style)
- **lucide-react**: Icons
- **class-variance-authority**: Component variants
- **tw-animate-css**: Animations

### Database, Auth & Validation
- **Drizzle ORM**: v0.44.2 with drizzle-kit
- **libSQL**: @libsql/client for Turso database
- **better-auth**: v1.3.34 for authentication
- **Zod**: v4 for runtime validation
- **drizzle-zod**: Auto-generate Zod schemas from Drizzle

### Data & State Management
- **TanStack React Query**: v5 for server state
- **TanStack React Store**: Client-side state management

### AI & ML
- **Vercel AI SDK**: v5.0.93
- **@ai-sdk/react**: React hooks (useObject, useChat, etc.)
- **@ai-sdk/openai**: OpenAI provider
- **@ai-sdk/anthropic**: Anthropic provider
- **@ai-sdk/google**: Google AI provider

### Code Quality
- **Biome**: v2.3.2 for linting and formatting
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

> **Note**: Environment variables are validated at startup using Zod. See `envConfig.ts` for the validation schema.

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

# Or push schema directly (development only)
pnpm db:push
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
├── app/                    # Next.js App Router
│   ├── actions.ts         # Server actions
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── login/            # Login page
│   ├── register/         # Register page
│   ├── dashboard/        # Protected dashboard
│   └── globals.css       # Global styles
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── db/                   # Database
│   ├── index.ts         # Database client
│   └── schema.ts        # Drizzle schema with Zod schemas
├── lib/                  # Utility functions
│   ├── auth.ts          # better-auth configuration
│   └── auth-client.ts   # better-auth client hooks
├── stores/              # TanStack React Store stores
├── migrations/          # Drizzle migrations
├── auth-schema.ts      # better-auth Drizzle schema (generated)
├── proxy.ts            # Route protection middleware
├── envConfig.ts        # Environment variable validation
├── drizzle.config.ts   # Drizzle configuration
├── biome.json          # Biome configuration
├── lefthook.yml        # Git hooks configuration
└── components.json     # shadcn/ui configuration
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

- [Next.js 16 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Vercel AI SDK Docs](https://sdk.vercel.ai)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Zod Docs](https://zod.dev)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Need Help?

1. Check the [cursor rules](.cursorrules) for detailed guidelines
2. Open an issue on GitHub
3. Review the [Next.js documentation](https://nextjs.org/docs)
4. [Join the Turso Discord](https://tur.so/discord)

## 🚀 Deploy

### Vercel (Recommended)

The easiest way to deploy is with [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

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
