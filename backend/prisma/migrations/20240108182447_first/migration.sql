-- CreateEnum
CREATE TYPE "Status" AS ENUM ('OFFLINE', 'ONLINE', 'IN_GAME', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('PENDING', 'ACCEPTED');

-- CreateEnum
CREATE TYPE "Rank" AS ENUM ('GURU', 'PRO', 'NOOBIE');

-- CreateEnum
CREATE TYPE "Login" AS ENUM ('REGULAR', 'FORTYTWO', 'GOOGLE');

-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('PERSONAL', 'PRIVATE', 'PUBLIC');

-- CreateTable
CREATE TABLE "Connections" (
    "id" TEXT NOT NULL,
    "status" "ConnectionStatus" NOT NULL DEFAULT 'PENDING',
    "creator" TEXT NOT NULL,
    "receiver" TEXT NOT NULL,

    CONSTRAINT "Connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "status" "Status" NOT NULL,
    "avatar" TEXT NOT NULL,
    "rank" "Rank" NOT NULL DEFAULT 'NOOBIE',
    "login" "Login" NOT NULL,
    "tfa_secret" TEXT NOT NULL,
    "tfa_enabled" BOOLEAN NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "alerts" JSONB[] DEFAULT ARRAY[]::JSONB[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blacklist" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "sub" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expiresIn" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Blacklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gamestats" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Gamestats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channels" (
    "id" TEXT NOT NULL,
    "creator" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "password" TEXT NOT NULL DEFAULT '',
    "channelName" TEXT NOT NULL,
    "messages" JSONB[],

    CONSTRAINT "Channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Friends" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
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
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "_Friends_AB_unique" ON "_Friends"("A", "B");

-- CreateIndex
CREATE INDEX "_Friends_B_index" ON "_Friends"("B");

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
ALTER TABLE "_Friends" ADD CONSTRAINT "_Friends_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Friends" ADD CONSTRAINT "_Friends_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
