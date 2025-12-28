import { Markup } from "telegraf";
import { buttonsText } from "../constants/buttonsText.js";

export const addExcerciseMenu = Markup.keyboard([
  [buttonsText.addExerciseMenu.back, buttonsText.addExerciseMenu.cancel],
])
  .resize()
  .persistent();
