-- CreateTable
CREATE TABLE "ScanReport" (
    "id" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "target" TEXT,
    "targetEndpoint" TEXT,
    "reportCount" INTEGER NOT NULL DEFAULT 1,
    "domainCacheId" TEXT,
    "rawContent" TEXT NOT NULL,
    "inputType" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "redFlags" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "actionableGuidance" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScanReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DomainCache" (
    "domain" TEXT NOT NULL,
    "ageInDays" INTEGER,
    "isWhitelisted" BOOLEAN NOT NULL DEFAULT false,
    "isBlacklisted" BOOLEAN NOT NULL DEFAULT false,
    "reportCount" INTEGER NOT NULL DEFAULT 0,
    "dailyReports" TEXT NOT NULL DEFAULT '[]',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DomainCache_pkey" PRIMARY KEY ("domain")
);

-- CreateTable
CREATE TABLE "scam_patterns" (
    "job_id" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "common_locations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "communication_channels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "salary_range" VARCHAR(100),
    "payment_methods" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "behavioral_flags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "financial_trap" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scam_patterns_pkey" PRIMARY KEY ("job_id")
);

-- CreateTable
CREATE TABLE "community_reports" (
    "id" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payload_hash" VARCHAR(64) NOT NULL,
    "scam_type" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'STAGED',
    "verification_score" INTEGER NOT NULL DEFAULT 0,
    "source_ip_hash" VARCHAR(64),
    "raw_payload" TEXT,

    CONSTRAINT "community_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScanReport_contentHash_key" ON "ScanReport"("contentHash");

-- CreateIndex
CREATE UNIQUE INDEX "ScanReport_targetEndpoint_key" ON "ScanReport"("targetEndpoint");

-- CreateIndex
CREATE INDEX "ScanReport_target_createdAt_idx" ON "ScanReport"("target", "createdAt");

-- CreateIndex
CREATE INDEX "ScanReport_domainCacheId_idx" ON "ScanReport"("domainCacheId");

-- CreateIndex
CREATE INDEX "idx_reports_payload_hash" ON "community_reports"("payload_hash");

-- CreateIndex
CREATE INDEX "idx_reports_status" ON "community_reports"("status");

-- AddForeignKey
ALTER TABLE "ScanReport" ADD CONSTRAINT "ScanReport_domainCacheId_fkey" FOREIGN KEY ("domainCacheId") REFERENCES "DomainCache"("domain") ON DELETE SET NULL ON UPDATE CASCADE;
