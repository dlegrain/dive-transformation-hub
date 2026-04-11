# DIVE Transformation Hub

## What this is

A Single Page Application (SPA) used as an **interactive workshop tool** during a 4-day seminar (13-16 April 2026, Ho Chi Minh City) for Vietnamese university leaders and professors. Participants use it in the afternoon sessions to build their own AI adoption strategic plan.

**Everything in the app is in English.**

## Seminar structure

| | Morning (J. Parisse) | Afternoon (D. Legrain) | Bridge |
|---|---|---|---|
| Day 1 | Lewin, Kotter, change theory | Module 1: Maturity Diagnostic (radar) | Frameworks → "Where are we now?" |
| Day 2 | Stakeholder mapping, resistance | Module 2: Resistance Mapping + AI tools exercise | WHO resists → WHY + AI-powered persuasion |
| Day 3 | Transformation roadmap, quick wins | Module 3: Vibe Coding a quick win | Plan it → Build it |
| Day 4 | Change Dashboard, KPIs | Module 4: 90-Day Plan + PDF Export | How to measure → What to measure |

- Each afternoon **builds on** the morning's deliverables
- Mix of individual, small group, and plenary work
- Tools taught: **NotebookLM**, **Gemini Deep Research** (Day 2), **Vibe Coding / Google AI Studio** (Day 3)
- Modules unlock progressively (Day 1 = Module 1 only, etc.)

## Tech stack

- **Frontend**: React (Vite) + Tailwind CSS + Recharts
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + Edge Functions)
- **AI**: Claude API via Supabase Edge Functions (AI Advisor panel)
- **PDF**: html2pdf.js or jsPDF
- **Hosting**: Netlify (frontend)

## Architecture

```
┌─────────────┐     ┌──────────────────────┐     ┌───────────┐
│  React SPA  │────▶│      Supabase        │     │ Claude AI │
│  (Netlify)  │     │  - PostgreSQL (data)  │     │    API    │
│             │     │  - Auth (magic link)  │     │           │
│             │     │  - Realtime (sync)    │     │           │
│             │────▶│  - Edge Functions ────│────▶│           │
└─────────────┘     └──────────────────────┘     └───────────┘
```

See `specs/architecture.md` for details.

## Project structure

```
specs/          # Detailed specs per module — READ BEFORE IMPLEMENTING
  context.md    # Full seminar context, audience, pedagogy, daily structure
  architecture.md          # Supabase schema, Edge Functions, auth, AI integration
  ai-advisor.md            # AI Advisor panel specs
  module-1-diagnostic.md   # MTM 8-dimension radar with sub-criteria
  module-2-resistances.md  # Triple diagnostic + AI exercise + counter-measures
  module-3-arsenal.md      # Solution cards + vibe coding workflow
  module-4-plan-90j.md     # Kanban + champions + KPIs
  export-pdf.md            # PDF export specifications
  references.md            # Scientific bibliography (8 articles)
refs/           # Research articles and NotebookLM exports
src/            # React application source code
public/         # Static assets
```

## Key design principles

- **Workshop tool, not standalone product** — assumes a facilitator guides the session
- **Morning-afternoon bridge** — each module imports/references the morning's work
- **Scientific rigor** — every recommendation cites its source (Author, Year)
- **Cross-module intelligence** — Module 1 weaknesses inform Module 4 priorities; Module 2 resistances trigger Module 4 champion alerts
- **AI Advisor** — contextual AI coach that reads participant data + research articles to give personalized recommendations
- **Realtime collaboration** — Supabase Realtime enables group work and plenary comparisons (e.g., overlay radars)
- **Progressive disclosure** — modules unlock as the seminar progresses
- **Simple UX** — participants may be non-technical; clear, guided, step-by-step
- Always read the relevant `specs/*.md` file before implementing a module

## Scientific sources

8 research articles power the app's logic. See `specs/references.md` for full list.
Key frameworks: MTM 8-dimension model (Bravo-Jaico), 3 AI anxieties (Cao Kai), 4 resistance behaviors (Deacon), 3 diffusion levers (Singh & Strzelecki), 3-layer deployment model (Nguyen & Hong).
