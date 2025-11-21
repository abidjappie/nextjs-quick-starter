# Workflow DevKit Guide

This application includes [Workflow DevKit](https://useworkflow.dev), a framework for building durable, long-running workflows with automatic retries, suspense, and observability.

## Table of Contents

- [What is Workflow DevKit?](#what-is-workflow-devkit)
- [When to Use Workflows](#when-to-use-workflows)
- [Core Concepts](#core-concepts)
- [Quick Start](#quick-start)
- [Common Use Cases](#common-use-cases)
- [AI Integration](#ai-integration)
- [Best Practices](#best-practices)
- [Development & Debugging](#development--debugging)
- [API Reference](#api-reference)

---

## What is Workflow DevKit?

Workflow DevKit enables you to build **durable workflows** that can:

- ✅ Suspend execution for seconds, hours, days, or months without consuming resources
- ✅ Automatically retry failed steps with exponential backoff
- ✅ Handle long-running processes without timeouts
- ✅ Orchestrate complex multi-step operations
- ✅ Observe and debug execution with built-in tooling

Think of workflows as **reliable background jobs** that pause, wait, retry, and resume automatically.

---

## When to Use Workflows

### ✅ Perfect For

- **Multi-step processes with delays** (user onboarding, trial management)
- **Long-running operations** (data pipelines, report generation)
- **Reliable background jobs** (email campaigns, webhook delivery)
- **Complex orchestration** (multi-service coordination, approval workflows)
- **Time-sensitive operations** (scheduled posts, reminders)
- **AI operations** (content generation, document processing)

### ❌ Not Recommended For

- Simple CRUD operations
- Real-time interactions
- Synchronous responses
- High-frequency events
- Sub-second operations

---

## Core Concepts

### 1. Workflows (`"use workflow"`)

A workflow orchestrates steps and manages execution flow:

```typescript
import { sleep } from "workflow";

export async function onboardUser(userId: string) {
  "use workflow";
  
  await sendWelcomeEmail(userId);
  await sleep("3d"); // Wait 3 days
  await sendFollowUpEmail(userId);
  
  return { status: "completed" };
}
```

### 2. Steps (`"use step"`)

A step is a retriable unit of work:

```typescript
async function sendWelcomeEmail(userId: string) {
  "use step";
  
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  
  if (!user) {
    throw new FatalError("User not found");
  }
  
  await emailService.send({ to: user.email });
}
```

**Key Points:**
- Runs in separate requests (non-blocking)
- Automatically retries on failure
- Use `FatalError` to skip retries

### 3. Sleep

Suspend execution without consuming resources:

```typescript
await sleep("5s");   // 5 seconds
await sleep("30m");  // 30 minutes
await sleep("2h");   // 2 hours
await sleep("3d");   // 3 days
await sleep("1w");   // 1 week
```

### 4. Error Handling

```typescript
import { FatalError } from "workflow";

async function processPayment(orderId: string) {
  "use step";
  
  const order = await getOrder(orderId);
  
  // Retriable error
  if (serviceUnavailable) {
    throw new Error("Payment gateway timeout"); // Will retry
  }
  
  // Non-retriable error
  if (order.amount <= 0) {
    throw new FatalError("Invalid amount"); // Won't retry
  }
}
```

---

## Quick Start

### 1. Create a Workflow

```typescript
// workflows/user-signup.ts
import { sleep, FatalError } from "workflow";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function handleUserSignup(email: string) {
  "use workflow";
  
  const user = await createUser(email);
  await sendWelcomeEmail(user.id);
  
  await sleep("5s");
  
  await sendOnboardingEmail(user.id);
  
  return { userId: user.id, status: "onboarded" };
}

async function createUser(email: string) {
  "use step";
  
  const [user] = await db.insert(users)
    .values({ email, name: email.split("@")[0] })
    .returning();
  
  return user;
}

async function sendWelcomeEmail(userId: number) {
  "use step";
  
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  
  if (!user) throw new FatalError("User not found");
  
  // Send email (will retry on failure)
  await emailService.send({ to: user.email });
}

async function sendOnboardingEmail(userId: number) {
  "use step";
  // Similar implementation
}
```

### 2. Trigger from API Route

```typescript
// app/api/signup/route.ts
import { start } from "workflow/api";
import { handleUserSignup } from "@/workflows/user-signup";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email } = await request.json();
  
  await start(handleUserSignup, [email]);
  
  return NextResponse.json({
    message: "Signup workflow started",
  });
}
```

### 3. Test Your Workflow

```bash
# Start dev server
pnpm dev

# Trigger workflow
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}' \
  http://localhost:3000/api/signup
```

---

## Common Use Cases

### Email Campaign

```typescript
export async function runEmailCampaign(campaignId: string) {
  "use workflow";
  
  const recipients = await getRecipients(campaignId);
  
  for (const recipient of recipients) {
    await sendEmail(recipient);
    await sleep("2s"); // Respect rate limits
  }
}
```

### Order Processing

```typescript
export async function processOrder(orderId: string) {
  "use workflow";
  
  await verifyPayment(orderId);
  await updateInventory(orderId);
  await createShipment(orderId);
  await sendConfirmation(orderId);
  
  await sleep("3d");
  await sendFollowUp(orderId);
}
```

### Trial Management

```typescript
export async function manageTrial(userId: string) {
  "use workflow";
  
  await activateTrial(userId);
  
  await sleep("7d");
  await sendMidTrialReminder(userId);
  
  await sleep("7d");
  const user = await getUser(userId);
  
  if (!user.isPaid) {
    await endTrial(userId);
    await sendUpgradeReminder(userId);
  }
}
```

---

## AI Integration

Workflow DevKit is **excellent for AI operations** due to automatic retry handling and rate limiting support.

### Why Workflows for AI?

- ✅ Handle rate limits automatically
- ✅ Retry on transient failures
- ✅ Add delays between expensive API calls
- ✅ Chain multiple AI operations
- ✅ Process large batches reliably

### Example: AI Content Generation

```typescript
import { sleep, FatalError } from "workflow";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function generateBlogPost(topic: string) {
  "use workflow";
  
  const outline = await generateOutline(topic);
  await sleep("2s"); // Rate limit protection
  
  const content = await generateContent(topic, outline);
  await sleep("2s");
  
  const metadata = await generateMetadata(content);
  
  return await savePost({ topic, content, metadata });
}

async function generateOutline(topic: string) {
  "use step";
  
  try {
    const result = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `Create an outline for: ${topic}`,
    });
    return result.text;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    
    if (message.includes("rate_limit")) {
      throw new Error("Rate limited - will retry");
    }
    
    if (message.includes("400")) {
      throw new FatalError("Invalid request");
    }
    
    throw error;
  }
}
```

See `workflows/ai-content-generation.ts` for a complete example with:
- Multi-step AI orchestration
- Rate limit handling
- Structured outputs with Zod
- Error handling patterns
- Database integration

---

## Best Practices

### 1. Keep Workflows Focused

✅ **Good**: Single-purpose workflows
```typescript
export async function onboardUser(userId: string) {
  "use workflow";
  await sendWelcomeEmail(userId);
  await sleep("3d");
  await sendTips(userId);
}
```

❌ **Bad**: Too many responsibilities
```typescript
export async function doEverything(userId: string) {
  "use workflow";
  await onboardUser(userId);
  await processOrders(userId);
  await generateReports(userId);
}
```

### 2. Use Steps for Retriable Operations

✅ **Good**: External calls in steps
```typescript
async function callAPI(data: any) {
  "use step"; // Auto-retry on failure
  return await fetch("https://api.example.com", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
```

❌ **Bad**: External calls in workflow
```typescript
export async function myWorkflow(data: any) {
  "use workflow";
  await fetch("https://api.example.com"); // No retry
}
```

### 3. Handle Errors Appropriately

Use `FatalError` for non-retriable errors:

```typescript
async function processData(data: any) {
  "use step";
  
  // Validation error - don't retry
  if (!data.id) {
    throw new FatalError("Missing ID");
  }
  
  // Transient error - will retry
  if (serviceDown) {
    throw new Error("Service unavailable");
  }
}
```

### 4. Validate Inputs

```typescript
import { z } from "zod";

const inputSchema = z.object({
  email: z.string().email(),
  userId: z.string().uuid(),
});

export async function myWorkflow(input: unknown) {
  "use workflow";
  
  const validated = inputSchema.parse(input);
  // Use validated data
}
```

### 5. Make Steps Idempotent

✅ **Good**: Safe to retry
```typescript
async function createUser(email: string) {
  "use step";
  
  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  
  if (existing) return existing;
  
  return await db.insert(users).values({ email });
}
```

---

## Development & Debugging

### Inspect Workflows

```bash
# List all workflow runs
pnpm workflow:runs

# Launch web UI
pnpm workflow:inspect
```

The web UI shows:
- Workflow run status
- Step execution timeline
- Error details and retry history
- Input/output data

### Logging

```typescript
export async function myWorkflow(data: string) {
  "use workflow";
  
  console.log("Workflow started:", data);
  await myStep(data);
  console.log("Workflow completed");
}

async function myStep(data: string) {
  "use step";
  console.log("Step executing:", data);
}
```

---

## API Reference

### Workflow Functions

```typescript
import { start, sleep, FatalError } from "workflow";
import { start } from "workflow/api";

// Start a workflow
await start(myWorkflow, [arg1, arg2]);

// Sleep in workflow
await sleep("5s");  // 5 seconds
await sleep("30m"); // 30 minutes
await sleep("2h");  // 2 hours
await sleep("3d");  // 3 days
await sleep("1w");  // 1 week

// Throw non-retriable error
throw new FatalError("Won't retry");
```

### Directives

```typescript
// Mark function as workflow
"use workflow";

// Mark function as step
"use step";
```

---

## Deployment

Workflow DevKit works best on **Vercel** with zero configuration.

### Environment Variables

No additional environment variables needed! Works out of the box.

### Production Considerations

1. **Logs**: Use proper logging for observability
2. **Monitoring**: Monitor workflow failures
3. **Testing**: Test workflows thoroughly
4. **Timeouts**: Be aware of platform limits (Vercel: 60s for Pro)

---

## Troubleshooting

### Workflow Not Starting

**Problem**: Workflow doesn't execute.

**Solution**:
- Verify `withWorkflow()` in `next.config.ts`
- Check TypeScript plugin in `tsconfig.json`
- Restart dev server after config changes

### Steps Not Retrying

**Problem**: Failed steps don't retry.

**Solution**:
- Ensure `"use step"` directive is present
- Check if `FatalError` is being thrown
- Verify error is actually thrown (not caught)

### Proxy Blocking Requests

**Problem**: Workflows fail with auth errors.

**Solution**:
- Ensure `.well-known/workflow` is excluded in `proxy.ts`
- Check matcher pattern in config

---

## Resources

- **Official Documentation**: https://useworkflow.dev/docs
- **Getting Started**: https://useworkflow.dev/docs/getting-started/next
- **API Reference**: https://useworkflow.dev/docs/api-reference
- **Foundations**: https://useworkflow.dev/docs/foundations

Happy workflow building! 🚀

For detailed examples and advanced patterns, see:
- `workflows/ai-content-generation.ts` - AI workflow example
- [Official Workflow DevKit Documentation](https://useworkflow.dev/docs)
