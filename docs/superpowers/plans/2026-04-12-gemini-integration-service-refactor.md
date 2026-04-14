# Gemini Integration Service Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the Gemini Integration Service to improve type safety and ensure robust, verifiable tests by mocking the AI client correctly.

**Architecture:** Use a factory pattern or dependency injection to make the service more testable, and use Bun's mocking capabilities to intercept and mock the GoogleGenerativeAI client.

**Tech Stack:** TypeScript, Bun, @google/generative-ai

---

### Task 1: Type Safety for Categories

**Files:**
- Modify: `src/services/gemini.ts`

- [ ] **Step 1: Update ExpenseData interface**

Update the `category` field to be a union of string literals.

```typescript
export type ExpenseCategory = 'Food' | 'Transport' | 'Shopping' | 'Bills' | 'Others';

export interface ExpenseData {
  amount: number;
  currency: string;
  description: string;
  category: ExpenseCategory;
  date: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/gemini.ts
git commit -m "feat(gemini): improve type safety for expense categories"
```

### Task 2: Make parseExpense Testable

**Files:**
- Modify: `src/services/gemini.ts`

- [ ] **Step 1: Refactor to allow dependency injection or provide a way to access the model**

To mock it easily in Bun, it's often better to export the model or use a function to get it. Alternatively, since Bun can mock modules, we can keep it as is but ensure we're importing everything correctly. Let's make `genAI` and `model` more accessible or ensure they can be intercepted.

Actually, for module mocking in Bun, it's better if they are initialized in a way that can be overridden or if we mock the whole module.

Let's refactor `src/services/gemini.ts` to use a function to get the model, or just rely on Bun's module mocking.

Wait, if I use Bun's `mock.module`, I can mock the `@google/generative-ai` package.

Let's modify `src/services/gemini.ts` to be more robust.

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

export type ExpenseCategory = 'Food' | 'Transport' | 'Shopping' | 'Bills' | 'Others';

export interface ExpenseData {
  amount: number;
  currency: string;
  description: string;
  category: ExpenseCategory;
  date: string;
}

// Export for testing if needed, but we'll try to mock the module
export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function parseExpense(input: string | Buffer, isImage = false): Promise<ExpenseData> {
  // ... rest of the code
}
```

Actually, let's keep the `genAI` and `model` internal but ensure they are used correctly.

- [ ] **Step 2: Commit**

```bash
git add src/services/gemini.ts
git commit -m "refactor(gemini): export model and genAI for better testability"
```

### Task 3: Improve Test Validity

**Files:**
- Modify: `src/services/gemini.test.ts`

- [ ] **Step 1: Implement mocking for @google/generative-ai**

```typescript
import { describe, it, expect, mock, spyOn } from 'bun:test';
import { parseExpense } from './gemini.js';

// Mock the GoogleGenerativeAI module
mock.module("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: class {
      getGenerativeModel() {
        return {
          generateContent: mock(async () => {
            return {
              response: {
                text: () => JSON.stringify({
                  amount: 10,
                  currency: '$',
                  description: 'coffee',
                  category: 'Food',
                  date: '2026-04-12'
                })
              }
            };
          })
        };
      }
    }
  };
});

describe('Gemini Service', () => {
  it('should parse simple text expense', async () => {
    const input = "10$ for coffee";
    const result = await parseExpense(input);
    
    expect(result).toEqual({
      amount: 10,
      currency: '$',
      description: 'coffee',
      category: 'Food',
      date: '2026-04-12'
    });
  });

  it('should parse image expense', async () => {
    const input = Buffer.from("fake-image-data");
    const result = await parseExpense(input, true);
    
    expect(result).toEqual({
      amount: 10,
      currency: '$',
      description: 'coffee',
      category: 'Food',
      date: '2026-04-12'
    });
  });
});
```

- [ ] **Step 2: Run tests and verify they pass**

Run: `bun test src/services/gemini.test.ts`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/services/gemini.test.ts
git commit -m "test(gemini): add proper mocking for Gemini API"
```
