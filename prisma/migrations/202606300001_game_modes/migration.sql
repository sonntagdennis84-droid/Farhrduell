ALTER TABLE "GameSession" ADD COLUMN "gameMode" TEXT NOT NULL DEFAULT 'classic';

ALTER TABLE "Participant"
  ADD COLUMN "livesRemaining" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "isEliminated" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "eliminatedAtQuestionIndex" INTEGER;
