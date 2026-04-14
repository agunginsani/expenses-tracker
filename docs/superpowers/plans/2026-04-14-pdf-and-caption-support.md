# PDF, Caption Support, and Strict Date Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable the bot to process PDF invoices, utilize captions for better context, and strictly validate transaction dates.

**Architecture:** Use Gemini 1.5 Flash's multi-modal capabilities to process image/PDF buffers alongside text captions. Validation is enforced via Zod and handled in the bot's middleware/handlers.

**Tech Stack:** TypeScript, Telegraf, Zod, Google Generative AI SDK.

---

### Task 1: Update Expense Schema for Strict Validation

**Files:**
- Modify: `src/schemas/expense.ts`

- [ ] **Step 1: Ensure date validation is strict**

Update `src/schemas/expense.ts`:
```typescript
export const ExpenseSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().min(1),
  description: z.string().min(1),
  category: ExpenseCategorySchema,
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});
```

- [ ] **Step 2: Commit**

```bash
git add src/schemas/expense.ts
git commit -m "chore: ensure strict date validation in schema"
```

---

### Task 2: Refactor Gemini Service for PDF and Captions

**Files:**
- Modify: `src/services/gemini.ts`

- [ ] **Step 1: Update `parseExpense` signature and multi-modal logic**

Modify `src/services/gemini.ts`:
```typescript
export async function parseExpense(
  input: string | Buffer, 
  options: { mimeType?: string; caption?: string } = {}
) {
  const { mimeType = "image/jpeg", caption } = options;

  const prompt = `Extract expense details from the following media (image/PDF) or text. 
  Return ONLY a JSON object with: amount (number), currency (string), description (string), category (string), date (YYYY-MM-DD).
  
  STRICT DATE RULE: If the transaction date is not found in the provided content, do NOT guess. Set "date" to null.
  
  Categories MUST be one of: 
  - Food
  - Transport (or specific subclasses)
  - Shopping (or specific subclasses)
  - Bills (or specific subclasses)
  - Social
  - Others`;

  // ... inside retry loop
  let result: GenerateContentResult;
  if (typeof input === "string") {
    result = await model.generateContent([prompt, input]);
  } else {
    const parts: any[] = [
      prompt,
      {
        inlineData: {
          data: input.toString("base64"),
          mimeType: mimeType,
        },
      },
    ];
    if (caption) parts.push(`User note: ${caption}`);
    result = await model.generateContent(parts);
  }
  // ... rest of parsing logic
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/gemini.ts
git commit -m "feat: add PDF and caption support to Gemini service"
```

---

### Task 3: Add PDF Handler and Caption Extraction to Bot

**Files:**
- Modify: `src/bot.ts`

- [ ] **Step 1: Implement PDF document handler and update photo handler**

Update `src/bot.ts`:
```typescript
bot.on(message("document"), async (ctx) => {
  if (ctx.message.document.mime_type !== "application/pdf") return;
  try {
    await ctx.reply("⏳ Processing your PDF invoice...");
    const fileId = ctx.message.document.file_id;
    const link = await ctx.telegram.getFileLink(fileId);
    const response = await fetch(link.href);
    const buffer = Buffer.from(await response.arrayBuffer());

    const data = await parseExpense(buffer, { 
      mimeType: "application/pdf", 
      caption: ctx.message.caption 
    });
    await saveToSheet(data);
    ctx.reply(`✅ PDF Saved: ${data.amount} ${data.currency} for ${data.description}`);
  } catch (err) {
    handleBotError(ctx, err);
  }
});

// Update photo handler to pass caption
bot.on(message("photo"), async (ctx) => {
  // ... existing file download logic
  const data = await parseExpense(buffer, { 
    mimeType: "image/jpeg", 
    caption: ctx.message.caption 
  });
  // ...
});
```

- [ ] **Step 2: Add specific error handling for missing date**

```typescript
function handleBotError(ctx: any, err: any) {
  console.error(err);
  if (err instanceof ZodError) {
    const dateError = err.errors.find(e => e.path.includes("date"));
    if (dateError) {
      return ctx.reply("❌ Transaction date not found. Please provide it in the caption (e.g., 'Lunch on 2026-04-14') or send a clearer photo.");
    }
    return ctx.reply("❌ Data validation failed. Please try again.");
  }
  ctx.reply("❌ An error occurred while processing your expense.");
}
```

- [ ] **Step 3: Commit**

```bash
git add src/bot.ts
git commit -m "feat: add PDF handler and caption support to bot"
```

---

### Task 4: Verify with Tests

**Files:**
- Modify: `src/services/gemini.test.ts`

- [ ] **Step 1: Add test cases for PDF and captions**
- [ ] **Step 2: Add test case for missing date error**
- [ ] **Step 3: Run tests and verify**

Run: `npm test`
Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/services/gemini.test.ts
git commit -m "test: add tests for PDF, captions, and date validation"
```
