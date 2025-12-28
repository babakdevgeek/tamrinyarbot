import { Markup } from "telegraf";

export const homeKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback("🏋️ حرکات من", "EXERCISE_LIST")],
  [Markup.button.callback("➕ افزودن حرکت", "EXERCISE_ADD")],
  [Markup.button.callback("📊 آخرین تمرین", "LAST_WORKOUT")],
]);
