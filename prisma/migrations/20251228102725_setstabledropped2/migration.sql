/*
  Warnings:

  - Added the required column `reps` to the `Exercise` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `sets` on the `Exercise` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "reps" TEXT NOT NULL,
DROP COLUMN "sets",
ADD COLUMN     "sets" INTEGER NOT NULL;
