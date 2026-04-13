# Remove Raw Message Column Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the "Raw Message" column from Google Sheets service, tests, and documentation.

**Architecture:** Update the Sheets service to exclude the column from row data and header initialization, then align tests and specifications.

**Tech Stack:** Bun.js, TypeScript.

---

### Task 1: Update Sheets Service

**Files:**
- Modify: `src/services/sheets.ts`

- [ ] **Step 1: Remove Raw Message from row data**

Update `src/services/sheets.ts`:
```typescript
    const rowData = {
      Date: data.date,
      Description: data.description,
      Category: data.category,
      Amount: data.amount,
      Currency: data.currency,
    };
```

- [ ] **Step 2: Remove Raw Message from header initialization**

Update `src/services/sheets.ts`:
```typescript
        await sheet.setHeaderRow([
          "Date",
          "Description",
          "Category",
          "Amount",
          "Currency",
        ]);
```

- [ ] **Step 3: Commit**

Run: `git add src/services/sheets.ts && git commit -m "feat: remove Raw Message column from sheets service"`

---

### Task 2: Update Sheets Tests

**Files:**
- Modify: `src/services/sheets.test.ts`

- [ ] **Step 1: Update test expectation**

Update the `expect(mockAddRow).toHaveBeenCalledWith(...)` call in `src/services/sheets.test.ts`:
```typescript
    expect(mockAddRow).toHaveBeenCalledWith({
      Date: data.date,
      Description: data.description,
      Category: data.category,
      Amount: data.amount,
      Currency: data.currency,
    });
```

- [ ] **Step 2: Run tests to verify**

Run: `bun test src/services/sheets.test.ts`
Expected: PASS

- [ ] **Step 3: Commit**

Run: `git add src/services/sheets.test.ts && git commit -m "test: update sheets tests to exclude Raw Message column"`

---

### Task 3: Update Documentation and Specs

**Files:**
- Modify: `docs/superpowers/specs/2026-04-12-gemini-expense-bot-design.md`
- Create: `docs/superpowers/specs/2026-04-13-remove-raw-message-column-design.md`
- Create: `docs/superpowers/plans/2026-04-13-remove-raw-message-column.md`

- [ ] **Step 1: Update design document**

Remove the "Raw Message" description from `docs/superpowers/specs/2026-04-12-gemini-expense-bot-design.md`.

- [ ] **Step 2: Commit all documentation**

Run: `git add docs/superpowers/specs/2026-04-12-gemini-expense-bot-design.md docs/superpowers/specs/2026-04-13-remove-raw-message-column-design.md docs/superpowers/plans/2026-04-13-remove-raw-message-column.md && git commit -m "docs: remove Raw Message column from specs and add implementation plan"`
