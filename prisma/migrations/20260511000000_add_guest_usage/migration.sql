-- CreateTable
CREATE TABLE "GuestUsage" (
    "id" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuestUsage_ipHash_month_key" ON "GuestUsage"("ipHash", "month");

-- CreateIndex
CREATE INDEX "GuestUsage_month_idx" ON "GuestUsage"("month");
