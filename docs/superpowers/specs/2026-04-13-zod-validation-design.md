# Design Doc: Zod Validation for External Data

Implement robust data validation using Zod for all external data boundaries, specifically the output from Gemini AI and the input to Google Sheets.

## Problem
The bot currently relies on simple TypeScript interfaces (`ExpenseData`) and `JSON.parse` for AI responses. If Gemini returns invalid JSON, missing fields, or hallucinated categories, the bot might fail silently or save corrupt data to Google Sheets.

## Goals
- Ensure all data entering the system (from Gemini) is strictly validated.
- Ensure all data leaving the system (to Google Sheets) is strictly validated.
- Fail fast with clear error messages if validation fails.
- Replace manual type checking with Zod's schema-driven validation.

## Architecture

### 1. Schema Definition (`src/schemas/expense.ts`)
A central Zod schema will define the "Source of Truth" for an expense.

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

### 2. Service Integration

#### Gemini Service (`src/services/gemini.ts`)
- Import `ExpenseSchema`.
- After parsing the AI's JSON string, call `ExpenseSchema.parse(json)`.
- This replaces the current manual regex and `JSON.parse` logic with a single, safe operation.

#### Sheets Service (`src/services/sheets.ts`)
- Import `ExpenseSchema`.
- Call `ExpenseSchema.parse(data)` at the start of `saveToSheet`.
- This acts as a "Gatekeeper" to prevent any invalid data from reaching the Google Sheets API.

### 3. Error Handling (`src/index.ts`)
- The bot's `try...catch` blocks will handle `ZodError`.
- If a validation error occurs, the bot will notify the user: "❌ Data validation failed. The AI provided an invalid format. Please try again."

## Testing Strategy
- **Unit Tests:** Update `gemini.test.ts` and `sheets.test.ts` to include "negative" test cases (passing invalid data and asserting that Zod throws an error).
- **Integration Tests:** Verify that the bot correctly handles a mocked `ZodError` by sending the appropriate Telegram message.

## Dependencies
- `zod`: Added to `dependencies` in `package.json`.
