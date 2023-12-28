-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('PERSONAL', 'PRIVATE', 'PUBLIC');

-- AlterTable
ALTER TABLE "Blacklist" ALTER COLUMN "sub" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "Gamestats" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Gamestats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channels" (
    "id" TEXT NOT NULL,
    "creator" TEXT NOT NULL,
    "password" TEXT NOT NULL DEFAULT '',
    "channelName" TEXT NOT NULL,
    "messages" JSONB[],

    CONSTRAINT "Channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Members" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_Admins" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_Banned" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_Muted" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Members_AB_unique" ON "_Members"("A", "B");

-- CreateIndex
CREATE INDEX "_Members_B_index" ON "_Members"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Admins_AB_unique" ON "_Admins"("A", "B");

-- CreateIndex
CREATE INDEX "_Admins_B_index" ON "_Admins"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Banned_AB_unique" ON "_Banned"("A", "B");

-- CreateIndex
CREATE INDEX "_Banned_B_index" ON "_Banned"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Muted_AB_unique" ON "_Muted"("A", "B");

-- CreateIndex
CREATE INDEX "_Muted_B_index" ON "_Muted"("B");

-- AddForeignKey
ALTER TABLE "_Members" ADD CONSTRAINT "_Members_A_fkey" FOREIGN KEY ("A") REFERENCES "Channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Members" ADD CONSTRAINT "_Members_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Admins" ADD CONSTRAINT "_Admins_A_fkey" FOREIGN KEY ("A") REFERENCES "Channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Admins" ADD CONSTRAINT "_Admins_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Banned" ADD CONSTRAINT "_Banned_A_fkey" FOREIGN KEY ("A") REFERENCES "Channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Banned" ADD CONSTRAINT "_Banned_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Muted" ADD CONSTRAINT "_Muted_A_fkey" FOREIGN KEY ("A") REFERENCES "Channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Muted" ADD CONSTRAINT "_Muted_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
