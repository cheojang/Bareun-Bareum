-- CreateIndex
CREATE INDEX "PracticeSession_userId_childId_idx" ON "PracticeSession"("userId", "childId");

-- CreateIndex
CREATE INDEX "PracticeSession_childId_startedAt_idx" ON "PracticeSession"("childId", "startedAt");
