ALTER TABLE "GameSession" ADD COLUMN "hostUserId" TEXT;

ALTER TABLE "GameSession"
  ADD CONSTRAINT "GameSession_hostUserId_fkey"
  FOREIGN KEY ("hostUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "GameSession_hostUserId_idx" ON "GameSession"("hostUserId");
