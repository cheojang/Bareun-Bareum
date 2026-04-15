-- ======================================================
-- 공지사항 / 알림 시스템 마이그레이션
-- ======================================================

-- CreateTable Announcement
CREATE TABLE IF NOT EXISTS "Announcement" (
    "id"          TEXT        NOT NULL,
    "title"       TEXT        NOT NULL,
    "content"     TEXT        NOT NULL,
    "type"        TEXT        NOT NULL DEFAULT 'notice',
    "isPublished" BOOLEAN     NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable AnnouncementRead
CREATE TABLE IF NOT EXISTS "AnnouncementRead" (
    "id"             TEXT        NOT NULL,
    "announcementId" TEXT        NOT NULL,
    "userId"         TEXT        NOT NULL,
    "readAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnnouncementRead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Announcement_isPublished_createdAt_idx"
    ON "Announcement"("isPublished", "createdAt");

CREATE UNIQUE INDEX IF NOT EXISTS "AnnouncementRead_announcementId_userId_key"
    ON "AnnouncementRead"("announcementId", "userId");

CREATE INDEX IF NOT EXISTS "AnnouncementRead_userId_idx"
    ON "AnnouncementRead"("userId");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "AnnouncementRead"
    ADD CONSTRAINT "AnnouncementRead_announcementId_fkey"
    FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
