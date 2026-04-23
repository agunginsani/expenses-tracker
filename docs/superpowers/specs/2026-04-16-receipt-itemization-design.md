# Design: Receipt Itemization Support

Adding the ability to extract and store individual line items from receipts into a single Google Spreadsheet cell.

## 1. Goal
Provide users with detailed context of their expenses by extracting item names, quantities, and prices from receipts and storing them as a formatted list in the "Description" column of their Google Spreadsheet.

## 2. Architecture
The system will extend the existing multi-modal Gemini parsing logic to include structured item extraction.

### Data Flow
1.  **Telegram:** User sends a photo or PDF of a receipt.
2.  **Gemini Service (`gemini.ts`):**
    -   Requests structured JSON with an additional `items` array.
    -   Validates the AI's response against the updated `ExpenseSchema`.
    -   Formats the `items` array into a human-readable bulleted list.
    -   Appends this list to the main expense description.
3.  **Sheets Service (`sheets.ts`):** Saves the enriched `description` to Google Sheets as usual.

## 3. Implementation Details

### Schema Update (`src/schemas/expense.ts`)
Add an internal `ItemSchema` and update `ExpenseSchema`:
```typescript
const ItemSchema = z.object({
  name: z.string(),
  quantity: z.number().optional(),
  price: z.number().optional(),
});

export const ExpenseSchema = z.object({
  // ... existing fields
  items: z.array(ItemSchema).optional(),
});
```

### Gemini Service Refactor (`src/services/gemini.ts`)
- **Prompt Update:** "Extract individual items into an 'items' array. Each item should have: name (string), quantity (number), and price (number). If quantity or price is not clear, omit them."
- **Formatting Logic:** Implement a helper to convert `items` to a string:
  ```typescript
  if (rawData.items && rawData.items.length > 0) {
    const itemsList = rawData.items
      .map(item => `- ${item.quantity ? `${item.quantity}x ` : ""}${item.name}${item.price ? `: ${item.price}` : ""}`)
      .join("\n");
    rawData.description = `${rawData.description}\n\nItems:\n${itemsList}`;
  }
  ```

## 4. Testing Strategy
- **Manual Test:** Send a grocery receipt photo. Verify the "Description" column in Google Sheets contains both the summary and the itemized list.
- **Validation:** Ensure the bot handles receipts with no clear items gracefully (e.g., just uses the summary description).
- **Edge Case:** Verify that extremely long item lists don't exceed Google Sheet cell limits (though this is unlikely for standard receipts).

## 5. Success Criteria
- Receipt items are successfully extracted by Gemini.
- Items are formatted correctly as a bulleted list in the spreadsheet.
- Total amount and other metadata remain accurate.
