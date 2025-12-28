import { Markup } from "telegraf";

export const addExcerciseMenu = Markup.keyboard([["⬅️ بازگشت", "❌ کنسل"]])
  .resize()
  .persistent();
