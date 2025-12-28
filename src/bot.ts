import { Telegraf } from "telegraf";
import { homeMenu } from "./keyboards/home.keyboard.js";

export const bot = new Telegraf(process.env.BOT_TOKEN!);

bot.start((ctx) => {
  ctx.reply(
    `
        سلام ${ctx.from.first_name}
        `,
    homeMenu
  );
});

// bot.action("HOME", async (ctx) => {
//   await ctx.editMessageText("منوی اصلی", {
//     reply_markup: homeMenu.reply_markup,
//   });
// });
