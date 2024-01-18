-- DropForeignKey
ALTER TABLE "Gamestats" DROP CONSTRAINT "Gamestats_userId_fkey";

-- AddForeignKey
ALTER TABLE "Gamestats" ADD CONSTRAINT "Gamestats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
