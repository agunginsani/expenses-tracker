# Today Expenses Command Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a new Telegram bot command `/today_expenses` that provides a category breakdown and grand total of expenses for the current day.

**Architecture:** Use in-memory filtering of Google Sheet rows to aggregate totals by category and currency.

**Tech Stack:** Telegraf, Google Spreadsheet API.

---

### Task 1: Sheets Service Retrieval Logic

**Files:**
- Modify: `src/services/sheets.ts`
- Modify: `src/services/sheets.test.ts`

- [ ] **Step 1: Add tests for `getDailyExpenses` in `src/services/sheets.test.ts`**

```typescript
describe("Sheets Service > getDailyExpenses", () => {
  it("should aggregate expenses for a specific date correctly", async () => {
    const { getDailyExpenses } = await import("./sheets.js");
    // Mock getRows to return sample data
    // Call getDailyExpenses("2026-04-25")
    // Assert summary structure matches expected breakdown
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test src/services/sheets.test.ts`
Expected: FAIL (getDailyExpenses is not a function)

- [ ] **Step 3: Implement `getDailyExpenses` in `src/services/sheets.ts`**

```typescript
export async function getDailyExpenses(date: string) {
  // 1. Auth and Load Sheet
  // 2. Fetch rows: const rows = await sheet.getRows();
  // 3. Aggregate data:
  const byCategory: Record<string, Record<string, number>> = {};
  const grandTotals: Record<string, number> = {};
  
  for (const row of rows) {
    if (row.get("Date") === date) {
      const category = row.get("Category");
      const currency = row.get("Currency");
      const amount = parseFloat(row.get("Amount"));
      
      // Update byCategory and grandTotals
    }
  }
  return { byCategory, grandTotals };
}
```

- [ ] **Step 4: Run tests to verify PASS**

Run: `npm test src/services/sheets.test.ts`

- [ ] **Step 5: Commit**

```bash
git add src/services/sheets.ts src/services/sheets.test.ts
git commit -m "feat: add getDailyExpenses to sheets service"
```

---

### Task 2: Bot Command Integration

**Files:**
- Modify: `src/bot.ts`

- [ ] **Step 1: Register `/today_expenses` command in `src/bot.ts`**

```typescript
import { getDailyExpenses } from "./services/sheets.js";

bot.command("today_expenses", async (ctx) => {
  try {
    const timezone = process.env.APP_TIMEZONE || "Asia/Jakarta";
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    const { byCategory, grandTotals } = await getDailyExpenses(today);
    
    // Formatting logic for breakdown and grand total
    // List each category with its currency totals
    // List grand totals at the end
    
    await ctx.reply(formattedMessage);
  } catch (err) {
    console.error(err);
    ctx.reply("❌ Failed to retrieve today's expenses.");
  }
});
```

- [ ] **Step 2: Add description to `.env.example` if not already there**

- [ ] **Step 3: Commit**

```bash
git add src/bot.ts
git commit -m "feat: add /today_expenses command to bot"
```

---

### Task 3: Final Verification

- [ ] **Step 1: Run full test suite**

Run: `npm test`

- [ ] **Step 2: Manual test**

Restart the bot and send `/today_expenses` to verify formatting.
