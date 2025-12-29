import prisma from "../db.js";

export async function getSelectedExercise(telegramId: bigint) {
  const user = await prisma.user.findUnique({
    where: { telegramId },
  });
  if (!user || !user.selectedExerciseId) return null;
  const exercise = await prisma.exercise.findUnique({
    where: { id: user.selectedExerciseId },
  });
  return exercise;
}
