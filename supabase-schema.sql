
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'parent',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Child" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" TEXT,
    "image" TEXT,
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
CREATE TABLE IF NOT EXISTS "PracticeSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "durationMin" INTEGER,

    CONSTRAINT "PracticeSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "WordRecord" (
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
CREATE TABLE IF NOT EXISTS "Subscription" (
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
CREATE TABLE IF NOT EXISTS "Account" (
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
CREATE TABLE IF NOT EXISTS "Session" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ErrorRecord" (
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
CREATE TABLE IF NOT EXISTS "LocalAnalysis" (
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
CREATE TABLE IF NOT EXISTS "GeminiFeedback" (
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
CREATE TABLE IF NOT EXISTS "WeakPhoneme" (
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

-- CreateTable
CREATE TABLE IF NOT EXISTS "PhonemeTemplate" (
    "id" TEXT NOT NULL,
    "phoneme" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "errorType" TEXT NOT NULL,
    "errorCategory" TEXT NOT NULL,
    "exampleTarget" TEXT NOT NULL,
    "exampleChild" TEXT NOT NULL,
    "parentHint" TEXT NOT NULL,
    "rootCause" TEXT NOT NULL,
    "trainingStep1" TEXT NOT NULL,
    "trainingStep2" TEXT NOT NULL,
    "trainingStep3" TEXT NOT NULL,
    "trainingStep4" TEXT NOT NULL,
    "recommendedWords" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhonemeTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Announcement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'notice',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AnnouncementRead" (
    "id" TEXT NOT NULL,
    "announcementId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnnouncementRead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "SavedWord" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "targetPhoneme" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedWord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Center" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'basic',
    "inviteCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Center_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Therapist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "centerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'staff',
    "license" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Therapist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CenterChild" (
    "centerId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CenterChild_pkey" PRIMARY KEY ("centerId","childId")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "TherapistChild" (
    "therapistId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TherapistChild_pkey" PRIMARY KEY ("therapistId","childId")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Homework" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "targetWords" TEXT NOT NULL,
    "targetPhoneme" TEXT,
    "description" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Homework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "TherapyNote" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "sessionDate" TIMESTAMP(3) NOT NULL,
    "targetPhonemes" TEXT NOT NULL,
    "performance" INTEGER NOT NULL,
    "memo" TEXT NOT NULL,
    "isVisibleToParent" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TherapyNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "WordPairCache" (
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

-- CreateTable
CREATE TABLE IF NOT EXISTS "GuestUsage" (
    "id" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Message" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "senderRole" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PracticeSession_userId_childId_idx" ON "PracticeSession"("userId", "childId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PracticeSession_childId_startedAt_idx" ON "PracticeSession"("childId", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_tossCustomerKey_key" ON "Subscription"("tossCustomerKey");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ErrorRecord_childId_createdAt_idx" ON "ErrorRecord"("childId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "LocalAnalysis_errorRecordId_key" ON "LocalAnalysis"("errorRecordId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "GeminiFeedback_errorRecordId_key" ON "GeminiFeedback"("errorRecordId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WeakPhoneme_childId_idx" ON "WeakPhoneme"("childId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "WeakPhoneme_childId_phoneme_key" ON "WeakPhoneme"("childId", "phoneme");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ReviewSchedule_errorRecordId_key" ON "ReviewSchedule"("errorRecordId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ReviewSchedule_childId_nextReviewAt_idx" ON "ReviewSchedule"("childId", "nextReviewAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PhonemeTemplate_phoneme_errorType_idx" ON "PhonemeTemplate"("phoneme", "errorType");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PhonemeTemplate_phoneme_position_errorType_key" ON "PhonemeTemplate"("phoneme", "position", "errorType");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Announcement_isPublished_createdAt_idx" ON "Announcement"("isPublished", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AnnouncementRead_userId_idx" ON "AnnouncementRead"("userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AnnouncementRead_announcementId_userId_key" ON "AnnouncementRead"("announcementId", "userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SavedWord_childId_idx" ON "SavedWord"("childId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "SavedWord_childId_word_key" ON "SavedWord"("childId", "word");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Center_inviteCode_key" ON "Center"("inviteCode");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Center_inviteCode_idx" ON "Center"("inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Therapist_userId_key" ON "Therapist"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Therapist_centerId_idx" ON "Therapist"("centerId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CenterChild_centerId_idx" ON "CenterChild"("centerId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TherapistChild_therapistId_idx" ON "TherapistChild"("therapistId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Homework_childId_dueDate_idx" ON "Homework"("childId", "dueDate");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Homework_therapistId_idx" ON "Homework"("therapistId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TherapyNote_childId_sessionDate_idx" ON "TherapyNote"("childId", "sessionDate");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TherapyNote_therapistId_idx" ON "TherapyNote"("therapistId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WordPairCache_hitCount_idx" ON "WordPairCache"("hitCount");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "WordPairCache_targetWord_childPronunciation_key" ON "WordPairCache"("targetWord", "childPronunciation");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "GuestUsage_month_idx" ON "GuestUsage"("month");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "GuestUsage_ipHash_month_key" ON "GuestUsage"("ipHash", "month");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Message_therapistId_parentId_sentAt_idx" ON "Message"("therapistId", "parentId", "sentAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Message_parentId_idx" ON "Message"("parentId");

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

-- AddForeignKey
ALTER TABLE "ReviewSchedule" ADD CONSTRAINT "ReviewSchedule_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewSchedule" ADD CONSTRAINT "ReviewSchedule_errorRecordId_fkey" FOREIGN KEY ("errorRecordId") REFERENCES "ErrorRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnouncementRead" ADD CONSTRAINT "AnnouncementRead_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedWord" ADD CONSTRAINT "SavedWord_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Therapist" ADD CONSTRAINT "Therapist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Therapist" ADD CONSTRAINT "Therapist_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "Center"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CenterChild" ADD CONSTRAINT "CenterChild_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "Center"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CenterChild" ADD CONSTRAINT "CenterChild_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapistChild" ADD CONSTRAINT "TherapistChild_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapistChild" ADD CONSTRAINT "TherapistChild_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Homework" ADD CONSTRAINT "Homework_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Homework" ADD CONSTRAINT "Homework_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapyNote" ADD CONSTRAINT "TherapyNote_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapyNote" ADD CONSTRAINT "TherapyNote_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

