-- Create a legacy session for existing polls
INSERT INTO "sessions" (
  "id",
  "tokenHash",
  "expiresAt",
  "createdAt",
  "updatedAt"
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'legacy-poll-owner',
  '2099-12-31 23:59:59.999',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;

-- Add the column as nullable first
ALTER TABLE "polls"
ADD COLUMN "createdBySessionId" TEXT;

-- Assign existing polls to the legacy session
UPDATE "polls"
SET "createdBySessionId" = '00000000-0000-0000-0000-000000000001'
WHERE "createdBySessionId" IS NULL;

-- Make ownership required
ALTER TABLE "polls"
ALTER COLUMN "createdBySessionId" SET NOT NULL;

-- Create index
CREATE INDEX "polls_createdBySessionId_idx"
ON "polls"("createdBySessionId");

-- Add foreign key
ALTER TABLE "polls"
ADD CONSTRAINT "polls_createdBySessionId_fkey"
FOREIGN KEY ("createdBySessionId")
REFERENCES "sessions"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;