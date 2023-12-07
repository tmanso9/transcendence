-- CreateTable
CREATE TABLE "Blacklist" (
    "id" SERIAL NOT NULL,
    "sub" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "expiresIn" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Blacklist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Blacklist_sub_key" ON "Blacklist"("sub");
