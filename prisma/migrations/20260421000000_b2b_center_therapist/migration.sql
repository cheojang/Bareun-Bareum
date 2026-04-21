-- B2B 언어치료센터 연계 테이블 마이그레이션
-- CreateTable: Center

CREATE TABLE "Center" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'basic',
    "inviteCode" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Center_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Therapist

CREATE TABLE "Therapist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "centerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "license" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Therapist_pkey" PRIMARY KEY ("id")
);

-- CreateTable: CenterChild

CREATE TABLE "CenterChild" (
    "centerId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CenterChild_pkey" PRIMARY KEY ("centerId","childId")
);

-- CreateTable: TherapistChild

CREATE TABLE "TherapistChild" (
    "therapistId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TherapistChild_pkey" PRIMARY KEY ("therapistId","childId")
);

-- CreateTable: Homework

CREATE TABLE "Homework" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "targetWords" TEXT NOT NULL,
    "targetPhoneme" TEXT,
    "description" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Homework_pkey" PRIMARY KEY ("id")
);

-- CreateTable: TherapyNote

CREATE TABLE "TherapyNote" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "sessionDate" TIMESTAMP(3) NOT NULL,
    "targetPhonemes" TEXT NOT NULL,
    "performance" INTEGER NOT NULL,
    "memo" TEXT NOT NULL,
    "isVisibleToParent" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TherapyNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Message

CREATE TABLE "Message" (
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

-- User.role 컬럼 추가 (없을 경우에만)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'parent';

-- Unique 제약조건
CREATE UNIQUE INDEX "Center_inviteCode_key" ON "Center"("inviteCode");
CREATE UNIQUE INDEX "Therapist_userId_key" ON "Therapist"("userId");

-- 인덱스
CREATE INDEX "Center_inviteCode_idx" ON "Center"("inviteCode");
CREATE INDEX "CenterChild_centerId_idx" ON "CenterChild"("centerId");
CREATE INDEX "TherapistChild_therapistId_idx" ON "TherapistChild"("therapistId");
CREATE INDEX "Therapist_centerId_idx" ON "Therapist"("centerId");
CREATE INDEX "Homework_childId_dueDate_idx" ON "Homework"("childId", "dueDate");
CREATE INDEX "Homework_therapistId_idx" ON "Homework"("therapistId");
CREATE INDEX "TherapyNote_childId_sessionDate_idx" ON "TherapyNote"("childId", "sessionDate");
CREATE INDEX "TherapyNote_therapistId_idx" ON "TherapyNote"("therapistId");
CREATE INDEX "Message_therapistId_parentId_sentAt_idx" ON "Message"("therapistId", "parentId", "sentAt");
CREATE INDEX "Message_parentId_idx" ON "Message"("parentId");

-- 외래키
ALTER TABLE "Therapist" ADD CONSTRAINT "Therapist_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Therapist" ADD CONSTRAINT "Therapist_centerId_fkey"
    FOREIGN KEY ("centerId") REFERENCES "Center"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CenterChild" ADD CONSTRAINT "CenterChild_centerId_fkey"
    FOREIGN KEY ("centerId") REFERENCES "Center"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CenterChild" ADD CONSTRAINT "CenterChild_childId_fkey"
    FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TherapistChild" ADD CONSTRAINT "TherapistChild_therapistId_fkey"
    FOREIGN KEY ("therapistId") REFERENCES "Therapist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TherapistChild" ADD CONSTRAINT "TherapistChild_childId_fkey"
    FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Homework" ADD CONSTRAINT "Homework_therapistId_fkey"
    FOREIGN KEY ("therapistId") REFERENCES "Therapist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Homework" ADD CONSTRAINT "Homework_childId_fkey"
    FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TherapyNote" ADD CONSTRAINT "TherapyNote_therapistId_fkey"
    FOREIGN KEY ("therapistId") REFERENCES "Therapist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TherapyNote" ADD CONSTRAINT "TherapyNote_childId_fkey"
    FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Message" ADD CONSTRAINT "Message_therapistId_fkey"
    FOREIGN KEY ("therapistId") REFERENCES "Therapist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Message" ADD CONSTRAINT "Message_parentId_fkey"
    FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
