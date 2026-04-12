# Zod Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement robust data validation using Zod for AI outputs and spreadsheet inputs.

**Architecture:** Define a central Zod schema for expense data and use it to validate data at service boundaries (Gemini output and Sheets input).

**Tech Stack:** Bun.js, TypeScript, Zod.

---

### Task 1: Setup Zod and Schema

**Files:**
- Modify: `package.json`
- Create: `src/schemas/expense.ts`

- [ ] **Step 1: Install Zod**

Run: `bun add zod`

- [ ] **Step 2: Create the Expense schema**

Create `src/schemas/expense.ts`:
```typescript
import { z } from 'zod';

export const ExpenseCategorySchema = z.enum([
  'Food', 'Transport', 'Shopping', 'Bills', 'Others'
]);

export const ExpenseSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().min(1),
  description: z.string().min(1),
  category: ExpenseCategorySchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
});

export type ExpenseData = z.infer<typeof ExpenseSchema>;
```

- [ ] **Step 3: Commit**

Run: `git add package.json src/schemas/expense.ts && git commit -m "feat: add zod and expense schema"`

---

### Task 2: Integrate Validation in Gemini Service

**Files:**
- Modify: `src/services/gemini.ts`
- Test: `src/services/gemini.test.ts`

- [ ] **Step 1: Add a failing test for invalid AI response**

Modify `src/services/gemini.test.ts` to add a test case for invalid data:
```typescript
  it('should throw ZodError if AI returns invalid data', async () => {
    const { parseExpense, genAI } = await import('./gemini');
    
    // Mocking a response with invalid amount
    mock.module("@google/generative-ai", () => ({
      GoogleGenerativeAI: class {
        getGenerativeModel() {
          return {
            generateContent: async () => ({
              response: {
                text: () => JSON.stringify({
                  amount: -50, // Invalid: must be positive
                  currency: '$',
                  description: 'invalid',
                  category: 'Food',
                  date: '2026-04-12'
                })
              }
            })
          }
        }
      }
    }));

    await expect(parseExpense("invalid input")).rejects.toThrow();
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/services/gemini.test.ts`
Expected: FAIL (it currently won't throw because it's not using Zod)

- [ ] **Step 3: Update `src/services/gemini.ts` to use Zod**

```typescript
import { GoogleGenerativeAI, type GenerateContentResult } from "@google/generative-ai";
import { ExpenseSchema } from "../schemas/expense";

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
export const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

export async function parseExpense(input: string | Buffer, isImage = false) {
  const prompt = `Extract expense details from the following ${isImage ? 'image' : 'text'}. 
  Return ONLY a JSON object with: amount (number), currency (string), description (string), category (string), date (YYYY-MM-DD).
  Default date to today if not found. Categories should be one of: Food, Transport, Shopping, Bills, Others.`;

  const maxRetries = 3;
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      let result: GenerateContentResult;
      if (typeof input === 'string') {
        result = await model.generateContent([prompt, input]);
      } else {
        result = await model.generateContent([
          prompt,
          { inlineData: { data: input.toString("base64"), mimeType: "image/jpeg" } }
        ]);
      }

      const response = await result.response;
      const text = response.text();
      const jsonMatch = text.match(/\{.*\}/s);
      if (!jsonMatch) throw new Error("Failed to parse AI response");
      
      const rawData = JSON.parse(jsonMatch[0]);
      return ExpenseSchema.parse(rawData);
    } catch (error: any) {
      lastError = error;
      // If it's a ZodError, don't retry (it's a content issue, not a service issue)
      if (error.name === 'ZodError') throw error;

      const isTransient = error.message?.includes('503') || error.message?.includes('429');
      if (isTransient && attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Gemini API busy (attempt ${attempt + 1}). Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test src/services/gemini.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

Run: `git add src/services/gemini.ts src/services/gemini.test.ts && git commit -m "feat: validate gemini output with zod"`

---

### Task 3: Integrate Validation in Sheets Service

**Files:**
- Modify: `src/services/sheets.ts`
- Test: `src/services/sheets.test.ts`

- [ ] **Step 1: Update `src/services/sheets.ts` to validate input**

```typescript
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { ExpenseSchema, type ExpenseData } from '../schemas/expense';

export async function saveToSheet(data: ExpenseData) {
  // Validate at the boundary
  ExpenseSchema.parse(data);

  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID || '', serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    
    const rowData = {
      Date: data.date,
      Description: data.description,
      Category: data.category,
      Amount: data.amount,
      Currency: data.currency,
      'Raw Message': JSON.stringify(data)
    };

    try {
      await sheet.addRow(rowData);
    } catch (e: any) {
      if (e.message && e.message.includes('No values in the header row')) {
        console.log('Empty sheet detected. Initializing headers...');
        await sheet.setHeaderRow(['Date', 'Description', 'Category', 'Amount', 'Currency', 'Raw Message']);
        await sheet.addRow(rowData);
      } else {
        throw e;
      }
    }
  } catch (error) {
    console.error('Error saving to Google Sheets:', error);
    throw error;
  }
}
```

- [ ] **Step 2: Add test for validation failure in `sheets.test.ts`**

```typescript
  it('should throw error if input data is invalid', async () => {
    const { saveToSheet } = await import('./sheets');
    const invalidData = {
      amount: -10, // Invalid
      currency: '$',
      description: 'coffee',
      category: 'Food' as any,
      date: '2026-04-12'
    };
    await expect(saveToSheet(invalidData)).rejects.toThrow();
  });
```

- [ ] **Step 3: Run tests**

Run: `bun test src/services/sheets.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

Run: `git add src/services/sheets.ts src/services/sheets.test.ts && git commit -m "feat: validate sheet input with zod"`

---

### Task 4: Update Bot Error Handling

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Update catch blocks to handle ZodError specifically**

```typescript
// Add ZodError to imports or use error name check
import { ZodError } from 'zod';

// ... inside bot.on('text') catch block
  } catch (err) {
    console.error(err);
    if (err instanceof ZodError) {
       return ctx.reply('❌ Data validation failed. The AI provided an invalid format. Please try again.');
    }
    ctx.reply('❌ The AI service is currently busy or unavailable. Please try again in a few minutes.');
  }

// ... do same for bot.on('photo')
```

- [ ] **Step 2: Commit**

Run: `git add src/index.ts && git commit -m "feat: handle zod validation errors in bot"`
