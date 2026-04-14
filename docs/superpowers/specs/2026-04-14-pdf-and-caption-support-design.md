# Design: PDF and Caption Support for Expense Bot

Adding native PDF processing and multi-modal caption support to the Telegram bot using Gemini 1.5 Flash.

## 1. Goals
- **PDF Support:** Allow users to send PDF invoices and digital receipts directly to the bot.
- **Caption Support:** Enable the bot to read and process text captions sent along with images or PDFs for better context (e.g., "Lunch with client").

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
4. **Sheets Service (`src/services/sheets.ts`):** Saves the parsed data as usual.

## 3. Implementation Details

### Updated Gemini Service (`src/services/gemini.ts`)
- **New Signature:** `parseExpense(input: string | Buffer, options?: { mimeType?: string, caption?: string })`
- **Logic:**
    - If `input` is a `Buffer`, it uses `options.mimeType` (defaulting to `image/jpeg`).
    - If `options.caption` is provided, it's included in the `generateContent` array.
- **Prompt:** Updated to explicitly mention "Extract expense details from the following media (image/PDF) and optional user notes."

### Updated Bot Handler (`src/bot.ts`)
- **Document Handler:**
    - `bot.on(message("document"), ...)`
    - Check `ctx.message.document.mime_type === "application/pdf"`.
    - Pass `ctx.message.caption` to `parseExpense`.
- **Photo Handler:**
    - Pass `ctx.message.caption` to `parseExpense`.

## 4. Testing Strategy
- **PDF Test:** Send a digital PDF receipt with a caption "Weekly internet bill".
- **Photo Test:** Send a photo of a restaurant receipt with a caption "Dinner with team".
- **Validation:** 
    - Verify `amount`, `currency`, and `date` are extracted from the media.
    - Verify `description` and `category` are influenced by the user's caption.
- **Edge Case:** Send a PDF without a caption; send a photo with a caption.

## 5. Success Criteria
- PDF files are successfully processed.
- Captions are used by the AI to provide more accurate descriptions and categories.
- Data is correctly saved to Google Sheets.
