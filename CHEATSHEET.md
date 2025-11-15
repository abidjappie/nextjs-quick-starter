# Quick Reference Cheatsheet

A quick reference guide for common tasks and patterns in this Next.js Quick Starter.

## 📦 Common Commands

```bash
# Package Management
pnpm install              # Install dependencies
pnpm add <package>        # Add new package
pnpm remove <package>     # Remove package

# Development
pnpm dev                  # Start dev server
pnpm dev --turbo          # Start with Turbopack (faster)
pnpm build                # Build for production
pnpm start                # Start production server

# Database
pnpm db:generate          # Generate migrations
pnpm db:push              # Push schema (dev only)
pnpm db:migrate           # Run migrations
pnpm db:studio            # Open Drizzle Studio

# Code Quality
biome check --write       # Lint and format
tsc --noEmit             # Type check
```

## 🗄️ Database Patterns

### Define Schema with drizzle-zod

```typescript
// db/schema.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  age: integer("age"),
});

// Generate Zod schemas from Drizzle
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  name: z.string().min(2).max(100),
  age: z.number().int().positive().max(150).optional(),
});

export const selectUserSchema = createSelectSchema(users);

// Infer TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Form-specific schema
export const createUserFormSchema = insertUserSchema.omit({ 
  id: true 
});
```

### Query with Validation

```typescript
import { db } from "@/db";
import { users, selectUserSchema } from "@/db/schema";
import { eq } from "drizzle-orm";

// Select with validation
const allUsers = await db.select().from(users);
const validated = allUsers.map(u => selectUserSchema.parse(u));

// Insert with validation
const newUser = insertUserSchema.parse({
  name: "John",
  email: "john@example.com",
});
await db.insert(users).values(newUser);
```

## 🔄 Server Actions with Forms

### Server Action with Zod Validation

```typescript
// app/actions.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

export async function createUser(prevState: any, formData: FormData) {
  const result = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });
  
  if (!result.success) {
    return { 
      success: false, 
      errors: result.error.flatten().fieldErrors 
    };
  }
  
  await db.insert(users).values(result.data);
  revalidatePath("/users");
  return { success: true };
}
```

### Client Component with useActionState

```typescript
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createUser } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Submitting..." : "Submit"}
    </button>
  );
}

export function UserForm() {
  const [state, formAction] = useActionState(createUser, null);
  
  return (
    <form action={formAction}>
      <input name="name" required />
      <input name="email" type="email" required />
      <SubmitButton />
      {state?.errors && <div>{JSON.stringify(state.errors)}</div>}
      {state?.success && <div>Success!</div>}
    </form>
  );
}
```

## 🔄 TanStack React Query

### Setup Provider

```typescript
// app/providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000 },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### useQuery Pattern

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";

export function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}`);
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  return <div>{data.name}</div>;
}
```

### useMutation Pattern

```typescript
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export function CreatePost() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (data: { title: string }) => {
      const res = await fetch("/api/posts", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return (
    <button onClick={() => mutation.mutate({ title: "New Post" })}>
      Create Post
    </button>
  );
}
```

## 💾 TanStack React Store

### Create Store

```typescript
// stores/ui-store.ts
import { Store } from "@tanstack/react-store";

export const uiStore = new Store({
  sidebarOpen: false,
  theme: "light" as "light" | "dark",
});

export function toggleSidebar() {
  uiStore.setState((state) => ({
    ...state,
    sidebarOpen: !state.sidebarOpen,
  }));
}
```

### Use Store

```typescript
"use client";

import { useStore } from "@tanstack/react-store";
import { uiStore, toggleSidebar } from "@/stores/ui-store";

export function Sidebar() {
  const sidebarOpen = useStore(uiStore, (state) => state.sidebarOpen);
  
  return (
    <aside className={sidebarOpen ? "open" : "closed"}>
      <button onClick={toggleSidebar}>Toggle</button>
    </aside>
  );
}
```

## 🤖 Vercel AI SDK

### useObject Pattern

```typescript
"use client";

import { useObject } from "@ai-sdk/react";
import { z } from "zod";

const schema = z.object({
  title: z.string(),
  items: z.array(z.string()),
});

export function AIComponent() {
  const { object, submit, isLoading } = useObject({
    api: "/api/generate",
    schema,
  });

  return (
    <div>
      <button onClick={() => submit("Generate list")} disabled={isLoading}>
        Generate
      </button>
      {object && (
        <div>
          <h2>{object.title}</h2>
          <ul>
            {object.items?.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### AI Route Handler

```typescript
// app/api/generate/route.ts
import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { z } from "zod";

const schema = z.object({
  title: z.string(),
  items: z.array(z.string()),
});

export async function POST(req: Request) {
  const { prompt } = await req.json();
  
  const result = streamObject({
    model: openai("gpt-4o"),
    schema,
    prompt,
  });

  return result.toTextStreamResponse();
}
```

## 🎨 shadcn/ui Components

```bash
# Add components
npx shadcn@latest add button
npx shadcn@latest add form
npx shadcn@latest add dialog
npx shadcn@latest add card

# Use in your code
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
```

## 🌍 Environment Variables

```typescript
// envConfig.ts
import { loadEnvConfig } from "@next/env";
import { z } from "zod";

loadEnvConfig(process.cwd());

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  OPENAI_API_KEY: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
```

## 📝 TypeScript Patterns

### Infer Types from Zod and Drizzle

```typescript
// From Zod
const userSchema = z.object({ name: z.string() });
type User = z.infer<typeof userSchema>;

// From Drizzle
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// From drizzle-zod (best practice)
const insertUserSchema = createInsertSchema(users);
type InsertUser = z.infer<typeof insertUserSchema>;
```

## 🚀 Quick Start New Feature

1. **Add Database Table**: Update `db/schema.ts` with drizzle-zod
2. **Generate Migration**: `pnpm db:generate && pnpm db:migrate`
3. **Create Server Action**: Add to `app/actions.ts` with Zod validation
4. **Create Component**: Use Server Component or Client Component with React Query
5. **Add UI**: Install shadcn/ui components as needed
6. **Test**: Validate with Zod, test edge cases

---

For more details, see:
- [Full Documentation](./README.md)
- [Cursor Rules](./.cursorrules)
- [Contributing Guide](./CONTRIBUTING.md)

