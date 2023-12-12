-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('PENDING', 'ACCEPTED');

-- CreateTable
CREATE TABLE "Connections" (
    "id" TEXT NOT NULL,
    "status" "ConnectionStatus" NOT NULL DEFAULT 'PENDING',
    "creator" TEXT NOT NULL,
    "receiver" TEXT NOT NULL,

    CONSTRAINT "Connections_pkey" PRIMARY KEY ("id")
);
