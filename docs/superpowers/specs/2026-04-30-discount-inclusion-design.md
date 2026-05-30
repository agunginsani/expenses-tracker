# Design Spec: Discount Inclusion in Itemized Expenses

Ensure that discounts, vouchers, and promos are included in the itemized list with negative prices to maintain mathematical consistency between items and the grand total.

## 1. Requirements

- **Discount Detection:** The AI must identify discounts, promos, or vouchers in receipts or text.
- **Negative Pricing:** Discounts must be added as items with a negative `price`.
- **Naming:** The AI should use the specific name found in the content (e.g., "Promo", "Voucher 10k").
- **Display:** Negative prices should be clearly displayed in the itemized list within the expense description.
- **Validation:** The schema must support negative prices for items.

## 2. Technical Design

### AI Prompt Update
Modify the prompt in `src/services/gemini.ts` to include a explicit instruction for discounts:
> **DISCOUNT RULE:** If the transaction includes any discounts, vouchers, or promos, include them as items in the `items` array. Use the name found in the content (e.g., "Voucher", "Promo", "Disc") and set the `price` as a negative number.

### Formatting Logic
The current formatting logic in `src/services/gemini.ts` already handles price display:
```typescript
`- ${item.quantity ? `${item.quantity}x ` : ""}${item.name}${item.price ? `: ${item.price}` : ""}`
```
This will naturally display `: -20000` for a discount, which is acceptable.

### Logic Flow
1. User sends a receipt with a discount.
2. Gemini identifies the discount based on the new rule.
3. Gemini returns a negative price for that specific item.
4. The system logs the item to the description and the total to the sheet.

## 3. Implementation Plan Summary

- Create the `discount-inclusion` branch.
- Update the prompt in `src/services/gemini.ts`.
- Add a comprehensive unit test in `src/services/gemini.test.ts` representing a discounted receipt.
- Verify all tests pass.

## 4. Verification

- `bun test` ensures the new parsing logic works as expected.
- Specifically verify that a mock response with a negative price item is correctly processed into the description.
