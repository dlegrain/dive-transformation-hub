-- DIVE Transformation Hub — Database Schema
-- Prefixed with dive_ to avoid conflicts with existing tables

-- Seminar sessions
CREATE TABLE IF NOT EXISTS dive_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Groups within a session
CREATE TABLE IF NOT EXISTS dive_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES dive_sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  institution_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Participants
CREATE TABLE IF NOT EXISTS dive_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES dive_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT,
  auth_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Module 1: Maturity Assessment (0 = "I don't know", 1-3 = maturity level)
CREATE TABLE IF NOT EXISTS dive_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES dive_groups(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES dive_participants(id),

  socio_cultural_tools INT CHECK (socio_cultural_tools BETWEEN 0 AND 3),
  socio_cultural_data INT CHECK (socio_cultural_data BETWEEN 0 AND 3),
  socio_cultural_culture INT CHECK (socio_cultural_culture BETWEEN 0 AND 3),

  teaching_tools INT CHECK (teaching_tools BETWEEN 0 AND 3),
  teaching_data INT CHECK (teaching_data BETWEEN 0 AND 3),
  teaching_culture INT CHECK (teaching_culture BETWEEN 0 AND 3),

  academic_mgmt_tools INT CHECK (academic_mgmt_tools BETWEEN 0 AND 3),
  academic_mgmt_data INT CHECK (academic_mgmt_data BETWEEN 0 AND 3),
  academic_mgmt_culture INT CHECK (academic_mgmt_culture BETWEEN 0 AND 3),

  admin_mgmt_tools INT CHECK (admin_mgmt_tools BETWEEN 0 AND 3),
  admin_mgmt_data INT CHECK (admin_mgmt_data BETWEEN 0 AND 3),
  admin_mgmt_culture INT CHECK (admin_mgmt_culture BETWEEN 0 AND 3),

  research_tools INT CHECK (research_tools BETWEEN 0 AND 3),
  research_data INT CHECK (research_data BETWEEN 0 AND 3),
  research_culture INT CHECK (research_culture BETWEEN 0 AND 3),

  governance_tools INT CHECK (governance_tools BETWEEN 0 AND 3),
  governance_data INT CHECK (governance_data BETWEEN 0 AND 3),
  governance_culture INT CHECK (governance_culture BETWEEN 0 AND 3),

  image_tools INT CHECK (image_tools BETWEEN 0 AND 3),
  image_data INT CHECK (image_data BETWEEN 0 AND 3),
  image_culture INT CHECK (image_culture BETWEEN 0 AND 3),

  extension_tools INT CHECK (extension_tools BETWEEN 0 AND 3),
  extension_data INT CHECK (extension_data BETWEEN 0 AND 3),
  extension_culture INT CHECK (extension_culture BETWEEN 0 AND 3),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Module 2: Stakeholders + Triple Diagnostic
CREATE TABLE IF NOT EXISTS dive_stakeholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES dive_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  discipline TEXT,
  behavior TEXT NOT NULL,  -- supportive | pronounced_refusal | pronounced_opposing | subtle_undermining | subtle_avoiding
  anxiety TEXT NOT NULL,   -- learning | sociotechnical | displacement | ethical_engagement
  missing_lever TEXT NOT NULL, -- relative_advantage | compatibility | low_complexity
  notes TEXT,
  generated_counter_measure TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Module 2: Self-debrief
CREATE TABLE IF NOT EXISTS dive_self_debriefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES dive_participants(id) ON DELETE CASCADE,
  anxiety_experienced TEXT,
  surprise TEXT,
  would_use_again TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Module 3: Solution Cards
CREATE TABLE IF NOT EXISTS dive_solutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES dive_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  status TEXT DEFAULT 'Planned',
  problem_solved TEXT,
  vibe_coding_notes TEXT,
  platform_used TEXT,
  assigned_phase INT CHECK (assigned_phase BETWEEN 1 AND 3),
  linked_quick_win TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Module 4: Plan Tasks
CREATE TABLE IF NOT EXISTS dive_plan_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES dive_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phase INT NOT NULL CHECK (phase BETWEEN 1 AND 3),
  champion_name TEXT,
  champion_target TEXT,
  priority TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'Not Started',
  source_solution_id UUID REFERENCES dive_solutions(id),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Module 4: KPIs
CREATE TABLE IF NOT EXISTS dive_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES dive_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  target TEXT,
  data_source TEXT,
  responsible TEXT,
  phase INT CHECK (phase BETWEEN 1 AND 3),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI Advisor: conversation history
CREATE TABLE IF NOT EXISTS dive_ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES dive_groups(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES dive_participants(id),
  module TEXT,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE dive_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dive_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE dive_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE dive_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE dive_stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE dive_self_debriefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dive_solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dive_plan_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE dive_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE dive_ai_conversations ENABLE ROW LEVEL SECURITY;

-- Participants can manage their group's data
CREATE POLICY "group_member_all" ON dive_assessments FOR ALL USING (
  group_id IN (SELECT group_id FROM dive_participants WHERE auth_user_id = auth.uid())
);
CREATE POLICY "group_member_all" ON dive_stakeholders FOR ALL USING (
  group_id IN (SELECT group_id FROM dive_participants WHERE auth_user_id = auth.uid())
);
CREATE POLICY "group_member_all" ON dive_solutions FOR ALL USING (
  group_id IN (SELECT group_id FROM dive_participants WHERE auth_user_id = auth.uid())
);
CREATE POLICY "group_member_all" ON dive_plan_tasks FOR ALL USING (
  group_id IN (SELECT group_id FROM dive_participants WHERE auth_user_id = auth.uid())
);
CREATE POLICY "group_member_all" ON dive_kpis FOR ALL USING (
  group_id IN (SELECT group_id FROM dive_participants WHERE auth_user_id = auth.uid())
);
CREATE POLICY "group_member_all" ON dive_ai_conversations FOR ALL USING (
  group_id IN (SELECT group_id FROM dive_participants WHERE auth_user_id = auth.uid())
);

-- Participants can read their own session/group/participant records
CREATE POLICY "read_own_session" ON dive_sessions FOR SELECT USING (true);
CREATE POLICY "read_own_group" ON dive_groups FOR SELECT USING (
  id IN (SELECT group_id FROM dive_participants WHERE auth_user_id = auth.uid())
);
CREATE POLICY "read_own_participant" ON dive_participants FOR SELECT USING (
  auth_user_id = auth.uid()
);
CREATE POLICY "own_debrief" ON dive_self_debriefs FOR ALL USING (
  participant_id IN (SELECT id FROM dive_participants WHERE auth_user_id = auth.uid())
);

-- Facilitator can read everything (role = 'facilitator')
CREATE POLICY "facilitator_read_all" ON dive_groups FOR SELECT USING (
  auth.uid() IN (SELECT auth_user_id FROM dive_participants WHERE role = 'facilitator')
);
CREATE POLICY "facilitator_read_all" ON dive_assessments FOR SELECT USING (
  auth.uid() IN (SELECT auth_user_id FROM dive_participants WHERE role = 'facilitator')
);
CREATE POLICY "facilitator_read_all" ON dive_stakeholders FOR SELECT USING (
  auth.uid() IN (SELECT auth_user_id FROM dive_participants WHERE role = 'facilitator')
);
CREATE POLICY "facilitator_read_all" ON dive_solutions FOR SELECT USING (
  auth.uid() IN (SELECT auth_user_id FROM dive_participants WHERE role = 'facilitator')
);
CREATE POLICY "facilitator_read_all" ON dive_plan_tasks FOR SELECT USING (
  auth.uid() IN (SELECT auth_user_id FROM dive_participants WHERE role = 'facilitator')
);
CREATE POLICY "facilitator_read_all" ON dive_kpis FOR SELECT USING (
  auth.uid() IN (SELECT auth_user_id FROM dive_participants WHERE role = 'facilitator')
);
CREATE POLICY "facilitator_read_all" ON dive_ai_conversations FOR SELECT USING (
  auth.uid() IN (SELECT auth_user_id FROM dive_participants WHERE role = 'facilitator')
);

-- Service role bypasses RLS automatically (used by Edge Functions)

-- ============================================================
-- Enable Realtime for key tables
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE dive_assessments;
ALTER PUBLICATION supabase_realtime ADD TABLE dive_stakeholders;
ALTER PUBLICATION supabase_realtime ADD TABLE dive_solutions;
ALTER PUBLICATION supabase_realtime ADD TABLE dive_plan_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE dive_kpis;
