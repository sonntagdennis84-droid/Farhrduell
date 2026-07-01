ALTER TABLE "GameSession" ADD COLUMN IF NOT EXISTS "showParticipantAnswerStats" BOOLEAN NOT NULL DEFAULT false;
