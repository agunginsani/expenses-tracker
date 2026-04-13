# Design Doc: Remove Raw Message Column

Remove the "Raw Message" column from the Google Sheets integration as it is no longer required for auditing or debugging.

## Problem
The "Raw Message" column in Google Sheets stores the full JSON representation of each expense. The user has determined this data is unnecessary and wants to simplify the spreadsheet.

## Goals
- Stop recording the "Raw Message" JSON data in new rows.
- Exclude "Raw Message" from the automatic header initialization logic.
- Ensure all tests and documentation reflect this change.

## Architecture

### 1. Sheets Service (`src/services/sheets.ts`)
- **Row Data:** Remove the `'Raw Message'` field from the `rowData` object in `saveToSheet`.
- **Headers:** Remove `'Raw Message'` from the array passed to `sheet.setHeaderRow` in the empty sheet recovery logic.

### 2. Testing (`src/services/sheets.test.ts`)
- Update the `expect(mockAddRow).toHaveBeenCalledWith(...)` assertion to exclude the `'Raw Message'` field.

### 3. Documentation
- Update `docs/superpowers/specs/2026-04-12-gemini-expense-bot-design.md` to remove the column description.
- (Optional) Clean up historical plan files if they contain large code blocks with the old column.

## Implementation Plan

1.  **Modify Sheets Service:** Remove the column from `src/services/sheets.ts`.
2.  **Update Tests:** Align the test expectations in `src/services/sheets.test.ts`.
3.  **Update Specs:** Remove the column from the design document.
4.  **Verification:** Run tests to ensure the bot correctly saves rows without the extra column.

## User Actions Required
- The user may manually delete the existing "Raw Message" column from their current Google Sheet to clean up the UI. The bot will ignore the column if it exists but will not create it if it's missing.
