/*
  Warnings:

  - You are about to drop the `Set` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `sets` to the `Exercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight` to the `Exercise` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Set" DROP CONSTRAINT "Set_exerciseId_fkey";

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "sets" TEXT NOT NULL,
ADD COLUMN     "weight" DOUBLE PRECISION NOT NULL;

-- DropTable
DROP TABLE "Set";
