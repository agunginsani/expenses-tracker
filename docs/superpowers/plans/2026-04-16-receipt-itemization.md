# Receipt Itemization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract individual items from receipts and store them as a formatted list in the Google Spreadsheet description.

**Architecture:** Extend the Zod schema to capture an `items` array from Gemini, then format this array into a readable string within the service layer before returning the final data.

**Tech Stack:** TypeScript, Zod, Google Generative AI SDK.

---

### Task 1: Update Expense Schema

**Files:**
- Modify: `src/schemas/expense.ts`

- [ ] **Step 1: Add ItemSchema and update ExpenseSchema**

Update `src/schemas/expense.ts`:
```typescript
const ItemSchema = z.object({
  name: z.string(),
  quantity: z.number().optional(),
  price: z.number().optional(),
});

export const ExpenseSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().min(1).default("IDR"),
  description: z.string().min(1),
  category: ExpenseCategorySchema,
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  items: z.array(ItemSchema).optional(),
});
```

- [ ] **Step 2: Commit**

```bash
git add src/schemas/expense.ts
git commit -m "chore: update schema to support receipt items"
```

---

### Task 2: Refactor Gemini Service for Itemization

**Files:**
- Modify: `src/services/gemini.ts`

- [ ] **Step 1: Update the prompt to request items**

Update `src/services/gemini.ts`:
```typescript
  const prompt = `Extract expense details from the following media (image/PDF) or text.
  Return ONLY a JSON object with: 
  - amount (number)
  - currency (string)
  - description (string): a short summary of the overall purchase
  - category (string)
  - date (YYYY-MM-DD)
  - items (array of objects): each object with name (string), quantity (number, optional), and price (number, optional).

  STRICT DATE RULE: If the transaction date is not found in the provided content, do NOT guess. Set "date" to null.
  
  // ... existing rules
  `;
```

- [ ] **Step 2: Implement item formatting logic**

In `src/services/gemini.ts`, inside the `try` block:
```typescript
      const response = result.response;
      const text = response.text();
      const jsonMatch = text.match(/\{.*\}/s);
      if (!jsonMatch) throw new Error("Failed to parse AI response");

      const rawData = JSON.parse(jsonMatch[0]);
      
      // 1. Validate first to get a typed object
      const validatedData = ExpenseSchema.parse(rawData);
      
      // 2. Format items into description if they exist
      if (validatedData.items?.length) {
        const itemsList = validatedData.items
          .map(item => `- ${item.quantity ? `${item.quantity}x ` : ""}${item.name}${item.price ? `: ${item.price}` : ""}`)
          .join("\n");
        validatedData.description = `${validatedData.description}\n\nItems:\n${itemsList}`;
      }

      return validatedData;
```

- [ ] **Step 3: Commit**

```bash
git add src/services/gemini.ts
git commit -m "feat: add receipt itemization to Gemini service"
```

---

### Task 3: Verify with Tests

**Files:**
- Modify: `src/services/gemini.test.ts`

- [ ] **Step 1: Add test case for itemized receipt**

```typescript
    it("should extract and format individual items in description", async () => {
      // Mock implementation details will depend on your test setup
      // Ensure the AI mock returns an 'items' array
    });
```

- [ ] **Step 2: Run tests and verify**

Run: `npm test`
Expected: All tests pass, including the new itemization case.

- [ ] **Step 3: Commit**

```bash
git add src/services/gemini.test.ts
git commit -m "test: add tests for receipt itemization"
```
