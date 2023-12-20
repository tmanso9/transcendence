/*
  Warnings:

  - Added the required column `login` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Login" AS ENUM ('REGULAR', 'FORTYTWO', 'GOOGLE');

-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'BLOCKED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "login" "Login" NOT NULL;
