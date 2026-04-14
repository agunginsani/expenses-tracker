import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { ZodError } from "zod";
import { parseExpense } from "./services/gemini.js";
import { saveToSheet } from "./services/sheets.js";

export const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || "");

bot.start((ctx) =>
  ctx.reply("Welcome! Send me an expense text or a receipt photo."),
);

bot.on(message("text"), async (ctx) => {
  try {
    await ctx.reply("⏳ Processing your expense...");
    const data = await parseExpense(ctx.message.text);
    await saveToSheet(data);
    ctx.reply(
      `✅ Saved: ${data.amount} ${data.currency} for ${data.description} (${data.category})`,
    );
  } catch (err) {
    handleBotError(ctx, err);
  }
});

bot.on(message("photo"), async (ctx) => {
  try {
    await ctx.reply("⏳ Processing your receipt photo...");
    const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    const link = await ctx.telegram.getFileLink(fileId);
    const response = await fetch(link.href);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const data = await parseExpense(buffer, {
      mimeType: "image/jpeg",
      caption: ctx.message.caption,
    });
    await saveToSheet(data);
    ctx.reply(
      `📸 Receipt saved: ${data.amount} ${data.currency} at ${data.description}`,
    );
  } catch (err) {
    handleBotError(ctx, err);
  }
});

bot.on(message("document"), async (ctx) => {
  if (ctx.message.document.mime_type !== "application/pdf") return;
  try {
    await ctx.reply("⏳ Processing your PDF invoice...");
    const fileId = ctx.message.document.file_id;
    const link = await ctx.telegram.getFileLink(fileId);
    const response = await fetch(link.href);
    const buffer = Buffer.from(await response.arrayBuffer());

    const data = await parseExpense(buffer, {
      mimeType: "application/pdf",
      caption: ctx.message.caption,
    });
    await saveToSheet(data);
    ctx.reply(
      `✅ PDF Saved: ${data.amount} ${data.currency} for ${data.description}`,
    );
  } catch (err) {
    handleBotError(ctx, err);
  }
});

function handleBotError(ctx: any, err: any) {
  console.error(err);
  if (err instanceof ZodError) {
    const dateError = err.errors.find((e) => e.path.includes("date"));
    if (dateError) {
      return ctx.reply(
        "❌ Transaction date not found. Please provide it in the caption (e.g., 'Lunch on 2026-04-14') or send a clearer photo.",
      );
    }
    return ctx.reply("❌ Data validation failed. Please try again.");
  }
  ctx.reply("❌ An error occurred while processing your expense.");
}
