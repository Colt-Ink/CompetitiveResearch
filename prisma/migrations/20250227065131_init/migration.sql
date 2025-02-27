-- CreateTable
CREATE TABLE "Florist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "website" TEXT,
    "placeId" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "distanceMiles" REAL,
    "rating" REAL,
    "reviewCount" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BusinessHours" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "floristId" TEXT NOT NULL,
    "monday" TEXT,
    "tuesday" TEXT,
    "wednesday" TEXT,
    "thursday" TEXT,
    "friday" TEXT,
    "saturday" TEXT,
    "sunday" TEXT,
    CONSTRAINT "BusinessHours_floristId_fkey" FOREIGN KEY ("floristId") REFERENCES "Florist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PricingItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "floristId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "priceRange" TEXT NOT NULL,
    CONSTRAINT "PricingItem_floristId_fkey" FOREIGN KEY ("floristId") REFERENCES "Florist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RouteStop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "routeId" TEXT NOT NULL,
    "floristId" TEXT NOT NULL,
    "stopOrder" INTEGER NOT NULL,
    "notes" TEXT,
    CONSTRAINT "RouteStop_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RouteStop_floristId_fkey" FOREIGN KEY ("floristId") REFERENCES "Florist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Territory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FloristTerritory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "floristId" TEXT NOT NULL,
    "territoryId" TEXT NOT NULL,
    CONSTRAINT "FloristTerritory_floristId_fkey" FOREIGN KEY ("floristId") REFERENCES "Florist" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FloristTerritory_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES "Territory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SlackMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slackTs" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "floristId" TEXT,
    "syncedToNote" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SlackMessage_floristId_fkey" FOREIGN KEY ("floristId") REFERENCES "Florist" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SlackNotificationSubscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channelId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Florist_placeId_key" ON "Florist"("placeId");

-- CreateIndex
CREATE INDEX "Florist_name_idx" ON "Florist"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessHours_floristId_key" ON "BusinessHours"("floristId");

-- CreateIndex
CREATE UNIQUE INDEX "RouteStop_routeId_stopOrder_key" ON "RouteStop"("routeId", "stopOrder");

-- CreateIndex
CREATE UNIQUE INDEX "FloristTerritory_floristId_territoryId_key" ON "FloristTerritory"("floristId", "territoryId");

-- CreateIndex
CREATE UNIQUE INDEX "SlackMessage_slackTs_key" ON "SlackMessage"("slackTs");

-- CreateIndex
CREATE UNIQUE INDEX "SlackNotificationSubscription_channelId_eventType_key" ON "SlackNotificationSubscription"("channelId", "eventType");
