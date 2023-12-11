/*
  Warnings:

  - Added the required column `token` to the `Blacklist` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Blacklist" ADD COLUMN     "token" TEXT NOT NULL;
