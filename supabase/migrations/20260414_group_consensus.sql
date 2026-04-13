-- ============================================================
-- Group Consensus for Module 1
-- ============================================================

-- 1. Add consensus flag + custom data to assessments
ALTER TABLE dive_assessments ADD COLUMN IF NOT EXISTS is_consensus BOOLEAN DEFAULT false;
ALTER TABLE dive_assessments ADD COLUMN IF NOT EXISTS custom_data JSONB;

-- One consensus row per group max
CREATE UNIQUE INDEX IF NOT EXISTS dive_assessments_group_consensus_unique
  ON dive_assessments (group_id) WHERE is_consensus = true;

-- 2. Consensus lifecycle columns on groups
ALTER TABLE dive_groups ADD COLUMN IF NOT EXISTS consensus_status TEXT DEFAULT 'none';
ALTER TABLE dive_groups ADD COLUMN IF NOT EXISTS consensus_validated_at TIMESTAMPTZ;
ALTER TABLE dive_groups ADD COLUMN IF NOT EXISTS consensus_validated_by UUID;
ALTER TABLE dive_groups ADD COLUMN IF NOT EXISTS reopen_requested_by UUID;
ALTER TABLE dive_groups ADD COLUMN IF NOT EXISTS reopen_requested_at TIMESTAMPTZ;

-- 3. Enable realtime on groups for status polling
ALTER PUBLICATION supabase_realtime ADD TABLE dive_groups;
