/*
  Warnings:

  - Added the required column `tfa_enabled` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tfa_secret` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tfa_enabled" BOOLEAN NOT NULL,
ADD COLUMN     "tfa_secret" TEXT NOT NULL;
