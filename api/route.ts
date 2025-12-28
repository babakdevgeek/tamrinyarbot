import type { VercelRequest, VercelResponse } from "@vercel/node";
import { bot } from "../src/bot.js";
export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log(req.body);
  if (req.method === "POST") {
    await bot.handleUpdate(req.body);
    res.status(200).send("OK");
  } else {
    res.status(200).send("Bot is running");
  }
}
