import { Markup } from "telegraf";
import prisma from "../db.js";

export async function getExercisesKeyboard(userId: number) {
  const exercises = await prisma.exercise.findMany({ where: { userId } });

  if (exercises.length === 0) return null;

  // هر دکمه یک ردیف، شامل اسم حرکت
  const buttons = exercises.map((ex) => [ex.name]);

  // اضافه کردن دکمه بازگشت
  buttons.push(["⬅️ بازگشت", "🏠"]);

  return Markup.keyboard(buttons).resize();
}
