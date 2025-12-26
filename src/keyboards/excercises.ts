import { Markup } from "telegraf";

export const mainKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback("📋 حرکات من", "list_exercises")],
  [Markup.button.callback("➕ اضافه کردن حرکت", "add_exercise")],
]);

export const backButton = Markup.inlineKeyboard([
  [Markup.button.callback("⬅️ بازگشت", "back_home")],
]);
