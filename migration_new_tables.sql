-- SavedWord에 child 관계 추가 (이미 있는 테이블 수정)
ALTER TABLE "SavedWord" ADD COLUMN IF NOT EXISTS "childId_fk" TEXT;

-- AddForeignKey for SavedWord (이미 있으면 무시)
DO $$ BEGIN
  ALTER TABLE "SavedWord" ADD CONSTRAINT "SavedWord_childId_fkey"
    FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable ReviewSchedule (SM-2 망각곡선 복습 스케줄)
CREATE TABLE IF NOT EXISTS "ReviewSchedule" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "errorRecordId" TEXT NOT NULL,
    "targetWord" TEXT NOT NULL,
    "childPronunciation" TEXT NOT NULL,
    "phoneme" TEXT NOT NULL,
    "errorPattern" TEXT NOT NULL,
    "nextReviewAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "lastReviewedAt" TIMESTAMP(3),
    "lastQuality" INTEGER,
    "isLearned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ReviewSchedule_errorRecordId_key" ON "ReviewSchedule"("errorRecordId");
CREATE INDEX IF NOT EXISTS "ReviewSchedule_childId_nextReviewAt_idx" ON "ReviewSchedule"("childId", "nextReviewAt");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "ReviewSchedule" ADD CONSTRAINT "ReviewSchedule_childId_fkey"
    FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ReviewSchedule" ADD CONSTRAINT "ReviewSchedule_errorRecordId_fkey"
    FOREIGN KEY ("errorRecordId") REFERENCES "ErrorRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
