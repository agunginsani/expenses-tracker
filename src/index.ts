import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { parseExpense } from './services/gemini';
import { saveToSheet } from './services/sheets';
import axios from 'axios';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');

bot.start((ctx) => ctx.reply('Welcome! Send me an expense text or a receipt photo.'));

bot.on(message('text'), async (ctx) => {
  try {
    const data = await parseExpense(ctx.message.text);
    await saveToSheet(data);
    ctx.reply(`✅ Saved: ${data.amount} ${data.currency} for ${data.description} (${data.category})`);
  } catch (err) {
    console.error(err);
    ctx.reply('❌ Error parsing expense. Try again.');
  }
});

bot.on(message('photo'), async (ctx) => {
  try {
    const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    const link = await ctx.telegram.getFileLink(fileId);
    const response = await axios.get(link.href, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    
    const data = await parseExpense(buffer, true);
    await saveToSheet(data);
    ctx.reply(`📸 Receipt saved: ${data.amount} ${data.currency} at ${data.description}`);
  } catch (err) {
    console.error(err);
    ctx.reply('❌ Error processing receipt photo.');
  }
});

console.log('Bot is starting with Gemini and Sheets integration...');
bot.launch().catch(err => console.error('Failed to launch bot:', err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
