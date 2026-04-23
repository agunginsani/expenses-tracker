# Design: Default Currency to IDR

Setting `IDR` as the default fallback currency for extracted expenses to prevent data validation errors when a currency is not explicitly mentioned in a message or receipt.

## 1. Goals
- Default the `currency` field to `IDR` if no currency is extracted by the AI.
- Ensure the AI still extracts other currencies (like `$`, `USD`, `SGD`) if they are present in the source content.
- Prevent Zod validation errors caused by a `null` or empty `currency` field.

## 2. Approach
We will use a **Schema-level Default** in combination with an updated prompt.

### Rationale
- **Robustness:** Using `z.string().default("IDR")` or a pre-parsing transformation in Zod ensures that a missing or `null` value is always handled before reaching the bot handler.
- **AI Guidance:** Updating the prompt provides the AI with a clear instruction to favor `IDR` as the default, reducing the frequency of missing values.

## 3. Implementation Details

### Updated Expense Schema (`src/schemas/expense.ts`)
- Update the `ExpenseSchema` to handle `null` or missing `currency` by defaulting to `IDR`.
- Use `.default("IDR")` or `.catch("IDR")` to ensure a value is always present.

### Updated Gemini Service (`src/services/gemini.ts`)
- **Prompt Update:** Update the `prompt` to specify: *"If the currency is not found in the content, use 'IDR' as the default."*
- This aligns the AI's behavior with the schema's requirements.

## 4. Testing Strategy
- **Default Test:** Send "150k for lunch". Expect `amount: 150000`, `currency: "IDR"`.
- **Explicit Test:** Send "$10 for coffee". Expect `amount: 10`, `currency: "$"`.
- **Missing Currency Test:** Send a photo of a receipt that only has numbers. Expect the system to default to `IDR`.

## 5. Success Criteria
- Expenses without an explicit currency are saved with `IDR`.
- Expenses with explicit currencies (like `$`, `SGD`, etc.) are saved with those currencies.
- No more Zod validation errors for `currency`.
