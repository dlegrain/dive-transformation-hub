# DIVE Transformation Hub

A workshop app used during a 4-day seminar on AI adoption strategy for Vietnamese university leaders. Participants use it in afternoon sessions to build their own institutional AI adoption plan, guided by a facilitator and an AI advisor.

Built with **React 19 + TypeScript + Vite + Tailwind CSS**, backed by **Supabase** (PostgreSQL, Realtime, Edge Functions) and **Claude AI** (via Supabase Edge Functions).

> This is a **facilitated workshop tool**, not a standalone product. It assumes a seminar context with a facilitator guiding the sessions.

---

## What it does

The app has 4 modules, one per seminar day:

| Module | Purpose |
|--------|---------|
| **1. Maturity Diagnostic** | Rate your institution across 8 dimensions (teaching, governance, research...) on a 0-3 scale. Produces an interactive radar chart. |
| **2. Resistance Mapping** | Map stakeholders, diagnose their resistance behavior, AI anxiety type, and missing adoption lever. AI generates counter-measures. |
| **3. Solutions Arsenal** | Build solution cards (quick wins), prototype with vibe coding, optionally generate an institutional AI policy charter. |
| **4. 90-Day Plan** | Kanban board with 3 phases (Activation / Implementation / Institutionalization), champions, KPIs, and PDF export. |

Cross-module intelligence ties everything together: Module 1 weaknesses inform Module 4 priorities, Module 2 resistances trigger alerts in Module 4, and the AI Advisor reads all modules simultaneously.

Additional features:
- **AI Advisor** - contextual side panel powered by Claude, cites 8 research articles
- **Plenary Dashboard** - compare all groups live (Supabase Realtime)
- **PDF Export** - executive report combining all 4 modules
- **AI Survey** - anonymous pre-seminar survey on AI usage

---

