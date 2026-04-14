-- Add pain_points (top 3 from morning session) to groups
-- Stored as jsonb array: [{id, text, pestel_category?, barrier_type?}]
ALTER TABLE dive_groups
  ADD COLUMN IF NOT EXISTS pain_points jsonb DEFAULT '[]'::jsonb;

-- Add linked_pain_point_ids to stakeholders
-- Stored as jsonb array of pain point UUIDs
ALTER TABLE dive_stakeholders
  ADD COLUMN IF NOT EXISTS linked_pain_point_ids jsonb DEFAULT '[]'::jsonb;
