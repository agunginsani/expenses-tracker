import { Telegraf } from 'telegraf';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');

bot.start((ctx) => ctx.reply('Welcome to Gemini Expense Bot!'));
bot.on('text', (ctx) => ctx.reply(`You said: ${ctx.message.text}`));

console.log('Bot is starting...');
bot.launch().catch(err => console.error('Failed to launch bot:', err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
