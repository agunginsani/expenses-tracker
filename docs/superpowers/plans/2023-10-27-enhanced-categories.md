# Enhanced Expense Categories Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add "Social" category and sub-categories for "Shopping", "Bills", and "Transport" using a hierarchical format in the existing "Category" column.

**Architecture:** Update the Zod schema for validation and the Gemini prompt for accurate classification. The "Category" column in Google Sheets will store the hierarchical string (e.g., `Shopping: Groceries`).

**Tech Stack:** TypeScript, Zod, Gemini API, Bun (Test runner).

---

### Task 1: Update Expense Category Schema

**Files:**
- Modify: `src/schemas/expense.ts`

- [ ] **Step 1: Update the ExpenseCategorySchema**

Modify the enum to include all new categories and sub-categories.

```typescript
export const ExpenseCategorySchema = z.enum([
  "Food",
  "Transport",
  "Transport: Gasoline",
  "Transport: Parking fee",
  "Transport: Public transport",
  "Transport: Taxi/Ojol",
  "Transport: Vehicle maintenance",
  "Shopping",
  "Shopping: Groceries",
  "Shopping: Fashion",
  "Shopping: Gadgets",
  "Bills",
  "Bills: Electricity",
  "Bills: Water",
  "Bills: Internet",
  "Bills: Mobile Data",
  "Bills: Rent",
  "Bills: Subscription",
  "Social",
  "Others",
]);
```

- [ ] **Step 2: Commit changes**

```bash
git add src/schemas/expense.ts
git commit -m "feat: add Social and sub-categories for Shopping, Bills, and Transport to schema"
```

---

### Task 2: Update Gemini Prompt for Hierarchical Categories

**Files:**
- Modify: `src/services/gemini.ts`

- [ ] **Step 1: Update the prompt in parseExpense**

Update the prompt to list all available categories and instruct on hierarchy.

```typescript
export async function parseExpense(input: string | Buffer, isImage = false) {
  const prompt = `Extract expense details from the following ${isImage ? "image" : "text"}. 
  Return ONLY a JSON object with: amount (number), currency (string), description (string), category (string), date (YYYY-MM-DD).
  Default date to today if not found. 
  Categories MUST be one of: 
  - Food
  - Transport (or specific: Transport: Gasoline, Transport: Parking fee, Transport: Public transport, Transport: Taxi/Ojol, Transport: Vehicle maintenance)
  - Shopping (or specific: Shopping: Groceries, Shopping: Fashion, Shopping: Gadgets)
  - Bills (or specific: Bills: Electricity, Bills: Water, Bills: Internet, Bills: Mobile Data, Bills: Rent, Bills: Subscription)
  - Social
  - Others`;
...
```

- [ ] **Step 2: Commit changes**

```bash
git add src/services/gemini.ts
git commit -m "feat: update Gemini prompt with comprehensive sub-categories"
```

---

### Task 3: Update and Run Gemini Tests

**Files:**
- Modify: `src/services/gemini.test.ts`

- [ ] **Step 1: Add tests for new categories**

Add test cases for different sub-categories to verify Gemini parsing.

```typescript
  it("should parse Bills sub-category", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            amount: 500000,
            currency: "IDR",
            description: "PLN bill",
            category: "Bills: Electricity",
            date: "2023-10-27",
          }),
      },
    });

    const { parseExpense } = await import("./gemini.js");
    const result = await parseExpense("500k for electricity");

    expect(result).toEqual({
      amount: 500000,
      currency: "IDR",
      description: "PLN bill",
      category: "Bills: Electricity",
      date: "2023-10-27",
    });
  });

  it("should parse Transport sub-category", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            amount: 25000,
            currency: "IDR",
            description: "parking",
            category: "Transport: Parking fee",
            date: "2023-10-27",
          }),
      },
    });

    const { parseExpense } = await import("./gemini.js");
    const result = await parseExpense("25k parking");

    expect(result).toEqual({
      amount: 25000,
      currency: "IDR",
      description: "parking",
      category: "Transport: Parking fee",
      date: "2023-10-27",
    });
  });
```

- [ ] **Step 2: Run the tests**

Run: `bun test src/services/gemini.test.ts`
Expected: PASS

- [ ] **Step 3: Commit changes**

```bash
git add src/services/gemini.test.ts
git commit -m "test: add tests for Bills and Transport sub-categories"
```

---

### Task 4: Update and Run Sheets Tests

**Files:**
- Modify: `src/services/sheets.test.ts`

- [ ] **Step 1: Add tests for hierarchical categories in Sheets service**

```typescript
  it("should handle multi-level hierarchical categories in saveToSheet", async () => {
    const { saveToSheet } = await import("./sheets.js");

    const data = {
      amount: 500000,
      currency: "IDR",
      description: "Monthly Rent",
      category: "Bills: Rent",
      date: "2023-10-27",
    };

    await saveToSheet(data);

    expect(mockAddRow).toHaveBeenCalledWith({
      Date: data.date,
      Description: data.description,
      Category: data.category,
      Amount: data.amount,
      Currency: data.currency,
    });
  });
```

- [ ] **Step 2: Run the tests**

Run: `bun test src/services/sheets.test.ts`
Expected: PASS

- [ ] **Step 3: Commit changes**

```bash
git add src/services/sheets.test.ts
git commit -m "test: verify multi-level categories save correctly to sheets"
```
