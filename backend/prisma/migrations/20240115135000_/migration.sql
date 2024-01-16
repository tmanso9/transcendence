/*
  Warnings:

  - Added the required column `loserUsername` to the `Games` table without a default value. This is not possible if the table is not empty.
  - Added the required column `winnerUsername` to the `Games` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Games" ADD COLUMN     "loserUsername" TEXT NOT NULL,
ADD COLUMN     "winnerUsername" TEXT NOT NULL;
