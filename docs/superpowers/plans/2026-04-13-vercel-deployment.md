# Vercel Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy the Expenses Tracker bot to Vercel as a Serverless Function using Telegram Webhooks to achieve $0/month cost.

**Architecture:** Transition from active long-polling to a passive webhook model. A Vercel Serverless Function will receive POST requests from Telegram and process them using the existing bot logic.

**Tech Stack:** Node.js, Bun, TypeScript, Telegraf, Vercel.

---

### Task 1: Refactor Bot Logic into a Reusable Module

**Files:**
- Create: `src/bot.ts`
- Modify: `src/index.ts`

- [ ] **Step 1: Create `src/bot.ts` with the core bot logic**

```typescript
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { ZodError } from "zod";
import { parseExpense } from "./services/gemini.js";
import { saveToSheet } from "./services/sheets.js";

export const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || "");

bot.start((ctx) =>
  ctx.reply("Welcome! Send me an expense text or a receipt photo."),
);

bot.on(message("text"), async (ctx) => {
  try {
    await ctx.reply("⏳ Processing your expense...");
    const data = await parseExpense(ctx.message.text);
    await saveToSheet(data);
    ctx.reply(
      `✅ Saved: ${data.amount} ${data.currency} for ${data.description} (${data.category})`,
    );
  } catch (err) {
    console.error(err);
    if (err instanceof ZodError) {
      return ctx.reply(
        "❌ Data validation failed. The AI provided an invalid format. Please try again.",
      );
    }
    ctx.reply(
      "❌ The AI service is currently busy or unavailable. Please try again in a few minutes.",
    );
  }
});

bot.on(message("photo"), async (ctx) => {
  try {
    await ctx.reply("⏳ Processing your receipt photo...");
    const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    const link = await ctx.telegram.getFileLink(fileId);
    const response = await fetch(link.href);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const data = await parseExpense(buffer, true);
    await saveToSheet(data);
    ctx.reply(
      `📸 Receipt saved: ${data.amount} ${data.currency} at ${data.description}`,
    );
  } catch (err) {
    console.error(err);
    if (err instanceof ZodError) {
      return ctx.reply(
        "❌ Data validation failed. The AI provided an invalid format. Please try again.",
      );
    }
    ctx.reply(
      "❌ The AI service is currently busy or unavailable. Please try again in a few minutes.",
    );
  }
});
```

- [ ] **Step 2: Update `src/index.ts` to use the exported `bot` for local polling**

```typescript
import { bot } from "./bot.js";

console.log("Bot is starting in polling mode (local)...");
bot.launch().catch((err) => console.error("Failed to launch bot:", err));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
```

- [ ] **Step 3: Run local tests to ensure bot still works**

Run: `bun run start`
Expected: Bot starts in polling mode and responds to messages.

- [ ] **Step 4: Commit**

```bash
git add src/bot.ts src/index.ts
git commit -m "refactor: separate bot logic from entry point"
```

---

### Task 2: Create Vercel Serverless Function Entry Point

**Files:**
- Create: `api/index.ts`

- [ ] **Step 1: Implement the Vercel function handler**

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { bot } from '../src/bot.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    // Verify token if provided as a query param (simple security)
    const { token } = req.query;
    if (token !== process.env.TELEGRAM_BOT_TOKEN) {
      return res.status(401).send('Unauthorized');
    }

    await bot.handleUpdate(req.body, res);
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).send('Internal Server Error');
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add api/index.ts
git commit -m "feat: add vercel serverless function entry point"
```

---

### Task 3: Add Vercel Configuration

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Create `vercel.json` with routing rules**

```json
{
  "version": 2,
  "rewrites": [
    { "source": "/api/webhook", "destination": "/api/index.ts" }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add vercel.json
git commit -m "config: add vercel configuration"
```

---

### Task 4: Add Webhook Registration Script

**Files:**
- Create: `scripts/set-webhook.ts`

- [ ] **Step 1: Implement the script to call Telegram's `setWebhook` API**

```typescript
import { bot } from "../src/bot.js";

const url = process.argv[2];

if (!url) {
  console.error("Please provide the deployment URL as an argument.");
  process.exit(1);
}

const webhookUrl = `${url}/api/webhook?token=${process.env.TELEGRAM_BOT_TOKEN}`;

console.log(`Setting webhook to: ${webhookUrl}`);

bot.telegram.setWebhook(webhookUrl)
  .then((result) => {
    if (result) {
      console.log("✅ Webhook set successfully!");
    } else {
      console.error("❌ Failed to set webhook.");
    }
  })
  .catch((err) => {
    console.error("❌ Error setting webhook:", err);
  });
```

- [ ] **Step 2: Commit**

```bash
git add scripts/set-webhook.ts
git commit -m "feat: add webhook registration script"
```

---

### Task 5: Final Validation and Documentation

**Files:**
- Modify: `README.md`
- Modify: `package.json`

- [ ] **Step 1: Add deployment instructions to `README.md`**

```markdown
## Deployment (Vercel)

1. Connect your GitHub repository to Vercel.
2. Configure environment variables in the Vercel Dashboard:
   - `TELEGRAM_BOT_TOKEN`
   - `GEMINI_API_KEY`
   - `GOOGLE_SHEET_ID`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY` (Replace `\n` with literal newlines if necessary)
3. Once deployed, run the following command locally to register the webhook:
   ```bash
   TELEGRAM_BOT_TOKEN=your_token bun scripts/set-webhook.ts https://your-project.vercel.app
   ```
```

- [ ] **Step 2: Add `set-webhook` script to `package.json`**

```json
"scripts": {
  ...
  "set-webhook": "bun scripts/set-webhook.ts"
}
```

- [ ] **Step 3: Commit**

```bash
git add README.md package.json
git commit -m "docs: add deployment instructions and scripts"
```
