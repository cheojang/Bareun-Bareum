-- CreateTable
CREATE TABLE "WordPairCache" (
    "id" TEXT NOT NULL,
    "targetWord" TEXT NOT NULL,
    "childPronunciation" TEXT NOT NULL,
    "errorType" TEXT NOT NULL,
    "errorCategory" TEXT NOT NULL,
    "rootCause" TEXT NOT NULL,
    "trainingStep1" TEXT NOT NULL,
    "trainingStep2" TEXT NOT NULL,
    "trainingStep3" TEXT NOT NULL,
    "trainingStep4" TEXT NOT NULL,
    "recommendedWords" TEXT NOT NULL,
    "parentMessage" TEXT NOT NULL,
    "hitCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WordPairCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WordPairCache_targetWord_childPronunciation_key" ON "WordPairCache"("targetWord", "childPronunciation");

-- CreateIndex
CREATE INDEX "WordPairCache_hitCount_idx" ON "WordPairCache"("hitCount");
