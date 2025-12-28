import { bot } from "../src/bot.js";
export default function (req, res) {
    if (req.method === "POST") {
        bot.handleUpdate(req.body);
        res.status(200).send("OK");
    }
    else {
        res.status(200).send("Bot is running");
    }
}
