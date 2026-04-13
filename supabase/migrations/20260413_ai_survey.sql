-- AI Usage Survey — collected at registration, anonymous results shown in plenary
CREATE TABLE IF NOT EXISTS dive_ai_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES dive_participants(id) ON DELETE CASCADE,
  session_id UUID REFERENCES dive_sessions(id) ON DELETE CASCADE,

  -- How many AI models do you use?
  models_count INT CHECK (models_count BETWEEN 0 AND 20),

  -- Which models? (array of strings)
  models_used TEXT[] DEFAULT '{}',

  -- What types of tasks? (array of strings)
  task_types TEXT[] DEFAULT '{}',

  -- How often do you use AI?
  frequency TEXT CHECK (frequency IN ('never', 'monthly', 'weekly', 'daily', 'multiple_daily')),

  -- Paid vs free
  paid_vs_free TEXT CHECK (paid_vs_free IN ('free_only', 'mostly_free', 'mix', 'mostly_paid', 'paid_only')),

  -- Vibe coding experience
  vibe_coding TEXT CHECK (vibe_coding IN ('yes', 'heard', 'no')),

  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE dive_ai_surveys ENABLE ROW LEVEL SECURITY;

-- Anyone can insert their own survey
CREATE POLICY "Participants can insert own survey"
  ON dive_ai_surveys FOR INSERT
  WITH CHECK (true);

-- Anyone can read (for plenary aggregation)
CREATE POLICY "Anyone can read surveys"
  ON dive_ai_surveys FOR SELECT
  USING (true);
