# Architecture

## Overview

```
┌─────────────┐     ┌──────────────────────┐     ┌───────────┐
│  React SPA  │────▶│      Supabase        │     │ Claude AI │
│  (Netlify)  │     │  - PostgreSQL (data)  │     │    API    │
│             │     │  - Auth (magic link)  │     │           │
│             │     │  - Realtime (sync)    │     │           │
│             │────▶│  - Edge Functions ────│────▶│           │
└─────────────┘     └──────────────────────┘     └───────────┘
```

- **Frontend**: React SPA deployed on Netlify
- **Backend**: Supabase (no custom server needed)
- **AI proxy**: Supabase Edge Functions (Deno) — keeps Claude API key server-side
- **Realtime**: Supabase Realtime subscriptions for live group features (radar overlay, plenary view)

## Supabase Database Schema

### Core tables

```sql
-- Seminar session (one per seminar instance)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,              -- e.g., "DIVE Vietnam April 2026"
  created_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Groups within a session
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,              -- e.g., "Saigon University Team"
  institution_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Participants
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT,                       -- their role at their institution
  auth_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Module 1: Maturity Assessment
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id),
  
  -- 8 dimensions × 3 sub-criteria = 24 scores
  socio_cultural_tools INT CHECK (socio_cultural_tools BETWEEN 1 AND 3),
  socio_cultural_data INT CHECK (socio_cultural_data BETWEEN 1 AND 3),
  socio_cultural_culture INT CHECK (socio_cultural_culture BETWEEN 1 AND 3),
  
  teaching_tools INT CHECK (teaching_tools BETWEEN 1 AND 3),
  teaching_data INT CHECK (teaching_data BETWEEN 1 AND 3),
  teaching_culture INT CHECK (teaching_culture BETWEEN 1 AND 3),
  
  academic_mgmt_tools INT CHECK (academic_mgmt_tools BETWEEN 1 AND 3),
  academic_mgmt_data INT CHECK (academic_mgmt_data BETWEEN 1 AND 3),
  academic_mgmt_culture INT CHECK (academic_mgmt_culture BETWEEN 1 AND 3),
  
  admin_mgmt_tools INT CHECK (admin_mgmt_tools BETWEEN 1 AND 3),
  admin_mgmt_data INT CHECK (admin_mgmt_data BETWEEN 1 AND 3),
  admin_mgmt_culture INT CHECK (admin_mgmt_culture BETWEEN 1 AND 3),
  
  research_tools INT CHECK (research_tools BETWEEN 1 AND 3),
  research_data INT CHECK (research_data BETWEEN 1 AND 3),
  research_culture INT CHECK (research_culture BETWEEN 1 AND 3),
  
  governance_tools INT CHECK (governance_tools BETWEEN 1 AND 3),
  governance_data INT CHECK (governance_data BETWEEN 1 AND 3),
  governance_culture INT CHECK (governance_culture BETWEEN 1 AND 3),
  
  image_tools INT CHECK (image_tools BETWEEN 1 AND 3),
  image_data INT CHECK (image_data BETWEEN 1 AND 3),
  image_culture INT CHECK (image_culture BETWEEN 1 AND 3),
  
  extension_tools INT CHECK (extension_tools BETWEEN 1 AND 3),
  extension_data INT CHECK (extension_data BETWEEN 1 AND 3),
  extension_culture INT CHECK (extension_culture BETWEEN 1 AND 3),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Module 2: Stakeholders + Triple Diagnostic
CREATE TABLE stakeholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,               -- Students | Professors | Administration | Direction
  discipline TEXT,                  -- STEM | Humanities | Social Sciences | Other
  
  -- Triple diagnostic
  behavior TEXT NOT NULL,           -- pronounced_refusal | pronounced_opposing | subtle_undermining | subtle_avoiding
  anxiety TEXT NOT NULL,            -- learning | sociotechnical | displacement | ethical_engagement
  missing_lever TEXT NOT NULL,      -- relative_advantage | compatibility | low_complexity
  
  notes TEXT,
  generated_counter_measure TEXT,   -- AI-generated or rule-based
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Module 2: Self-debrief (after NotebookLM/Gemini exercise)
CREATE TABLE self_debriefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  anxiety_experienced TEXT,         -- learning | sociotechnical | displacement | none
  surprise TEXT,
  would_use_again TEXT,             -- yes | maybe | no
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Module 3: Solution Cards
CREATE TABLE solutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target TEXT NOT NULL,             -- Students | Professors | Administration
  difficulty TEXT NOT NULL,         -- Low | Medium | High
  status TEXT DEFAULT 'Planned',    -- Planned | Prototyped | Tested
  problem_solved TEXT,
  vibe_coding_notes TEXT,
  platform_used TEXT,
  assigned_phase INT CHECK (assigned_phase BETWEEN 1 AND 3),
  linked_quick_win TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Module 4: Plan Tasks
CREATE TABLE plan_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phase INT NOT NULL CHECK (phase BETWEEN 1 AND 3),
  champion_name TEXT,
  champion_target TEXT,             -- Students | Professors | Administration
  priority TEXT DEFAULT 'Medium',   -- Low | Medium | High
  status TEXT DEFAULT 'Not Started', -- Not Started | In Progress | Done
  source_solution_id UUID REFERENCES solutions(id),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Module 4: KPIs
CREATE TABLE kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,               -- Leading | Lagging
  target TEXT,
  data_source TEXT,
  responsible TEXT,
  phase INT CHECK (phase BETWEEN 1 AND 3),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI Advisor: conversation history
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id),
  module TEXT,                      -- module_1 | module_2 | module_3 | module_4 | general
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Row Level Security (RLS)

- Participants can only read/write data for their own group
- Facilitator (Diederick) has read access to all groups (for plenary projection)
- Session-scoped: data is isolated per seminar instance

```sql
-- Example RLS policy
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can manage their group's assessments"
  ON assessments FOR ALL
  USING (
    group_id IN (
      SELECT group_id FROM participants
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Facilitator can read all assessments"
  ON assessments FOR SELECT
  USING (
    auth.uid() IN (
      SELECT auth_user_id FROM participants
      WHERE role = 'facilitator'
    )
  );
```

## Authentication

**Magic Link** via Supabase Auth — simplest for a seminar context:
1. Facilitator creates a session and groups before the seminar
2. Participants receive an email with a magic link (or a shared session code)
3. On first login, they join their group
4. No password to remember

Alternative: **Anonymous auth** with a session code — even simpler but less traceable.

## Supabase Edge Functions

### `ai-advisor` function

Proxies requests to the Claude API. Keeps the API key server-side.

```typescript
// supabase/functions/ai-advisor/index.ts
// - Receives: participant's module data + question
// - Builds a system prompt with research articles context
// - Calls Claude API
// - Returns the response
// - Stores conversation in ai_conversations table
```

See `specs/ai-advisor.md` for the full system prompt and behavior specs.

## Realtime Features

Supabase Realtime subscriptions enable:

1. **Radar overlay (Module 1 plenary)**: Subscribe to `assessments` table — when any participant saves, all radars update on the facilitator's projected screen
2. **Group sync**: Multiple participants in the same group see each other's edits in real-time (stakeholders, solution cards, plan tasks)
3. **Facilitator dashboard**: Real-time view of all groups' progress across modules

## Netlify Deployment

- `netlify.toml` with build command `npm run build` and publish directory `dist`
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- No Netlify Functions needed — Supabase Edge Functions handle server-side logic
- Deploy via Git push (auto-deploy on main branch)

## Environment Variables

### Frontend (.env)
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Supabase Edge Functions (Supabase dashboard)
```
ANTHROPIC_API_KEY=sk-ant-...
```
