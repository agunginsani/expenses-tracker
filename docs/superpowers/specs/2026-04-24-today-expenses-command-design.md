# Design Spec: `/today-expenses` Command

Implement a new Telegram bot command `/today-expenses` that provides a summary of all expenses recorded on the current date, broken down by category and currency.

## Goals
- Allow users to quickly see their spending for the day.
- Provide a clear breakdown by category.
- Handle multiple currencies gracefully by listing them separately.

## Architecture

### 1. Data Retrieval (`src/services/sheets.ts`)
Add a new function `getDailyExpenses(date: string)`:
- **Input**: A date string in `YYYY-MM-DD` format.
- **Logic**:
    1. Authenticate and load the Google Sheet.
    2. Fetch all rows from the primary sheet.
    3. Filter rows where the `Date` column matches the input date.
    4. Aggregate totals into a structure:
       ```typescript
       interface DailySummary {
         byCategory: Record<string, Record<string, number>>; // Category -> Currency -> Total
         grandTotals: Record<string, number>; // Currency -> Total
       }
       ```
- **Error Handling**: Return an empty summary if the sheet is empty or headers are missing.

### 2. Bot Integration (`src/bot.ts`)
Add a command handler for `/today-expenses`:
- **Logic**:
    1. Determine the current date in the user's timezone using the `APP_TIMEZONE` environment variable (defaulting to 'Asia/Jakarta' if not set).
    2. Format this date as `YYYY-MM-DD`.
    3. Call `getDailyExpenses(today)`.
    4. Format the result into a user-friendly message.
- **Timezone Implementation**:
  Use `Intl.DateTimeFormat` with the `timeZone` option to ensure the date is relative to the user's location, not the server's system time.

## Unified Timezone Handling
To ensure consistency across the application:
1. **Gemini Extraction**: The "Current date" context passed to Gemini in `src/services/gemini.ts` will use `APP_TIMEZONE`. This ensures Gemini identifies the "correct" today relative to the user.
2. **Reporting**: The `/today-expenses` command will use the same `APP_TIMEZONE` to calculate which rows to fetch.

## Configuration
- `APP_TIMEZONE`: The IANA timezone string (e.g., `Asia/Jakarta`) used to calculate "Today". Defaults to `Asia/Jakarta` if not provided.
    ```text
    📊 Expenses for Today (2026-04-25):

    - Food: 46,000 IDR
    - Shopping: 120,000 IDR, 10 USD

    Total: 166,000 IDR, 10 USD
    ```

## Testing Plan
- **Unit Tests**:
    - `sheets.test.ts`: Mock `google-spreadsheet` to verify that `getDailyExpenses` correctly filters and aggregates data.
    - `bot.ts`: Verify the command triggers the service and formats the message correctly.
- **Manual Verification**:
    - Record a few expenses with different categories and currencies.
    - Run `/today-expenses` and verify the output matches.

## Constraints
- **Performance**: Row filtering is done in-memory. This is efficient for thousands of rows but may need optimization (via Google Sheets API filtering or a Summary tab) if the sheet grows extremely large.
- **Timezone**: Uses the server's current date.
