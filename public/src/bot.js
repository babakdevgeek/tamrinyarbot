import { Telegraf } from "telegraf";
export const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) => {
    ctx.reply(`
        سلام ${ctx.from.first_name}
        `);
});
