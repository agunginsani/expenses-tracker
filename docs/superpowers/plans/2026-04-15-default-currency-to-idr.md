# Default Currency to IDR Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Default the currency to "IDR" when no currency is detected in the input, while still allowing other currencies to be extracted if present.

**Architecture:** Update the `ExpenseSchema` in `src/schemas/expense.ts` to provide a default value for `currency`. Update the Gemini prompt in `src/services/gemini.ts` to guide the AI towards this default.

**Tech Stack:** TypeScript, Zod, Bun (for testing)

---

### Task 1: Update Expense Schema

**Files:**
- Modify: `src/schemas/expense.ts`

- [ ] **Step 1: Update ExpenseSchema to default currency**

Modify `src/schemas/expense.ts` to make `currency` optional with a default of "IDR".

```typescript
export const ExpenseSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().min(1).default("IDR"),
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
git commit -m "feat: default currency to IDR in ExpenseSchema"
```

### Task 2: Update Gemini Prompt

**Files:**
- Modify: `src/services/gemini.ts`

- [ ] **Step 1: Update the prompt in parseExpense**

Update the `prompt` string in `src/services/gemini.ts` to include the `CURRENCY DEFAULT RULE`.

```typescript
  const prompt = `Extract expense details from the following media (image/PDF) or text.
  Return ONLY a JSON object with: amount (number), currency (string), description (string), category (string), date (YYYY-MM-DD).

  STRICT DATE RULE: If the transaction date is not found in the provided content, do NOT guess. Set "date" to null.

  CATEGORY OVERRIDE RULE: If the user explicitly mentions one of the allowed categories in their text or user note (e.g., 'save it as Social', 'Transport: Taxi/Ojol'), you MUST use that category regardless of what the media content suggests.

  CURRENCY DEFAULT RULE: If the currency is not explicitly found in the content, use 'IDR' as the default.

  Categories MUST be one of:
  - Food
  - Transport (or specific: Transport: Gasoline, Transport: Parking fee, Transport: Public transport, Transport: Taxi/Ojol, Transport: Vehicle maintenance)
  - Shopping (or specific: Shopping: Groceries, Shopping: Fashion, Shopping: Gadgets)
  - Bills (or specific: Bills: Electricity, Bills: Water, Bills: Internet, Bills: Mobile Data, Bills: Rent, Bills: Subscription)
  - Social
  - Others`;
```

- [ ] **Step 2: Commit**

```bash
git add src/services/gemini.ts
git commit -m "feat: update gemini prompt to default currency to IDR"
```

### Task 3: Verify with Tests

**Files:**
- Modify: `src/services/gemini.test.ts`

- [ ] **Step 1: Add a test case for default currency**

Add a test case to `src/services/gemini.test.ts` to verify that missing currency defaults to "IDR".

```typescript
  it("should default to IDR if currency is missing in AI response", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            amount: 50000,
            // currency missing
            description: "no currency mentioned",
            category: "Others",
            date: "2026-04-15",
          }),
      },
    });

    const { parseExpense } = await import("./gemini.js");
    const result = await parseExpense("50000 for something");

    expect(result.currency).toBe("IDR");
  });
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `bun test src/services/gemini.test.ts`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/services/gemini.test.ts
git commit -m "test: add test for default currency fallback"
```
