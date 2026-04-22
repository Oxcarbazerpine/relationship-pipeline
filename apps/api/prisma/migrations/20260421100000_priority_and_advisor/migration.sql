-- Priority score/advice and advisor-kind tracking.
CREATE TYPE "PriorityAdvice" AS ENUM ('HIGH', 'MEDIUM', 'LOW', 'UNKNOWN');
CREATE TYPE "AdvisorKind" AS ENUM ('RULES', 'AI');

ALTER TABLE "Connection"
  ADD COLUMN "notes"          TEXT,
  ADD COLUMN "priorityScore"  INTEGER          NOT NULL DEFAULT 0,
  ADD COLUMN "priorityAdvice" "PriorityAdvice" NOT NULL DEFAULT 'UNKNOWN',
  ADD COLUMN "advisor"        "AdvisorKind"    NOT NULL DEFAULT 'RULES',
  ADD COLUMN "advisorReason"  TEXT;

-- Backfill priorityScore per Airtable formula:
--   emotion: POSITIVE=+2, VOLATILE=+1, DRAINING=-1, NEUTRAL=0
--   investment: OTHER_MORE=+2, BALANCED=+1, SELF_MORE=-1
UPDATE "Connection" SET "priorityScore" =
  CASE "emotionQuality"
    WHEN 'POSITIVE' THEN 2
    WHEN 'VOLATILE' THEN 1
    WHEN 'DRAINING' THEN -1
    ELSE 0
  END
  +
  CASE "investmentBalance"
    WHEN 'OTHER_MORE' THEN 2
    WHEN 'BALANCED'   THEN 1
    WHEN 'SELF_MORE'  THEN -1
    ELSE 0
  END;

UPDATE "Connection" SET "priorityAdvice" =
  CASE
    WHEN "priorityScore" >= 3 THEN 'HIGH'::"PriorityAdvice"
    WHEN "priorityScore" >= 0 THEN 'MEDIUM'::"PriorityAdvice"
    ELSE 'LOW'::"PriorityAdvice"
  END;
