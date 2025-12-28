-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentStep" TEXT,
ADD COLUMN     "tempExerciseName" TEXT,
ADD COLUMN     "tempReps" INTEGER,
ADD COLUMN     "tempSets" INTEGER,
ADD COLUMN     "tempWeight" DOUBLE PRECISION;
