-- DropForeignKey
ALTER TABLE "Alert" DROP CONSTRAINT "Alert_senderId_fkey";

-- DropIndex
DROP INDEX "Alert_targetId_key";

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
