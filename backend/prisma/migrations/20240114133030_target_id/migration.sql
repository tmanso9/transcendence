/*
  Warnings:

  - You are about to drop the column `senderId` on the `Alert` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[targetId]` on the table `Alert` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `targetId` to the `Alert` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Alert" DROP CONSTRAINT "Alert_senderId_fkey";

-- DropIndex
DROP INDEX "Alert_senderId_key";

-- AlterTable
ALTER TABLE "Alert" DROP COLUMN "senderId",
ADD COLUMN     "targetId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Alert_targetId_key" ON "Alert"("targetId");

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
