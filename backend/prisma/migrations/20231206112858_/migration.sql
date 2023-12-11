/*
  Warnings:

  - You are about to alter the column `expiresIn` on the `Blacklist` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Blacklist" ALTER COLUMN "expiresIn" SET DATA TYPE INTEGER;
