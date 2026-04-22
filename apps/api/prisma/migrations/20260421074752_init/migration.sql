-- CreateEnum
CREATE TYPE "Stage" AS ENUM ('INTRO', 'COMFORT', 'FLIRT', 'UPGRADE', 'COOLING', 'ENDED');

-- CreateEnum
CREATE TYPE "InteractionFrequency" AS ENUM ('HIGH', 'MEDIUM', 'LOW', 'NONE');

-- CreateEnum
CREATE TYPE "InitiativeDirection" AS ENUM ('SELF', 'OTHER', 'BALANCED');

-- CreateEnum
CREATE TYPE "EmotionQuality" AS ENUM ('NEUTRAL', 'POSITIVE', 'VOLATILE', 'DRAINING');

-- CreateEnum
CREATE TYPE "InvestmentBalance" AS ENUM ('SELF_MORE', 'BALANCED', 'OTHER_MORE');

-- CreateEnum
CREATE TYPE "OfflineStatus" AS ENUM ('NEVER', 'ONCE', 'MULTIPLE');

-- CreateEnum
CREATE TYPE "NextAction" AS ENUM ('KEEP_CHAT', 'LIGHT_UPGRADE', 'CLEAR_INVITE', 'SLOW_DOWN', 'OBSERVE', 'END');

-- CreateEnum
CREATE TYPE "UpgradeSignal" AS ENUM ('CARE', 'INVITE', 'TIME_GIVE', 'BODY_LANGUAGE', 'EMOTIONAL_DEPENDENCE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "displayName" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'zh',
    "trialEndsAt" TIMESTAMP(3) NOT NULL,
    "subscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Connection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stage" "Stage" NOT NULL,
    "lastInteractionAt" TIMESTAMP(3),
    "interactionFreq" "InteractionFrequency" NOT NULL,
    "initiative" "InitiativeDirection" NOT NULL,
    "emotionQuality" "EmotionQuality" NOT NULL,
    "investmentBalance" "InvestmentBalance" NOT NULL,
    "offlineStatus" "OfflineStatus" NOT NULL,
    "upgradeSignals" "UpgradeSignal"[],
    "nextAction" "NextAction" NOT NULL,
    "actionDueAt" TIMESTAMP(3),
    "decisionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Connection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
