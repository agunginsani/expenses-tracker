import { bot } from "./bot";

console.log("Bot is starting in polling mode (local)...");
bot.launch().catch((err) => console.error("Failed to launch bot:", err));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
