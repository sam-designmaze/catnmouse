-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN "paidAt" DATETIME;
ALTER TABLE "Invoice" ADD COLUMN "stripePaymentLinkId" TEXT;

-- AlterTable
ALTER TABLE "TenantBilling" ADD COLUMN "stripeCustomerId" TEXT;
ALTER TABLE "TenantBilling" ADD COLUMN "stripeSubscriptionId" TEXT;
