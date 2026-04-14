# Category Override Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the capability to override the automatically detected expense category by explicitly mentioning an allowed category in the message text or caption.

**Architecture:** We will update the Gemini prompt in `src/services/gemini.ts` to instruct the LLM to prioritize explicit category mentions in the user's input. We will also add a test to verify this behavior.

**Tech Stack:** TypeScript, Telegraf, Google Generative AI (Gemini 1.5 Flash), Zod

---

### Task 1: Update Gemini Prompt

**Files:**
- Modify: `src/services/gemini.ts`

- [ ] **Step 1: Update the prompt in `parseExpense`**

Update the `prompt` string in `src/services/gemini.ts` to include the override instruction. The exact text to add is:
`CATEGORY OVERRIDE RULE: If the user explicitly mentions one of the allowed categories in their text or user note (e.g., 'save it as Social', 'Transport: Taxi/Ojol'), you MUST use that category regardless of what the media content suggests.`

- [ ] **Step 2: Commit**

```bash
git add src/services/gemini.ts
git commit -m "feat: add category override instruction to gemini prompt"
```

### Task 2: Add Test for Category Override

**Files:**
- Modify: `src/services/gemini.test.ts`

- [ ] **Step 1: Add a test case for category override**

Add the following test case to `src/services/gemini.test.ts` (inside a `describe` block or alongside other tests):

```typescript
import { test, expect } from "bun:test";
import { parseExpense } from "./gemini.js";

test("should override category if explicitly mentioned in text", async () => {
  const result = await parseExpense("150k for lunch with client, put it in Social. date is 2026-04-14");
  expect(result.amount).toBe(150000);
  expect(result.category).toBe("Social");
  expect(result.date).toBe("2026-04-14");
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `bun test src/services/gemini.test.ts`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/services/gemini.test.ts
git commit -m "test: add test for category override in gemini service"
```
