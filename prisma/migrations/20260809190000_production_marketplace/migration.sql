ALTER TYPE "BookingStatus" RENAME VALUE 'PENDING' TO 'REQUESTED';
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'PENDING';
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'PAYMENT_REQUIRED';
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'PAID';
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'ACTIVE';
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'PAYMENT_FAILED';
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'REFUND_PENDING';
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'REFUNDED';
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'DISPUTED';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'REFUND_PENDING';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'DISPUTED';
CREATE TYPE "InspectionType" AS ENUM ('CHECK_IN', 'CHECK_OUT');

ALTER TABLE "User" ADD COLUMN "emailVerifiedAt" TIMESTAMP(3);
ALTER TABLE "Listing" ADD COLUMN "instantBook" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "deliveryRadiusMiles" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "deliveryBaseFee" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "deliveryPerMile" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "latitude" DECIMAL(9,6),
ADD COLUMN "longitude" DECIMAL(9,6);
ALTER TABLE "Photo" ADD COLUMN "sourceUrl" TEXT,
ADD COLUMN "license" TEXT,
ADD COLUMN "providerAssetId" TEXT,
ADD COLUMN "uploadedByOwner" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "isRepresentative" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Booking" ADD COLUMN "cancellationReason" TEXT,
ADD COLUMN "cancelledAt" TIMESTAMP(3),
ADD COLUMN "refundAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "stripeRefundId" TEXT,
ADD COLUMN "policyVersion" TEXT NOT NULL DEFAULT '2026-08-09';
CREATE UNIQUE INDEX "Booking_stripeRefundId_key" ON "Booking"("stripeRefundId");
ALTER TABLE "VehicleVerification" ADD COLUMN "currentPhotosConfirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "odometerOrHours" INTEGER,
ADD COLUMN "plateLast4" TEXT,
ADD COLUMN "registrationDocumentRef" TEXT,
ADD COLUMN "ownershipDocumentRef" TEXT,
ADD COLUMN "documentProvider" TEXT;

CREATE TABLE "TripInspection" (
  "id" TEXT NOT NULL, "type" "InspectionType" NOT NULL, "bookingId" TEXT NOT NULL,
  "listingId" TEXT NOT NULL, "odometerOrHours" INTEGER, "fuelOrBatteryLevel" INTEGER,
  "notes" TEXT, "damageDiagram" JSONB NOT NULL DEFAULT '{}', "renterConfirmedAt" TIMESTAMP(3),
  "ownerConfirmedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "TripInspection_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TripInspection_bookingId_type_key" ON "TripInspection"("bookingId", "type");
ALTER TABLE "TripInspection" ADD CONSTRAINT "TripInspection_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TripInspection" ADD CONSTRAINT "TripInspection_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE TABLE "InspectionPhoto" ("id" TEXT NOT NULL, "inspectionId" TEXT NOT NULL, "url" TEXT NOT NULL, "providerAssetId" TEXT, "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "InspectionPhoto_pkey" PRIMARY KEY ("id"));
ALTER TABLE "InspectionPhoto" ADD CONSTRAINT "InspectionPhoto_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "TripInspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE TABLE "PolicyAcceptance" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "policy" TEXT NOT NULL, "version" TEXT NOT NULL, "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PolicyAcceptance_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "PolicyAcceptance_userId_policy_version_key" ON "PolicyAcceptance"("userId", "policy", "version");
ALTER TABLE "PolicyAcceptance" ADD CONSTRAINT "PolicyAcceptance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE TABLE "EmailDelivery" ("id" TEXT NOT NULL, "userId" TEXT, "toEmail" TEXT NOT NULL, "template" TEXT NOT NULL, "subject" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'QUEUED', "providerMessageId" TEXT, "attempts" INTEGER NOT NULL DEFAULT 0, "lastError" TEXT, "payload" JSONB NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "sentAt" TIMESTAMP(3), CONSTRAINT "EmailDelivery_pkey" PRIMARY KEY ("id"));
CREATE INDEX "EmailDelivery_status_createdAt_idx" ON "EmailDelivery"("status", "createdAt");
ALTER TABLE "EmailDelivery" ADD CONSTRAINT "EmailDelivery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE TABLE "AnalyticsEvent" ("id" TEXT NOT NULL, "userId" TEXT, "sessionId" TEXT NOT NULL, "name" TEXT NOT NULL, "path" TEXT NOT NULL, "metadata" JSONB NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id"));
CREATE INDEX "AnalyticsEvent_name_createdAt_idx" ON "AnalyticsEvent"("name", "createdAt");
CREATE INDEX "AnalyticsEvent_sessionId_createdAt_idx" ON "AnalyticsEvent"("sessionId", "createdAt");
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
