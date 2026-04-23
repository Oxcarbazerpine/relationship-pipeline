-- AlterTable
ALTER TABLE "Connection" ADD COLUMN     "channelId" TEXT;

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'blueLight2',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Channel_userId_name_key" ON "Channel"("userId", "name");

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
