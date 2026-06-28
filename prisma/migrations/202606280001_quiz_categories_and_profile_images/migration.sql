ALTER TABLE "User" ADD COLUMN "profileImageUrl" TEXT;

CREATE TABLE "QuizCategory" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "QuizCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "QuizCategory_name_key" ON "QuizCategory"("name");

ALTER TABLE "Quiz" ADD COLUMN "categoryId" TEXT;

ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "QuizCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "QuizCategory" ("id", "name")
VALUES
  ('category-fahrschule', 'Fahrschule'),
  ('category-privat', 'Privat')
ON CONFLICT ("name") DO NOTHING;

UPDATE "Quiz"
SET "categoryId" = (
  SELECT "id" FROM "QuizCategory" WHERE "name" = 'Fahrschule' LIMIT 1
)
WHERE "categoryId" IS NULL;
