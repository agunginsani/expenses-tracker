import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { parseExpense } from './services/gemini';
import { saveToSheet } from './services/sheets';
import axios from 'axios';

import { ZodError } from 'zod';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');

bot.start((ctx) => ctx.reply('Welcome! Send me an expense text or a receipt photo.'));

bot.on(message('text'), async (ctx) => {
  try {
    await ctx.reply('⏳ Processing your expense...');
    const data = await parseExpense(ctx.message.text);
    await saveToSheet(data);
    ctx.reply(`✅ Saved: ${data.amount} ${data.currency} for ${data.description} (${data.category})`);
  } catch (err) {
    console.error(err);
    if (err instanceof ZodError) {
      return ctx.reply('❌ Data validation failed. The AI provided an invalid format. Please try again.');
    }
    ctx.reply('❌ The AI service is currently busy or unavailable. Please try again in a few minutes.');
  }
});

bot.on(message('photo'), async (ctx) => {
  try {
    await ctx.reply('⏳ Processing your receipt photo...');
    const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    const link = await ctx.telegram.getFileLink(fileId);
    const response = await axios.get(link.href, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    
    const data = await parseExpense(buffer, true);
    await saveToSheet(data);
    ctx.reply(`📸 Receipt saved: ${data.amount} ${data.currency} at ${data.description}`);
  } catch (err) {
    console.error(err);
    if (err instanceof ZodError) {
      return ctx.reply('❌ Data validation failed. The AI provided an invalid format. Please try again.');
    }
    ctx.reply('❌ The AI service is currently busy or unavailable. Please try again in a few minutes.');
  }
});

console.log('Bot is starting with Gemini and Sheets integration...');
bot.launch().catch(err => console.error('Failed to launch bot:', err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
