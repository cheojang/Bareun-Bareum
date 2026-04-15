-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Child" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "mascotLevel" INTEGER NOT NULL DEFAULT 1,
    "totalWords" INTEGER NOT NULL DEFAULT 0,
    "totalMinutes" INTEGER NOT NULL DEFAULT 0,
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "lastPractice" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Child_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "durationMin" INTEGER,

    CONSTRAINT "PracticeSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordRecord" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "targetWord" TEXT NOT NULL,
    "heardWord" TEXT NOT NULL,
    "errorPhonemes" JSONB NOT NULL DEFAULT '[]',
    "guidanceText" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "isBookmarked" BOOLEAN NOT NULL DEFAULT false,
    "practicedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WordRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "tossCustomerKey" TEXT,
    "tossBillingKey" TEXT,
    "status" TEXT NOT NULL DEFAULT 'inactive',
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "Session" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "ErrorRecord" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "targetWord" TEXT NOT NULL,
    "childPronunciation" TEXT NOT NULL,
    "audioUrl" TEXT,
    "errorType" TEXT NOT NULL,
    "errorCategory" TEXT NOT NULL,
    "errorPattern" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErrorRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalAnalysis" (
    "id" TEXT NOT NULL,
    "errorRecordId" TEXT NOT NULL,
    "detectedPattern" TEXT NOT NULL,
    "jamoBreakdown" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL,
    "requiresGemini" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocalAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeminiFeedback" (
    "id" TEXT NOT NULL,
    "errorRecordId" TEXT NOT NULL,
    "rootCause" TEXT NOT NULL,
    "trainingStep1" TEXT NOT NULL,
    "trainingStep2" TEXT NOT NULL,
    "trainingStep3" TEXT NOT NULL,
    "trainingStep4" TEXT NOT NULL,
    "recommendedWords" TEXT NOT NULL,
    "parentMessage" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeminiFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeakPhoneme" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "phoneme" TEXT NOT NULL,
    "totalAttempts" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "errorRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "weaknessLevel" TEXT NOT NULL DEFAULT '정상범위',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeakPhoneme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedWord" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "targetPhoneme" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedWord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_tossCustomerKey_key" ON "Subscription"("tossCustomerKey");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "ErrorRecord_childId_createdAt_idx" ON "ErrorRecord"("childId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LocalAnalysis_errorRecordId_key" ON "LocalAnalysis"("errorRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "GeminiFeedback_errorRecordId_key" ON "GeminiFeedback"("errorRecordId");

-- CreateIndex
CREATE INDEX "WeakPhoneme_childId_idx" ON "WeakPhoneme"("childId");

-- CreateIndex
CREATE UNIQUE INDEX "WeakPhoneme_childId_phoneme_key" ON "WeakPhoneme"("childId", "phoneme");

-- CreateIndex
CREATE INDEX "SavedWord_childId_idx" ON "SavedWord"("childId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedWord_childId_word_key" ON "SavedWord"("childId", "word");

-- AddForeignKey
ALTER TABLE "Child" ADD CONSTRAINT "Child_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeSession" ADD CONSTRAINT "PracticeSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeSession" ADD CONSTRAINT "PracticeSession_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordRecord" ADD CONSTRAINT "WordRecord_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "PracticeSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorRecord" ADD CONSTRAINT "ErrorRecord_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalAnalysis" ADD CONSTRAINT "LocalAnalysis_errorRecordId_fkey" FOREIGN KEY ("errorRecordId") REFERENCES "ErrorRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeminiFeedback" ADD CONSTRAINT "GeminiFeedback_errorRecordId_fkey" FOREIGN KEY ("errorRecordId") REFERENCES "ErrorRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeakPhoneme" ADD CONSTRAINT "WeakPhoneme_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

