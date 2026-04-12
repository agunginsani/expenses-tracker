# Gemini Expense Bot Design Document

A Telegram bot that uses Gemini AI to parse text and images, saving expenses directly to Google Sheets.

## Overview
The Gemini Expense Bot allows users to track expenses by simply texting or sending receipt photos via Telegram. It leverages Gemini 1.5 Flash for natural language understanding and image OCR, then records the structured data into a Google Sheets spreadsheet.

## Architecture

### Components
1.  **Telegram Bot (Telegraf):** The interface for user interaction. Receives messages and media.
2.  **AI Engine (Gemini 1.5 Flash):**
    *   **Text Mode:** Parses natural language like "25 for lunch with team".
    *   **Image Mode:** Extracts merchant, date, total, and items from receipt photos.
3.  **Database (Google Sheets):** Acts as the primary storage and UI for reviewing expenses.
4.  **Backend (Node.js + TypeScript):** Orchestrates data flow between Telegram, Gemini, and Google Sheets.

### Data Flow
1.  User sends message/image to Telegram Bot.
2.  Bot forwards content to Gemini with a structured prompt.
3.  Gemini returns JSON containing `amount`, `category`, `description`, and `date`.
4.  Bot appends the data as a new row in Google Sheets.
5.  Bot confirms success to the user.

## Technical Stack
- **Runtime:** Node.js (v18+)
- **Language:** TypeScript
- **Bot Framework:** [Telegraf](https://telegraf.js.org/)
- **AI SDK:** [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai)
- **Sheets API:** [google-spreadsheet](https://www.npmjs.com/package/google-spreadsheet)
- **Environment:** dotenv (for secrets)

## Spreadsheet Schema
The Google Sheet will contain the following columns:
- **Date:** Auto-parsed or today's date.
- **Merchant/Description:** Name of the store or description of the item.
- **Category:** AI-categorized (e.g., Food, Transport, Shopping).
- **Amount:** The numeric value.
- **Currency:** Extracted from the input.
- **Raw Message:** For audit purposes.

## Security & Privacy
- **Telegram Bot Token:** Kept secret in `.env`.
- **Google Service Account:** Used for secure, server-to-server access to the spreadsheet.
- **Gemini API Key:** Kept secret in `.env`.

## Implementation Phases
1.  **Phase 1:** Basic Telegram bot setup with "Echo" functionality.
2.  **Phase 2:** Gemini integration for natural language text parsing.
3.  **Phase 3:** Gemini integration for receipt image OCR.
4.  **Phase 4:** Google Sheets integration to record expenses.
5.  **Phase 5 (Optional):** Deployment to a cloud provider (e.g., Render/Railway).
