CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'CHECKOUT_CREATED', 'PAID', 'FAILED', 'REFUNDED');
ALTER TABLE "User" ADD COLUMN "stripeConnectAccountId" TEXT,
ADD COLUMN "stripeChargesEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "stripePayoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "identityVerificationSessionId" TEXT,
ADD COLUMN "identityVerificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
ADD COLUMN "identityVerifiedAt" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
ADD COLUMN "stripeCheckoutSessionId" TEXT,
ADD COLUMN "stripePaymentIntentId" TEXT,
ADD COLUMN "paidAt" TIMESTAMP(3);
CREATE UNIQUE INDEX "User_stripeConnectAccountId_key" ON "User"("stripeConnectAccountId");
CREATE UNIQUE INDEX "User_identityVerificationSessionId_key" ON "User"("identityVerificationSessionId");
CREATE UNIQUE INDEX "Booking_stripeCheckoutSessionId_key" ON "Booking"("stripeCheckoutSessionId");
CREATE UNIQUE INDEX "Booking_stripePaymentIntentId_key" ON "Booking"("stripePaymentIntentId");
