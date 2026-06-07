# Design Spec: Add CreatedAt Column to Google Sheets

Add a `CreatedAt` column to the Google Sheet to record the exact time each expense was logged by the bot.

## 1. Requirements

- **Column Name:** `CreatedAt`
- **Format:** Full ISO 8601 string (e.g., `2026-06-07T14:30:05.123Z`).
- **Position:** The last column in the spreadsheet.
- **Trigger:** Every time a new expense is successfully saved via `saveToSheet`.
- **Initialization:** Automatically add the header if the sheet is empty.

## 2. Technical Design

### Data Structure Update
Modify the `rowData` object in `src/services/sheets.ts`:
```typescript
const rowData = {
  Date: data.date,
  Description: data.description,
  Category: data.category,
  Amount: data.amount,
  Currency: data.currency,
  CreatedAt: new Date().toISOString(), // New field
};
```

### Sheet Initialization
Update the `setHeaderRow` call to include the new column:
```typescript
await sheet.setHeaderRow([
  "Date",
  "Description",
  "Category",
  "Amount",
  "Currency",
  "Created at",
]);
```

### Testing Strategy
- Update `src/services/sheets.test.ts` to expect the `CreatedAt` field in calls to `sheet.addRow`.
- Mock `Date.prototype.toISOString` to ensure deterministic test results.

## 3. Implementation Plan Summary

- Modify `src/services/sheets.ts` to include `CreatedAt` in row data and headers.
- Update `src/services/sheets.test.ts` to verify the new column.
- Verify with `bun test`.

## 4. Verification

- `bun test` ensures the Sheets service correctly passes the timestamp.
- Manual verification: Send an expense and check the Google Sheet for the new column.
.
