/*
  Warnings:

  - Added the required column `senderId` to the `Alert` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Alert" ADD COLUMN     "senderId" TEXT NOT NULL;
