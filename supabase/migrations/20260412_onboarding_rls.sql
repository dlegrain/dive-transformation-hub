-- Onboarding: permissive RLS policies for anonymous access (workshop tool)
-- Since we skip Supabase Auth, the anon key needs direct access to participant-facing tables.

-- Sessions: anyone can read active sessions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'anon_read_sessions' AND tablename = 'dive_sessions') THEN
    CREATE POLICY "anon_read_sessions" ON dive_sessions FOR SELECT USING (is_active = true);
  END IF;
END $$;

-- Groups: anonymous insert + read (participants create their group on registration)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'anon_manage_groups' AND tablename = 'dive_groups') THEN
    CREATE POLICY "anon_manage_groups" ON dive_groups FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Participants: anonymous insert + read (registration + login by email)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'anon_manage_participants' AND tablename = 'dive_participants') THEN
    CREATE POLICY "anon_manage_participants" ON dive_participants FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
