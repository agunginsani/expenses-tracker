# Design Spec: Enhanced Expense Categories

Adding "Social" category and sub-categories for "Shopping", "Bills", and "Transport" using a hierarchical format in the existing "Category" column.

## Context
The current system uses a flat enum for categories: `Food`, `Transport`, `Shopping`, `Bills`, `Others`. 
These are stored in a single "Category" column in Google Sheets and parsed from user input via Gemini.

## Requirements
1. Add a new primary category: `Social`.
2. Add sub-categories for `Shopping`: `Groceries`, `Fashion`, `Gadgets`.
3. Add sub-categories for `Bills`: `Electricity`, `Water`, `Internet`, `Mobile Data`, `Rent`, `Subscription`.
4. Add sub-categories for `Transport`: `Gasoline`, `Parking fee`, `Public transport`, `Taxi/Ojol`, `Vehicle maintenance`.
5. Use the format `Parent: Child` for sub-categories (e.g., `Shopping: Groceries`).
6. Update Gemini prompt to accurately categorize based on these new options.
7. Ensure existing data and future data without sub-categories still work.

## Architecture & Data Flow

### 1. Schema Updates (`src/schemas/expense.ts`)
Update `ExpenseCategorySchema` to include the new values:
- `Food`
- `Transport`
- `Transport: Gasoline`
- `Transport: Parking fee`
- `Transport: Public transport`
- `Transport: Taxi/Ojol`
- `Transport: Vehicle maintenance`
- `Shopping`
- `Shopping: Groceries`
- `Shopping: Fashion`
- `Shopping: Gadgets`
- `Bills`
- `Bills: Electricity`
- `Bills: Water`
- `Bills: Internet`
- `Bills: Mobile Data`
- `Bills: Rent`
- `Bills: Subscription`
- `Social`
- `Others`

### 2. AI Parsing Update (`src/services/gemini.ts`)
Update the `parseExpense` prompt to explicitly list the new available categories and instruct the model on when to use sub-categories.

Example instructions for Gemini:
> Categories should be one of: 
> - Food
> - Transport (or specific: Transport: Gasoline, Transport: Parking fee, Transport: Public transport, Transport: Taxi/Ojol, Transport: Vehicle maintenance)
> - Shopping (or specific: Shopping: Groceries, Shopping: Fashion, Shopping: Gadgets)
> - Bills (or specific: Bills: Electricity, Bills: Water, Bills: Internet, Bills: Mobile Data, Bills: Rent, Bills: Subscription)
> - Social
> - Others

### 3. Data Storage (`src/services/sheets.ts`)
No structural changes needed to Google Sheets as we are keeping the hierarchical categories in the existing "Category" column.

## Error Handling
- If Gemini returns a string that doesn't match the new Zod enum, the `ExpenseSchema.parse()` call will throw a `ZodError`.
- The current retry logic in `parseExpense` will handle transient API issues, but `ZodError` will correctly propagate as it indicates a content mismatch that needs to be addressed via prompt tuning or user correction.

## Testing Strategy
- **Unit Test:** Update or add tests for `parseExpense` with various descriptions (e.g., "electricity bill", "parking fee", "zakat mal") to verify they map to the correct hierarchical categories.
- **Integration Test:** Verify that the `saveToSheet` function correctly pushes these strings to the Google Sheet.

## Alternatives Considered
- **Separate Sub-category Column:** Rejected by user preference to keep a single column for categories.
- **Different Separators:** "Explicit Hierarchy (Colon)" was selected by the user over dashes or parentheses.
