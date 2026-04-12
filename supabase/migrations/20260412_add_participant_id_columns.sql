-- Add participant_id to tables that only had group_id,
-- so we can track which participant submitted each piece of data.
-- This enables per-participant sync and plenary aggregation.

-- dive_stakeholders: add participant_id
ALTER TABLE dive_stakeholders
  ADD COLUMN IF NOT EXISTS participant_id UUID REFERENCES dive_participants(id);

-- dive_solutions: add participant_id
ALTER TABLE dive_solutions
  ADD COLUMN IF NOT EXISTS participant_id UUID REFERENCES dive_participants(id);

-- dive_plan_tasks: add participant_id
ALTER TABLE dive_plan_tasks
  ADD COLUMN IF NOT EXISTS participant_id UUID REFERENCES dive_participants(id);

-- dive_kpis: add participant_id
ALTER TABLE dive_kpis
  ADD COLUMN IF NOT EXISTS participant_id UUID REFERENCES dive_participants(id);

-- dive_assessments: add UNIQUE constraint on participant_id for upsert
-- (one assessment per participant)
ALTER TABLE dive_assessments
  ADD CONSTRAINT dive_assessments_participant_id_unique UNIQUE (participant_id);

-- Permissive RLS for service-role bypass is automatic,
-- but add anon policies so the Edge Functions (using service role) work,
-- and so the plenary-data function can read everything.
-- The service role already bypasses RLS, so no extra policies needed.
