# Add CreatedAt Column Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `CreatedAt` column (ISO string) to the end of the Google Sheet for each recorded expense.

**Architecture:** Update the Sheets service to include a timestamp in the row data and header initialization. Update unit tests to verify the inclusion of the new field.

**Tech Stack:** TypeScript, Google Spreadsheet SDK.

---

### Task 1: Update Sheets Service

**Files:**
- Modify: `src/services/sheets.ts`

- [ ] **Step 1: Include `CreatedAt` in row data**

Update `saveToSheet` in `src/services/sheets.ts`:
```typescript
    const rowData = {
      Date: data.date,
      Description: data.description,
      Category: data.category,
      Amount: data.amount,
      Currency: data.currency,
      CreatedAt: new Date().toISOString(),
    };
```

- [ ] **Step 2: Update header initialization**

Update the `setHeaderRow` call in `src/services/sheets.ts`:
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

- [ ] **Step 3: Verify types**

Run: `bun x tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/services/sheets.ts
git commit -m "feat: add CreatedAt column to Sheets service"
```

---

### Task 2: Update Unit Tests

**Files:**
- Modify: `src/services/sheets.test.ts`

- [ ] **Step 1: Mock `Date.toISOString` in tests**

Update the `beforeEach` block in `src/services/sheets.test.ts` to mock the date for consistency:
```typescript
  beforeEach(() => {
    mockSheet = {
      addRow: mockAddRow,
      getRows: mockGetRows,
      setHeaderRow: mockSetHeaderRow,
    };
    mockAddRow.mockReset();
    mockGetRows.mockReset();
    mockSetHeaderRow.mockReset();
    
    // Mock Date.toISOString
    const mockDate = new Date("2026-06-07T14:30:05.123Z");
    spyOn(global, "Date").mockImplementation(() => mockDate as any);
    (Date as any).prototype.toISOString = () => "2026-06-07T14:30:05.123Z";
  });
```

- [ ] **Step 2: Update test expectations**

Update the test case "should call saveToSheet with correct data" to expect the `CreatedAt` field:
```typescript
    expect(mockAddRow).toHaveBeenCalledWith({
      Date: "2026-04-12",
      Description: "coffee",
      Category: "Food",
      Amount: 10,
      Currency: "$",
      CreatedAt: "2026-06-07T14:30:05.123Z",
    });
```

- [ ] **Step 3: Run tests**

Run: `bun test src/services/sheets.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/services/sheets.test.ts
git commit -m "test: update Sheets service tests for CreatedAt column"
```

---

### Task 3: Final Verification

- [ ] **Step 1: Run all checks**

Run: `bun test && bun x tsc --noEmit && bun x biome check .`
Expected: PASS and clean.
.
