import { Markup } from "telegraf";
import prisma from "../db.js";

export async function getExercisesKeyboard(userId: number) {
  const exercises = await prisma.exercise.findMany({
    where: { userId },
    orderBy: { id: "desc" },
  });

  if (exercises.length === 0) return null;
  const buttons = [["⬅️"], ...exercises.map((ex) => [ex.name])];

  return Markup.keyboard(buttons).resize();
}
