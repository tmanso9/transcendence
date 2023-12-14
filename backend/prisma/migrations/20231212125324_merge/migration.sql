/*
  Warnings:

  - The primary key for the `Blacklist` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Blacklist" DROP CONSTRAINT "Blacklist_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Blacklist_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Blacklist_id_seq";
