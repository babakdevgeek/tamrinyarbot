import type { VercelRequest, VercelResponse } from "@vercel/node";
import { bot } from "../src/bot.js";
export default function (req: VercelRequest, res: VercelResponse) {
  if (req.method === "POST") {
    bot.handleUpdate(req.body);
    res.status(200).send("OK");
  } else {
    res.status(200).send("Bot is running");
  }
}
