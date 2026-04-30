# Flexible Date Expenses Command Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static `/today_expenses` command with a flexible `/expenses` command that supports natural language date parsing using `chrono-node`.

**Architecture:** Add a dedicated `date.ts` service for parsing and formatting dates to maintain clean separation between bot logic and utility logic. Replace the existing command registration in `src/bot.ts`.

**Tech Stack:** Bun, Telegraf, Chrono-node, TypeScript, Biome.

---

### Task 1: Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install `chrono-node`**

Run: `bun add chrono-node`

- [ ] **Step 2: Commit**

```bash
git add package.json bun.lockb
git commit -m "chore: add chrono-node for date parsing"
```

---

### Task 2: Date Parsing Service

**Files:**
- Create: `src/services/date.ts`
- Create: `src/services/date.test.ts`

- [ ] **Step 1: Implement the parsing service**

```typescript
import * as chrono from "chrono-node";

/**
 * Parses a natural language date string into YYYY-MM-DD.
 * Defaults to today if input is empty or "today".
 * Uses APP_TIMEZONE for the reference date.
 */
export function parseDateString(text: string): string | null {
  const tz = process.env.APP_TIMEZONE || "Asia/Jakarta";
  const now = new Date();
  
  // Normalize "today" or empty string
  const input = text.trim().toLowerCase();
  if (!input || input === "today") {
    return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(now);
  }

  // Parse relative to now in the specified timezone
  const parsedDate = chrono.parseDate(input, now, { forwardDate: false });
  
  if (!parsedDate) return null;

  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(parsedDate);
}
```

- [ ] **Step 2: Write unit tests**

```typescript
import { expect, test, describe } from "bun:test";
import { parseDateString } from "./date.js";

describe("parseDateString", () => {
  const tz = process.env.APP_TIMEZONE || "Asia/Jakarta";
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());

  test("defaults to today for empty input", () => {
    expect(parseDateString("")).toBe(today);
  });

  test("handles 'today'", () => {
    expect(parseDateString("today")).toBe(today);
  });

  test("handles 'yesterday'", () => {
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const expected = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(yesterdayDate);
    expect(parseDateString("yesterday")).toBe(expected);
  });

  test("handles ISO dates", () => {
    expect(parseDateString("2026-01-01")).toBe("2026-01-01");
  });

  test("handles natural language dates", () => {
    expect(parseDateString("1 January 2026")).toBe("2026-01-01");
  });

  test("returns null for invalid dates", () => {
    expect(parseDateString("not a date")).toBeNull();
  });
});
```

- [ ] **Step 3: Run tests**

Run: `bun test src/services/date.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/services/date.ts src/services/date.test.ts
git commit -m "feat: add date parsing service with tests"
```

---

### Task 3: Bot Command Integration

**Files:**
- Modify: `src/bot.ts`

- [ ] **Step 1: Replace command registration**

Modify `src/bot.ts` to replace `/today_expenses` with `/expenses`.

```typescript
// ... existing imports ...
import { parseDateString } from "./services/date.js";

// ... bot.start ...

bot.command("expenses", async (ctx) => {
  try {
    const arg = ctx.message.text.split(" ").slice(1).join(" ");
    const dateString = parseDateString(arg);

    if (!dateString) {
      return ctx.reply(
        "❌ I couldn't understand that date. Try 'yesterday', '30 April', or '2026-04-12'.",
      );
    }

    await ctx.reply(`⏳ Fetching expenses for ${dateString}...`);

    const { byCategory, grandTotals } = await getDailyExpenses(dateString);

    if (Object.keys(grandTotals).length === 0) {
      return ctx.reply(
        `📊 Expenses for ${dateString}:\n\nNo expenses recorded for this date.`,
      );
    }

    let message = `📊 Expenses for ${dateString}:\n\n`;

    for (const [category, totals] of Object.entries(byCategory)) {
      const categoryTotals = Object.entries(totals)
        .map(([currency, amount]) => `${amount.toLocaleString()} ${currency}`)
        .join(", ");
      message += `- ${category}: ${categoryTotals}\n`;
    }

    message += "\nTotal:\n";
    const totalsString = Object.entries(grandTotals)
      .map(([currency, amount]) => `${amount.toLocaleString()} ${currency}`)
      .join(", ");
    message += totalsString;

    await ctx.reply(message);
  } catch (err) {
    handleBotError(ctx, err);
  }
});

// ... rest of the bot.on handlers ...
```

- [ ] **Step 2: Verify project health**

Run: `bun test && bun x tsc --noEmit && bun x biome check --write .`
Expected: PASS and formatted.

- [ ] **Step 3: Commit**

```bash
git add src/bot.ts
git commit -m "feat: replace /today_expenses with flexible /expenses command"
```
