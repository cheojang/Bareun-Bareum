-- ======================================================
-- 음소 패턴 템플릿 테이블 마이그레이션
-- ======================================================

CREATE TABLE IF NOT EXISTS "PhonemeTemplate" (
    "id"               TEXT        NOT NULL,
    "phoneme"          TEXT        NOT NULL,
    "position"         TEXT        NOT NULL,
    "errorType"        TEXT        NOT NULL,
    "errorCategory"    TEXT        NOT NULL,
    "exampleTarget"    TEXT        NOT NULL,
    "exampleChild"     TEXT        NOT NULL,
    "parentHint"       TEXT        NOT NULL,
    "rootCause"        TEXT        NOT NULL,
    "trainingStep1"    TEXT        NOT NULL,
    "trainingStep2"    TEXT        NOT NULL,
    "trainingStep3"    TEXT        NOT NULL,
    "trainingStep4"    TEXT        NOT NULL,
    "recommendedWords" TEXT        NOT NULL,
    "generatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhonemeTemplate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PhonemeTemplate_phoneme_position_errorType_key"
    ON "PhonemeTemplate"("phoneme", "position", "errorType");

CREATE INDEX IF NOT EXISTS "PhonemeTemplate_phoneme_errorType_idx"
    ON "PhonemeTemplate"("phoneme", "errorType");
