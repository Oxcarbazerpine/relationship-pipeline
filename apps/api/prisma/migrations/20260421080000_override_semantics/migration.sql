-- Split nextAction/decisionReason into engine-suggestion + user-override pairs.
ALTER TABLE "Connection"
  ADD COLUMN "suggestedAction" "NextAction",
  ADD COLUMN "suggestedReason" TEXT,
  ADD COLUMN "overrideAction" "NextAction",
  ADD COLUMN "overrideReason" TEXT;

-- Backfill: treat existing nextAction/decisionReason as the engine suggestion.
UPDATE "Connection"
SET
  "suggestedAction" = "nextAction",
  "suggestedReason" = COALESCE("decisionReason", 'MAINTAIN');

ALTER TABLE "Connection"
  ALTER COLUMN "suggestedAction" SET NOT NULL,
  ALTER COLUMN "suggestedReason" SET NOT NULL;

ALTER TABLE "Connection"
  DROP COLUMN "nextAction",
  DROP COLUMN "decisionReason";