## Quick start

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [Anthropic API key](https://console.anthropic.com) (for the AI Advisor)

### 1. Clone and install

```bash
git clone https://github.com/dlegrain/dive-transformation-hub.git
cd dive-transformation-hub
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The `ANTHROPIC_API_KEY` is **not** in the frontend `.env` — it lives server-side in Supabase Edge Functions (see below).

### 3. Run locally

```bash
npm run dev
```

The app runs on `http://localhost:5173`.

---

## Connecting to Supabase (backend)

### Database schema

Run the migrations in order from `supabase/migrations/`:

```bash
supabase db push
```

Or apply them manually in the Supabase SQL Editor. The migrations create all `dive_*` tables:

| Table | Purpose |
|-------|---------|
| `dive_sessions` | Seminar instance |
| `dive_groups` | Teams per institution |
| `dive_participants` | Individual members |
| `dive_assessments` | Module 1 maturity scores |
| `dive_stakeholders` | Module 2 stakeholder mapping |
| `dive_solutions` | Module 3 solution cards |
| `dive_plan_tasks` | Module 4 kanban tasks |
| `dive_kpis` | Module 4 success metrics |
| `dive_ai_conversations` | AI chat history |
| `dive_pain_points` | Module 2 institutional barriers |
| `dive_group_consensus` | Consensus tracking |
| `dive_validators` | Consensus validator roles |

### Edge Functions

Deploy the 4 Edge Functions:

```bash
supabase functions deploy ai-advisor
supabase functions deploy sync-data
supabase functions deploy group-data
supabase functions deploy plenary-data
```

| Function | Role |
|----------|------|
| `ai-advisor` | Calls Claude API, streams responses, logs to Langfuse (optional) |
| `sync-data` | Syncs participant data to group-level aggregates |
| `group-data` | Fetches group assessment data for comparisons |
| `plenary-data` | Returns all groups for the plenary dashboard |

### Authentication

The app uses a simple email-based auth (no magic link, no password). Participants register with name + institution + email, and log back in with just their email. Session is stored in localStorage + Supabase database.

---

## Connecting an LLM (AI Advisor)

The AI Advisor uses **Claude** via the `ai-advisor` Supabase Edge Function.

### Set the API key

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

The Edge Function (`supabase/functions/ai-advisor/index.ts`) calls the Claude API directly. The model is configured in that file (currently `claude-sonnet-4-6`).

### How the AI context works

The system prompt is built dynamically in `src/lib/ai-advisor.ts`. It injects:

1. **All group data** from the 4 modules (dimensions, stakeholders, solutions, tasks, KPIs)
2. **8 research articles** as embedded context (Bravo-Jaico, Cao, Deacon, Singh & Strzelecki, etc.)
3. **Proactive alerts** — 15+ checks that detect issues (weak dimensions, champion conflicts, missing KPIs)

The AI is instructed to cite sources as `(Author et al., Year)` and give actionable, group-specific advice.

### Using a different LLM

To swap Claude for another model:

1. Edit `supabase/functions/ai-advisor/index.ts` — replace the Anthropic API call with your provider's API
2. The system prompt in `src/lib/ai-advisor.ts` is model-agnostic (plain text), so it works with any LLM
3. Keep the streaming response format (the frontend expects SSE-style chunks)

### Local development (without Edge Functions)

A dev proxy is included for local AI testing:

```bash
# Add ANTHROPIC_API_KEY to your .env file, then:
node dev-proxy.mjs
```

This starts a local proxy on port 3001 that mimics the Edge Function. The app automatically uses it in dev mode.

### Observability (optional)

The Edge Function supports [Langfuse](https://langfuse.com) tracing. Set these secrets in Supabase:

```bash
supabase secrets set LANGFUSE_PUBLIC_KEY=pk-...
supabase secrets set LANGFUSE_SECRET_KEY=sk-...
supabase secrets set LANGFUSE_HOST=https://cloud.langfuse.com
```

---

## Deployment

### Frontend (Netlify)

The app is a Vite SPA. `public/_redirects` handles SPA routing for Netlify.

```bash
npm run build
```

Deploy the `dist/` folder to Netlify (or any static host). Set the environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in the hosting dashboard.

### Backend (Supabase)

Supabase is fully hosted. Just deploy the Edge Functions and run the migrations as described above.

---

## Project structure

```
src/
  components/
    modules/          # Module 1-4 (one folder each)
    layout/           # AppLayout, Sidebar, ProgressBar
    ai-advisor/       # AI chat panel
    plenary/          # Plenary dashboard (cross-group comparison)
    export/           # PDF export
    docs/             # In-app resources (papers, tutorials, code links)
    onboarding/       # Welcome + AI survey
  lib/
    ai-advisor.ts     # AI system prompt builder + alert detection
    auth-context.tsx  # Auth state management
    store.tsx         # Global app state (React Context)
    constants.ts      # Dimensions, behaviors, anxieties, institutions
    supabase.ts       # Supabase client
    participant.ts    # Registration / login logic
    use-*.ts          # Custom hooks (consensus, sync, group data)
  types/index.ts      # TypeScript interfaces
supabase/
  migrations/         # 7 SQL migration files
  functions/          # 4 Edge Functions (Deno runtime)
specs/                # Detailed specifications per module
refs/                 # Research articles (PDFs)
```

---

## Scientific foundations

The app's logic is grounded in 8 peer-reviewed articles. Key frameworks:

- **MTM 8-dimension model** (Bravo-Jaico et al., 2025) — maturity assessment
- **3 AI anxieties** (Cao et al., 2026) — learning, sociotechnical, displacement
- **4 resistance behaviors** (Deacon et al., 2025) — pronounced/subtle, refusal/opposing
- **3 diffusion levers** (Singh & Strzelecki, 2025) — relative advantage, social influence, facilitating conditions
- **3-layer deployment model** (Nguyen & Hong, 2025) — activation, implementation, institutionalization

See `specs/references.md` for the full bibliography.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript compile + production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## License

This project was built for the DIVE seminar (Ho Chi Minh City, April 2026). Feel free to fork it and adapt it for your own workshops.
