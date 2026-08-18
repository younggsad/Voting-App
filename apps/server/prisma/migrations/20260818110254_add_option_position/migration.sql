/*
  Warnings:

  - Added the required column `position` to the `options` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "options"
ADD COLUMN "position" INTEGER;

WITH ranked_options AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "pollId"
      ORDER BY id
    ) - 1 AS position
  FROM "options"
)
UPDATE "options" AS o
SET "position" = r.position
FROM ranked_options AS r
WHERE o.id = r.id;

ALTER TABLE "options"
ALTER COLUMN "position" SET NOT NULL;

CREATE INDEX "options_pollId_position_idx"
ON "options"("pollId", "position");
