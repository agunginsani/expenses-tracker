# Discount Inclusion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Include discounts in the itemized expense list with negative prices to ensure consistency with the grand total.

**Architecture:** Update the Gemini AI prompt to explicitly handle discounts as items with negative prices. Add unit tests to verify the behavior.

**Tech Stack:** TypeScript, Bun, Google Gemini AI.

---

### Task 1: Setup Branch

**Files:**
- Repository Root

- [ ] **Step 1: Create the feature branch**

```bash
git checkout -b discount-inclusion
```

---

### Task 2: Update AI Prompt

**Files:**
- Modify: `src/services/gemini.ts`

- [ ] **Step 1: Add the Discount Rule to the prompt**

Find the `STRICT DATE RULE` section in `src/services/gemini.ts` and add the `DISCOUNT RULE` before or after it:

```typescript
  STRICT DATE RULE: If the transaction date is not found in the provided content, do NOT guess. Set "date" to null.

  DISCOUNT RULE: If the transaction includes any discounts, vouchers, or promos, include them as items in the "items" array. Use the name found in the content (e.g., "Voucher", "Promo", "Disc") and set the "price" as a negative number.
```

- [ ] **Step 2: Commit**

```bash
git add src/services/gemini.ts
git commit -m "feat: add discount rule to Gemini prompt"
```

---

### Task 3: Update Tests

**Files:**
- Modify: `src/services/gemini.test.ts`

- [ ] **Step 1: Add test case for discounted receipt**

Add a new test in the `Gemini Service` describe block:

```typescript
  it("should include discounts as items with negative prices", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify({
          amount: 80000,
          currency: "IDR",
          description: "Lunch at Restaurant",
          category: "Food: Restaurant",
          date: "2026-04-12",
          items: [
            { name: "Pasta", quantity: 1, price: 100000 },
            { name: "Promo", price: -20000 },
          ],
        }),
      },
    });

    const result = await parseExpense("Lunch with promo");
    expect(result.description).toContain("Items:");
    expect(result.description).toContain("- Pasta: 100000");
    expect(result.description).toContain("- Promo: -20000");
    expect(result.amount).toBe(80000);
  });
```

- [ ] **Step 2: Run tests**

Run: `bun test src/services/gemini.test.ts`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/services/gemini.test.ts
git commit -m "test: add verification for discount inclusion in itemized list"
```

---

### Task 4: Final Verification

- [ ] **Step 1: Run all checks**

Run: `bun test && bun x tsc --noEmit && bun x biome check .`
Expected: PASS and clean.
