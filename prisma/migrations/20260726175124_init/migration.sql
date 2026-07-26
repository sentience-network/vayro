-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "accuracyScore" REAL NOT NULL DEFAULT 0,
    "totalPredictions" INTEGER NOT NULL DEFAULT 0,
    "correctPredictions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Market" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "optionsJson" TEXT NOT NULL,
    "entryFee" INTEGER NOT NULL DEFAULT 10,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolvesAt" DATETIME NOT NULL,
    "resolvedOption" TEXT,
    "adPoolCents" INTEGER NOT NULL DEFAULT 0,
    "participantCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "creatorId" TEXT NOT NULL,
    CONSTRAINT "Market_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MarketEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "choice" TEXT NOT NULL,
    "feePaid" INTEGER NOT NULL,
    "isCorrect" BOOLEAN,
    "activityScore" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    CONSTRAINT "MarketEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MarketEntry_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CreditLedger" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "metaJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "CreditLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdView" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partnerName" TEXT NOT NULL,
    "revenueCents" INTEGER NOT NULL,
    "creditReward" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "marketId" TEXT,
    CONSTRAINT "AdView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AdView_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RevenuePayout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "shareBps" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "marketId" TEXT NOT NULL,
    CONSTRAINT "RevenuePayout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RevenuePayout_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlatformConfig" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "betmeBps" INTEGER NOT NULL DEFAULT 4000,
    "creatorBps" INTEGER NOT NULL DEFAULT 2500,
    "accurateBps" INTEGER NOT NULL DEFAULT 2500,
    "participantBps" INTEGER NOT NULL DEFAULT 1000,
    "signupBonus" INTEGER NOT NULL DEFAULT 100,
    "dailyBonus" INTEGER NOT NULL DEFAULT 15,
    "adCreditReward" INTEGER NOT NULL DEFAULT 5,
    "defaultEntryFee" INTEGER NOT NULL DEFAULT 10
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Market_slug_key" ON "Market"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "MarketEntry_userId_marketId_key" ON "MarketEntry"("userId", "marketId");
