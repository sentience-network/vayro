CREATE TYPE "CatalogSource" AS ENUM ('NHTSA', 'USCG', 'MANUFACTURER', 'MANUAL');

CREATE TABLE "VehicleCatalogMake" (
  "id" TEXT NOT NULL, "source" "CatalogSource" NOT NULL, "sourceId" TEXT NOT NULL,
  "name" TEXT NOT NULL, "normalizedName" TEXT NOT NULL, "vehicleTypes" TEXT[] NOT NULL,
  "country" TEXT, "active" BOOLEAN NOT NULL DEFAULT true, "sourceUrl" TEXT NOT NULL,
  "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "VehicleCatalogMake_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "VehicleCatalogMake_source_sourceId_key" ON "VehicleCatalogMake"("source", "sourceId");
CREATE INDEX "VehicleCatalogMake_normalizedName_idx" ON "VehicleCatalogMake"("normalizedName");
CREATE INDEX "VehicleCatalogMake_source_active_idx" ON "VehicleCatalogMake"("source", "active");

CREATE TABLE "VehicleCatalogModel" (
  "id" TEXT NOT NULL, "source" "CatalogSource" NOT NULL, "sourceId" TEXT NOT NULL,
  "makeId" TEXT NOT NULL, "name" TEXT NOT NULL, "normalizedName" TEXT NOT NULL,
  "vehicleTypes" TEXT[] NOT NULL, "firstYear" INTEGER, "lastYear" INTEGER,
  "active" BOOLEAN NOT NULL DEFAULT true, "sourceUrl" TEXT NOT NULL,
  "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "VehicleCatalogModel_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "VehicleCatalogModel_source_sourceId_key" ON "VehicleCatalogModel"("source", "sourceId");
CREATE INDEX "VehicleCatalogModel_makeId_normalizedName_idx" ON "VehicleCatalogModel"("makeId", "normalizedName");
CREATE INDEX "VehicleCatalogModel_source_active_idx" ON "VehicleCatalogModel"("source", "active");
ALTER TABLE "VehicleCatalogModel" ADD CONSTRAINT "VehicleCatalogModel_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES "VehicleCatalogMake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "VehicleCatalogSync" (
  "id" TEXT NOT NULL, "source" "CatalogSource" NOT NULL, "status" TEXT NOT NULL DEFAULT 'RUNNING',
  "makesProcessed" INTEGER NOT NULL DEFAULT 0, "modelsProcessed" INTEGER NOT NULL DEFAULT 0,
  "error" TEXT, "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "completedAt" TIMESTAMP(3),
  CONSTRAINT "VehicleCatalogSync_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "VehicleCatalogSync_source_startedAt_idx" ON "VehicleCatalogSync"("source", "startedAt");

ALTER TABLE "Listing" ADD COLUMN "catalogModelId" TEXT;
CREATE INDEX "Listing_catalogModelId_idx" ON "Listing"("catalogModelId");
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_catalogModelId_fkey" FOREIGN KEY ("catalogModelId") REFERENCES "VehicleCatalogModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
