/*
  Warnings:

  - Added the required column `avatar` to the `Channels` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Channels" ADD COLUMN     "avatar" TEXT NOT NULL;
