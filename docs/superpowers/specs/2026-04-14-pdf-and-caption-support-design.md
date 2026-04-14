# Design: PDF, Caption Support, and Strict Date Validation for Expense Bot

Adding native PDF processing, multi-modal caption support, and strict transaction date validation to the Telegram bot using Gemini 1.5 Flash.

## 1. Goals
- **PDF Support:** Allow users to send PDF invoices and digital receipts directly to the bot.
- **Caption Support:** Enable the bot to read and process text captions sent along with images or PDFs for better context (e.g., "Lunch with client").
- **Strict Date Validation:** Ensure every expense has a valid transaction date extracted from the source content. If the date is missing, the bot should return a clear error message instead of guessing or defaulting to today.

## 2. Architecture
The system will leverage Gemini's multi-modal capabilities to process a combination of media (image/PDF) and text (caption) in a single request.

### Data Flow
1. **Telegram:**
    - User sends a `.pdf` document with an optional caption.
    - User sends a photo with an optional caption.
2. **Bot (`src/bot.ts`):**
    - Listens for `document` (filtered for `application/pdf`) and `photo` messages.
    - Extracts the file (buffer) and the caption text (`ctx.message.caption`).
    - Calls `parseExpense` with both media and caption.
3. **Gemini Service (`src/services/gemini.ts`):**
    - `parseExpense` function updated to handle an optional caption alongside the media buffer.
    - Constructs a multi-modal request to Gemini: `[prompt, mediaData, caption]`.
    - **Prompt Update:** "If the transaction date is not found in the provided content, do NOT guess. Set `date` to `null`."
4. **Validation Logic:**
    - `ExpenseSchema` will fail if `date` is missing or `null`.
    - Bot catches the error and provides a helpful message: "❌ Transaction date not found. Please provide it in the caption (e.g., 'Lunch on 2026-04-14') or send a clearer photo."
5. **Sheets Service (`src/services/sheets.ts`):** Saves the parsed data as usual.

## 3. Implementation Details

### Updated Gemini Service (`src/services/gemini.ts`)
- **New Signature:** `parseExpense(input: string | Buffer, options?: { mimeType?: string, caption?: string })`
- **Logic:**
    - If `input` is a `Buffer`, it uses `options.mimeType` (defaulting to `image/jpeg`).
    - If `options.caption` is provided, it's included in the `generateContent` array.
- **Prompt:** Updated to explicitly mention "Extract expense details from the following media (image/PDF) and optional user notes. Return `null` for the `date` field if it's not found in the source content."

### Updated Bot Handler (`src/bot.ts`)
- **Document Handler:**
    - `bot.on(message("document"), ...)`
    - Check `ctx.message.document.mime_type === "application/pdf"`.
    - Pass `ctx.message.caption` to `parseExpense`.
- **Photo Handler:**
    - Pass `ctx.message.caption` to `parseExpense`.
- **Error Handling:**
    - Specific handling for missing `date` in Zod validation errors to provide the specific "Transaction date not found" message.

## 4. Testing Strategy
- **PDF Test:** Send a digital PDF receipt with a caption "Weekly internet bill".
- **Photo Test:** Send a photo of a restaurant receipt with a caption "Dinner with team".
- **Strict Date Test:** Send a blurry photo where the date is illegible. Ensure the bot returns the correct error message.
- **Validation:** 
    - Verify `amount`, `currency`, and `date` are extracted from the media.
    - Verify `description` and `category` are influenced by the user's caption.
- **Edge Case:** Send a PDF without a caption; send a photo with a caption.

## 5. Success Criteria
- PDF files are successfully processed.
- Captions are used by the AI to provide more accurate descriptions and categories.
- Every saved expense has a valid transaction date confirmed from the source.
- Data is correctly saved to Google Sheets.
