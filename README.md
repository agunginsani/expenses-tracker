# Expenses Tracker

A Telegram bot that uses Google Gemini to parse expense messages, receipt photos, and PDF invoices, then records expenses in Google Sheets.

## Features

- Parse text messages into expenses with an amount, currency, category, and description.
- Process receipt photos and PDF documents. When Gemini returns receipt items, their itemized list is added to the expense description; the items are not stored in separate spreadsheet columns.
- Query expenses by date, for example `/expenses yesterday`. Results are grouped by category and currency.
- Use a configurable timezone through `APP_TIMEZONE` (default: `Asia/Jakarta`).
- Skip an expense when its ID has already been recorded, avoiding duplicate rows.

## How it works

Send a message such as:

> Lunch with the team 150k

Gemini interprets the message and the bot saves the parsed expense to your sheet. The exact description, category, amount, and currency depend on the message and Gemini's response, so examples are illustrative rather than guaranteed.

You can also send a receipt photo or a PDF invoice as a Telegram document. The bot records a parsed expense; any returned receipt itemization is included as text in its description, not as individual expense rows. PDF processing applies to PDF documents.

To see totals for a date, send a command such as:

```text
/expenses yesterday
```

The date follows `APP_TIMEZONE`, and the results depend on the expenses in your sheet.

## Getting started

### Prerequisites and external setup

1. Install [Bun](https://bun.sh/docs/installation).
2. Create a Telegram bot with [BotFather](https://core.telegram.org/bots/tutorial#obtain-your-bot-token) and keep its token private.
3. Create a Gemini API key in [Google AI Studio](https://ai.google.dev/gemini-api/docs/api-key).
4. In Google Cloud:
   - Create a project and [enable the Google Sheets API](https://console.cloud.google.com/apis/library/sheets.googleapis.com).
   - [Create a service account](https://cloud.google.com/iam/docs/service-accounts-create) and a [service account key](https://cloud.google.com/iam/docs/keys-create-delete). Keep the downloaded key private.
   - Create a Google Sheet and share it with the service account email address as an editor. See [Google Drive sharing guidance](https://support.google.com/drive/answer/2494822?hl=en).
   - Copy the spreadsheet ID from its URL.

### Install and configure

```bash
git clone https://github.com/agunginsani/expenses-tracker.git
cd expenses-tracker
bun install
cp .env.example .env
```

Set these values in `.env`:

| Variable | Description |
| --- | --- |
| `TELEGRAM_BOT_TOKEN` | Token from BotFather |
| `GEMINI_API_KEY` | Key from Google AI Studio |
| `GOOGLE_SHEET_ID` | ID of the Google Sheet |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Email address of the Google service account |
| `GOOGLE_PRIVATE_KEY` | Private key for the service account; preserve the newline format shown in `.env.example` |
| `APP_TIMEZONE` | Optional timezone; defaults to `Asia/Jakarta` |

Do not commit `.env` or share its values. The Google service account needs editor access to the sheet so the bot can add expense rows.

### Run locally

```bash
bun start
```

This starts the bot in Telegram polling mode for local use.

## Deploy to Vercel

Production deployments are release-driven: publishing a GitHub Release starts the repository's deployment workflow. Pushing to `main` does not trigger a production deployment.

1. Create a Vercel project. This GitHub Actions deployment path uses the Vercel CLI, so connecting the GitHub repository through Vercel's Git integration is not required.
2. Add the required application variables above to the Vercel project's **Production** environment. Add `APP_TIMEZONE` only if you want a timezone other than the default. Vercel documents [environment variable setup](https://vercel.com/docs/environment-variables).
3. In the GitHub repository, add these Actions secrets:
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
   - `VERCEL_TOKEN`

   See GitHub's guide to [creating Actions secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions). The Vercel IDs and token are separate from the application's runtime variables.
4. [Publish a GitHub Release](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases). If its tests, type-check, and Biome checks pass, the workflow deploys the production app to Vercel.
5. Register the Telegram webhook for the deployed app using its base URL:

   ```bash
   bun run set-webhook https://your-project.vercel.app
   ```

   The webhook helper uses `TELEGRAM_BOT_TOKEN` from your local environment and registers the deployed `/api/webhook` endpoint. It prints the webhook URL, which contains the bot token; treat the output as a secret and do not share or paste it into logs, issues, or chat. See Telegram's [`setWebhook` documentation](https://core.telegram.org/bots/api#setwebhook).

## Development

```bash
bun run lint
bun run format
bun run test
bun x tsc --noEmit
```

- `bun run lint` runs Biome linting.
- `bun run format` formats files and writes the changes.
- `bun run test` runs the tests with coverage and writes an LCOV report.
- `bun x tsc --noEmit` type-checks without emitting files.
- `bun run check` runs Biome checks with `--write`, so it may modify files.

GitHub Actions also runs Biome, TypeScript, and tests on pushes and pull requests targeting `main`.

## License

MIT
