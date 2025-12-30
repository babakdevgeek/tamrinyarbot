import { Markup } from "telegraf";
import { buttonsText } from "../constants/buttonsText.js";

export const homeMenu = Markup.keyboard([
  [buttonsText.home.addExercise, buttonsText.home.myExercises],
  [buttonsText.home.allExsInOneMessage],
  [buttonsText.home.report],
])
  .resize()
  .persistent();
