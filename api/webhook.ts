import type { VercelRequest, VercelResponse } from "@vercel/node";
import { bot } from "../src/bot.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    // Verify token if provided as a query param (simple security)
    const { token } = req.query;
    if (token !== process.env.TELEGRAM_BOT_TOKEN) {
      return res.status(401).send("Unauthorized");
    }

    await bot.handleUpdate(req.body, res);
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).send("Internal Server Error");
  }
}
