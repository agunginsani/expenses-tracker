import { bot } from "../src/bot.js";

const url = process.argv[2];

if (!url) {
  console.error("Please provide the deployment URL as an argument.");
  process.exit(1);
}

const botToken = process.env.TELEGRAM_BOT_TOKEN;

if (!botToken) {
  console.error("TELEGRAM_BOT_TOKEN is not defined in the environment.");
  process.exit(1);
}

const webhookUrl = `${url}/api/webhook?token=${botToken}`;

console.log(`Setting webhook to: ${webhookUrl}`);

bot.telegram
  .setWebhook(webhookUrl)
  .then((result) => {
    if (result) {
      console.log("✅ Webhook set successfully!");
    } else {
      console.error("❌ Failed to set webhook.");
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error setting webhook:", err);
    process.exit(1);
  });
