# Design Spec: Flexible Date Expenses Command

Replace the static `/today_expenses` command with a versatile `/expenses` command that supports natural language date parsing.

## 1. Requirements

- **Command Name:** `/expenses`
- **Arguments:** Optional natural language date string (e.g., "yesterday", "last Monday", "15 April").
- **Default Behavior:** If no argument is provided, default to the current date.
- **Parsing:** Support flexible formats including relative dates and specific dates.
- **Output:** Categorized breakdown and grand total for the selected date, matching the existing `/today_expenses` format.
- **Deprecation:** Remove the `/today_expenses` command to avoid redundancy.

## 2. Technical Design

### Dependencies
- **chrono-node**: A natural language date parser for JS/TS.

### Logic Flow
1. **Command Registration:** Replace `bot.command("today_expenses", ...)` with `bot.command("expenses", ...)`.
2. **Date Extraction:** 
   - Extract argument string from `ctx.message.text`.
   - Default to "today" if empty.
3. **Date Parsing:**
   - Use `chrono.parseDate` with a reference date set to the current time in `APP_TIMEZONE` (defaulting to `Asia/Jakarta`).
   - Format the resulting `Date` object into `YYYY-MM-DD` using `Intl.DateTimeFormat("en-CA")` to maintain compatibility with `getDailyExpenses`.
4. **Data Fetching:** Reuse `getDailyExpenses(dateString)` from `src/services/sheets.ts`.
5. **Response:** 
   - Reuse the category breakdown and grand total formatting logic.
   - Update header to reflect the selected date: `📊 Expenses for [Date]:`.
6. **Error Handling:**
   - If parsing fails, return a clear error message with examples of supported formats.

## 3. Implementation Plan Summary

- Install `chrono-node`.
- Implement `parseDate` utility or inline logic in `src/bot.ts`.
- Update `src/bot.ts` to register `/expenses` and remove `/today_expenses`.
- Test with various inputs: `today`, `yesterday`, `10 May`, `2026-05-10`, and invalid strings.

## 4. Verification

- Run `bun test` to ensure no regressions.
- Verify `bun x tsc --noEmit` and `bun x biome check .`.
- Manual verification via Telegram bot.
