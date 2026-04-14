# Design: PDF Support for Expense Bot

Adding native PDF processing to the Telegram bot using Gemini 1.5 Flash's document analysis capabilities.

## 1. Goal
Allow users to send PDF invoices and digital receipts directly to the Telegram bot to have their expenses automatically parsed and saved to Google Sheets.

## 2. Architecture
The system will use the same core logic as image processing but extended to support PDF buffers.

### Data Flow
1. **Telegram:** User sends a `.pdf` document.
2. **Bot (`bot.ts`):** 
    - Listens for `document` messages.
    - Filters for `application/pdf` MIME type.
    - Downloads the file and converts it to a buffer.
3. **Gemini Service (`gemini.ts`):**
    - Receives the PDF buffer.
    - Sends the buffer to Gemini 1.5 Flash with the `application/pdf` MIME type.
    - Uses the existing prompt (updated to mention PDF).
4. **Sheets Service (`sheets.ts`):** Saves the parsed data as usual.

## 3. Implementation Details

### Bot Handler (`src/bot.ts`)
- Add `bot.on(message("document"), ...)`
- Validate `ctx.message.document.mime_type === "application/pdf"`
- Inform the user: "⏳ Processing your PDF invoice..."

### Gemini Service (`src/services/gemini.ts`)
- Update `parseExpense(input: string | Buffer, type: 'text' | 'image' | 'pdf')`
- Set `mimeType: "application/pdf"` for PDF inputs.
- Update the prompt to say "Extract expense details from the following document (text, image, or PDF)."

## 4. Testing Strategy
- **Manual Test:** Send a digital PDF receipt (e.g., Grab, Gojek, or Apple Invoice) to the bot.
- **Validation:** Ensure the data is correctly extracted (amount, date, description) and saved to the sheet.
- **Edge Case:** Send a non-PDF document to ensure the bot handles it gracefully (e.g., error message or ignore).

## 5. Success Criteria
- Bot successfully parses a single-expense PDF invoice.
- Extracted data matches the invoice content accurately.
- Data is saved to Google Sheets without duplication or formatting issues.
