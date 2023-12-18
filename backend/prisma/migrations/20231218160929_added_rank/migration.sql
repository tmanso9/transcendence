-- CreateEnum
CREATE TYPE "Rank" AS ENUM ('GURU', 'PRO', 'NOOBIE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "rank" "Rank" NOT NULL DEFAULT 'NOOBIE';
