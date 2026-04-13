# Design Spec: Vercel Deployment with Webhooks

Deploy the Expenses Tracker bot to Vercel as a Serverless Function to achieve $0/month cost for a 2-user scale.

## 1. Overview
The current bot uses long-polling, which requires a 24/7 running process. This is inefficient and costly for low-volume usage. This design transitions the bot to use **Telegram Webhooks** hosted on **Vercel Serverless Functions**.

## 2. Architecture
The system will shift from an active polling model to a passive webhook model.

- **Platform**: Vercel (Hobby Tier: $0/mo).
- **Runtime**: Node.js (via Bun/TypeScript).
- **Communication**: Telegram Webhooks (HTTPS POST).
- **Entry Point**: `api/webhook.ts` (Vercel Serverless Function).

### 2.1 Webhook Flow
1. User sends message/photo to Telegram Bot.
2. Telegram POSTs a JSON update to `https://<your-vercel-domain>/api/webhook?token=<bot_token>`.
3. Vercel wakes up the function.
4. Function processes the update using existing `Telegraf` handlers (Gemini AI -> Google Sheets).
5. Function responds to the HTTP request, which Telegram delivers as the bot's reply.

## 3. Implementation Details

### 3.1 Vercel Configuration (`vercel.json`)
Configures the routing and environment for the serverless function.
```json
{
  "version": 2,
  "rewrites": [
    { "source": "/api/webhook", "destination": "/api/index.ts" }
  ]
}
```

### 3.2 Serverless Entry Point (`api/index.ts`)
A dedicated entry point for Vercel that bridges the HTTP request to the Telegraf bot instance.
- Exports a standard Vercel Function handler: `(req, res) => { ... }`.
- Uses `bot.handleUpdate(req.body, res)` to process the Telegram update.

### 3.3 Security
- **Secret Path**: The webhook URL will include the `TELEGRAM_BOT_TOKEN` as a query parameter or part of the path to ensure only Telegram can trigger the function.
- **Environment Variables**: All API keys and secrets will be configured in the Vercel Dashboard.

## 4. Components to Create/Modify
- **`api/index.ts`**: New serverless function entry point.
- **`vercel.json`**: New Vercel configuration file.
- **`src/bot.ts`**: Refactor `src/index.ts` to export a `bot` instance without calling `bot.launch()`.
- **`scripts/set-webhook.ts`**: A small utility script to register the Vercel URL with Telegram.

## 5. Testing & Validation
- **Local Development**: Use `vercel dev` to simulate the serverless environment locally.
- **Webhook Mocking**: Use tools like `ngrok` or `localtunnel` to expose the local server for testing with real Telegram updates.
- **Logs**: Monitor execution and errors via Vercel's real-time log dashboard.

## 6. Success Criteria
- Bot responds to messages and photos on the deployed Vercel URL.
- Expenses are correctly saved to Google Sheets from the deployed environment.
- Deployment incurs $0 cost under the Vercel Hobby tier.
