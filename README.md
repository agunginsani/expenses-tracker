# expenses-tracker

## Tech Stack
- **Runtime:** [Bun](https://bun.sh/)
- **Language:** TypeScript
- **Framework:** [Telegraf](https://telegraf.js.org/) (Telegram Bot API)
- **Database:** Google Sheets
- **AI:** [Google Gemini](https://ai.google.dev/)
- **Linting/Formatting:** [Biome](https://biomejs.dev/)

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

## Deployment (Vercel)

1. Connect your GitHub repository to Vercel.
2. Configure environment variables in the Vercel Dashboard:
   - `TELEGRAM_BOT_TOKEN`
   - `GEMINI_API_KEY`
   - `GOOGLE_SHEET_ID`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY` (Replace `\n` with literal newlines if necessary)
3. Once deployed, run the following command locally to register the webhook:
   ```bash
   TELEGRAM_BOT_TOKEN=your_token bun scripts/set-webhook.ts https://your-project.vercel.app
   ```

This project was created using `bun init` in bun v1.1.20. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
