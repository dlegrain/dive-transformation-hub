-- Add group-level AI Policy charter storage to dive_groups
-- The charter is shared by the whole group (one per group, written by the validator)

ALTER TABLE dive_groups
  ADD COLUMN IF NOT EXISTS m3_policy_draft TEXT,
  ADD COLUMN IF NOT EXISTS m3_policy_answers JSONB;
