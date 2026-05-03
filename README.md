# 📊 Expenses Tracker

Effortless expense tracking powered by **Google Gemini** and **Google Sheets**.

Transform your messy Telegram messages, receipt photos, and PDF invoices into organized spreadsheet entries instantly. No more manual entry—just send a message and let the AI handle the rest.

## ✨ Key Features

- 🤖 **AI-Powered Parsing**: Uses Google Gemini to intelligently extract amounts, currencies, categories, and descriptions from natural language.
- 📸 **Receipt OCR**: Snap a photo of a physical receipt; the bot itemizes the contents and logs the total.
- 📄 **PDF Invoice Support**: Forward digital PDF invoices directly to the bot for automatic processing.
- 📊 **Google Sheets Integration**: Your data is yours. Every expense is appended as a new row in your personal Google Sheet in real-time.
- 🗓️ **Natural Language Queries**: Ask for insights using flexible commands like `/expenses yesterday` or `/expenses last Monday`.
- ⚡ **High Performance**: Built with [Bun](https://bun.sh/) and TypeScript for a lightweight and snappy experience.
- 🌍 **Timezone Aware**: Configurable timezone support (defaults to `Asia/Jakarta`).

## 🚀 How It Works

### 1. Simple Text
> "Lunch with the team 150k"
>
> ✅ **Saved**: 150,000 IDR for Lunch with the team (Food & Beverage)

### 2. Images & PDFs
Send a photo of a grocery receipt or a PDF of an electricity bill. The bot will analyze the document, extract the total, and log it to your sheet.

### 3. Insights
> `/expenses yesterday`
>
> 📊 **Expenses for 2026-04-29**:
> - Food & Beverage: 150,000 IDR
> - Transport: 50,000 IDR
> 
> **Total**: 200,000 IDR

---

## 🛠️ Getting Started

### Prerequisites
- [Bun](https://bun.sh/) runtime installed.
- A Telegram Bot token (from [@BotFather](https://t.me/botfather)).
- A Google Cloud Service Account with Google Sheets API enabled.
- A Google Gemini API Key.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/agunginsani/expenses-tracker.git
   cd expenses-tracker
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   TELEGRAM_BOT_TOKEN=your_token
   GEMINI_API_KEY=your_key
   GOOGLE_SHEET_ID=your_sheet_id
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
   APP_TIMEZONE=Asia/Jakarta
   ```

4. **Run the bot**:
   ```bash
   bun start
   ```

## ☁️ Deployment (Vercel)

This project is optimized for deployment as a Vercel Serverless Function.

1. Connect your repository to Vercel.
2. Add the environment variables listed above in the Vercel Dashboard.
3. Deploy the project.
4. **Register the Webhook**:
   Run the following command locally to point Telegram to your Vercel deployment:
   ```bash
   TELEGRAM_BOT_TOKEN=your_token bun scripts/set-webhook.ts https://your-project.vercel.app
   ```

## 🛠️ Development

- **Linting & Formatting**: Powered by [Biome](https://biomejs.dev/).
  ```bash
  bun run check
  ```
- **Testing**:
  ```bash
  bun test
  ```

## 📝 License

MIT
