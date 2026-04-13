-- Validator tracking: one validator per module per group
CREATE TABLE IF NOT EXISTS dive_validators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES dive_groups(id) ON DELETE CASCADE,
  module TEXT NOT NULL,  -- 'module2', 'module3', 'module4'
  participant_id UUID NOT NULL REFERENCES dive_participants(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, module)
);

-- M2 consensus stakeholders: shared list validated by the group
-- Same shape as dive_stakeholders but with is_consensus flag
ALTER TABLE dive_stakeholders ADD COLUMN IF NOT EXISTS is_consensus BOOLEAN DEFAULT false;

-- Consensus status for M2 on groups
ALTER TABLE dive_groups ADD COLUMN IF NOT EXISTS m2_consensus_status TEXT DEFAULT 'none';
ALTER TABLE dive_groups ADD COLUMN IF NOT EXISTS m2_consensus_validated_at TIMESTAMPTZ;
ALTER TABLE dive_groups ADD COLUMN IF NOT EXISTS m2_consensus_validated_by UUID;
ALTER TABLE dive_groups ADD COLUMN IF NOT EXISTS m2_reopen_requested_by UUID;
ALTER TABLE dive_groups ADD COLUMN IF NOT EXISTS m2_reopen_requested_at TIMESTAMPTZ;

-- Power and interest columns (were client-only, now needed for consensus sync)
ALTER TABLE dive_stakeholders ADD COLUMN IF NOT EXISTS power TEXT;
ALTER TABLE dive_stakeholders ADD COLUMN IF NOT EXISTS interest TEXT;

-- Enable RLS on validators
ALTER TABLE dive_validators ENABLE ROW LEVEL SECURITY;

-- Enable realtime for validators
ALTER PUBLICATION supabase_realtime ADD TABLE dive_validators;
