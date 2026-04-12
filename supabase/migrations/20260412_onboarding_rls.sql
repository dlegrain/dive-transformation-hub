-- Onboarding: permissive RLS policies for anonymous access (workshop tool)
-- Since we skip Supabase Auth, the anon key needs direct access to participant-facing tables.

-- Sessions: anyone can read active sessions
CREATE POLICY "anon_read_sessions" ON dive_sessions
  FOR SELECT USING (is_active = true);

-- Groups: anonymous insert + read (participants create their group on registration)
CREATE POLICY "anon_manage_groups" ON dive_groups
  FOR ALL USING (true) WITH CHECK (true);

-- Participants: anonymous insert + read (registration + login by email)
CREATE POLICY "anon_manage_participants" ON dive_participants
  FOR ALL USING (true) WITH CHECK (true);
