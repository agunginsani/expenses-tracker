---
name: type-safe-spreadsheet-database
description: Use when reading from, writing to, or modifying the schema of Google Sheets to ensure type safety and handle empty initial states
---

# Type-Safe Spreadsheet Database

## Overview
Google Sheets is used as a stateless database. We enforce type safety strictly at the application boundary using Zod schemas and explicit data mapping.

## Core Invariants
1. **String Coercion**: Sheets returns strings. You MUST cast numeric columns using `Number()` before Zod parsing.
2. **Header Mapping**: Explicitly map PascalCase headers (e.g., `Payment Method`) to camelCase Zod fields.
3. **The Empty Sheet Trap**: If `sheet.addRow()` fails with "No values in the header row", catch it, initialize headers via `sheet.setHeaderRow()`, and retry.
4. **Read Validation**: Always use `ExpenseSchema.parse()` inside a try/catch block when reading from `row.toObject()`.
