# Module 3: AI Solutions Arsenal (Day 3 Afternoon)

> "The morning identified your quick wins. This afternoon, you BUILD one." — From roadmap to working prototype in 2 hours.

## Morning → Afternoon Bridge

J. Parisse's morning covers transformation roadmap design: priorities, quick wins, risk analysis, alignment with institutional constraints. Module 3 takes one of those quick wins and makes it real through vibe coding.

**The "wow" moment**: "At 11am you identified 'AI-powered FAQ for students' as a quick win. By 4pm you have a working prototype. If you can do this in a seminar room, imagine what your institution can do in 90 days."

## Workshop Flow

| Time | Activity | Mode | Tool |
|------|----------|------|------|
| 13:45-14:15 | Conceptual input: 3-layer model (Nguyen & Hong), what vibe coding is, live demo | Plenary | Slides + Google AI Studio |
| 14:15-14:30 | Pick your prototype: select a quick win from this morning's roadmap, create solution card in app | Groups | **App** (Phase 1) |
| 14:30-15:00 | Vibe coding: build the prototype | Groups | Google AI Studio |
| 15:00-15:15 | Break | | |
| 15:15-15:45 | Vibe coding (continued) + document results in app | Groups | Google AI Studio + **App** (Phase 2) |
| 15:45-16:00 | Lightning demos (2 min/group) + peer voting | Plenary | |

## Two-Phase Module

### Phase 1: Selection (in the app)

Participants create solution cards for the AI tools they want to build. The app offers:

**Starter templates** (pre-filled cards they can customize):

| Template | Target | Difficulty | Description |
|----------|--------|-----------|-------------|
| Welcome Guide Chatbot | Students | Low | Answer new students' questions about campus, rules, procedures — upload the handbook as context |
| Study Buddy | Students | Low | Help students revise a course by generating questions from the syllabus |
| Syllabus Generator | Professors | Low | Generate a structured syllabus (objectives, weekly plan, assessments) from a course description |
| Rubric Builder | Professors | Low | Generate grading rubrics with criteria and levels from an assignment description |
| Email Drafter | Administration | Low | Draft official communications (announcements, invitations) from bullet points |
| Policy Q&A Bot | Administration | Low | Answer questions about internal regulations — upload the policy document as context |

> All templates are rated **Low difficulty** because they rely on prompt engineering only — no coding required. Participants can build any of these in Google AI Studio during the 2-hour workshop.

**Or create custom cards** based on the morning's quick wins list.

Each card has:
- **Tool Name** (text)
- **Target Audience** (dropdown): Students | Professors | Administration
- **Difficulty Level** (dropdown): Low | Medium | High
- **Problem it solves** (text) — ideally linked to a morning quick win
- **Status**: Planned → Prototyped → Tested

### Phase 2: Documentation (in the app, after vibe coding)

After building with Google AI Studio, participants return to the app to document:
- **Status** updated to "Prototyped" or "Tested"
- **Vibe Coding Notes**: what they built, what worked, what didn't
- **Tool/Platform used**: Google AI Studio / other
- **Assign to 90-day phase**: which phase of Module 4 this belongs to (suggested by difficulty: Low → Phase 1, Medium → Phase 2, High → Phase 3, but overridable)

## Smart Logic

- **Auto-suggest phase assignment** based on difficulty level
- **Link to Module 2**: If a stakeholder has "relative advantage missing", suggest building a prototype that directly addresses their need: "Your engineering faculty doesn't see the value of AI. Consider building a research paper summarizer — it demonstrates immediate time savings on THEIR tasks."
- **Link to Module 4**: Cards tagged with a phase automatically appear in the Module 4 Kanban

## Data Model

```typescript
interface SolutionCard {
  id: string;
  name: string;
  target: 'Students' | 'Professors' | 'Administration';
  difficulty: 'Low' | 'Medium' | 'High';
  status: 'Planned' | 'Prototyped' | 'Tested';
  problemSolved: string;
  vibeCodingNotes?: string;
  platformUsed?: string;
  assignedPhase?: 1 | 2 | 3;
  linkedQuickWin?: string; // reference to morning's roadmap
  order: number;
}
```

## Integration with Other Modules

- **From morning (Day 3)**: Quick wins list → becomes the source of prototype ideas
- **From Module 2**: Stakeholders with "relative advantage missing" → suggests which prototype to build
- **To Module 4**: Solution cards flow into the Kanban as action items with phase assignments

---

## AI Policy Builder (Special Template)

This template is distinct from the others: it is **provided by the app** (not built by participants during vibe coding). The app generates a first draft institutional AI charter. Participants then use that draft as the basis for their vibe coding exercise.

### Workshop flow

1. **In the app** — Participants complete the Policy Builder questionnaire (5 questions, ~5 min). The AI Advisor generates a structured draft charter with 5 articles, each with pedagogical explanations citing 3 sources.
2. **Vibe coding in Google AI Studio** — Participants build a "Policy Q&A chatbot" using their draft as context. Two personas to implement:
   - **"Encouraging" mode**: welcoming, explanatory, finds the compatible use case
   - **"Enforcing" mode**: firm, cites the violated article, explains the consequence
3. **Facilitator demo** — Diederick demonstrates the two modes live before participants build theirs. Key pedagogical point: *the system prompt changes everything*.

### The 5 questionnaire questions (in-app)

Each question is accompanied by a pedagogical insight box citing sources.

| # | Question | Pedagogical insight shown to user |
|---|----------|-----------------------------------|
| 1 | What is your institution type and approximate student population? | *"Only 26% of universities globally have formal AI policies (Coursera/VietnamPlus, 2026). You are among the pioneers."* |
| 2 | What AI uses are you already observing on your campus? (multiple choice: student assignments / faculty course design / admin tasks / research / other) | *"At UNamur, 99% of students already use AI tools — mainly ChatGPT. 63% admit using it for academic tasks without declaring it, not out of bad faith but because rules are unclear (Coumont, 2025)."* |
| 3 | What are your top 3 concerns? (academic integrity / data privacy / cognitive skills / equity / legal compliance / other) | *"77% of students believe AI = cheating 'depends on how it's used'. Detection software is unreliable and 31% of students have already tried to circumvent it (Coumont, 2025). A policy must go beyond detection."* |
| 4 | What posture do you want to adopt? (Permissive: AI encouraged with transparency / Guided: context-by-context rules / Restrictive: AI prohibited except in authorized cases) | *"The Sorbonne Paris 1 charter (2025) proposes 3 levels: open approach / intermediate approach / restrictive approach — by course, not by institution. One-size-fits-all policies tend to fail."* |
| 5 | Who will be responsible for enforcing this charter? (Academic Affairs / Dean's office / Faculty council / To be defined) | *"Hong et al. (2026): without formal institutional frameworks, peer mimicry leads to unethical use. Naming a responsible body is not bureaucracy — it's the difference between a charter that lives and one that sits in a drawer."* |

### Generated charter structure

The AI Advisor generates a 5-article draft based on the questionnaire answers, adapted to Vietnamese HE context.

Each article includes:
- The rule (adapted to chosen posture)
- A **"Why this matters"** box with source citation
- Practical examples relevant to Vietnamese university context

| Article | Title | Primary source |
|---------|-------|---------------|
| Art. 1 | Scope & definitions — what counts as AI use | Sorbonne charter, Art. 1 |
| Art. 2 | Acceptable use by context (teaching / research / admin) | Sorbonne charter, Art. 2 + MoET framework |
| Art. 3 | Transparency & declaration — how to disclose AI use | UNamur (Coumont, 2025) + Sorbonne Art. 4 |
| Art. 4 | Data protection & confidentiality | Sorbonne Art. 5–6 + GDPR principles |
| Art. 5 | Academic integrity & cognitive skill development | UNamur (Coumont, 2025) + Hong et al. (2026) |

**Annex**: Student AI Declaration Form (4 levels: No use / Limited assistance / Shared production / Majority AI — adapted from UQAC/Sorbonne model)

### Sources referenced in the Policy Builder

See `specs/ai-policy-sources.md` for full details. Short refs:
- Coumont, L. (2025) — UNamur master's thesis on student AI usage
- VietnamPlus / MoET (2026) — Vietnamese HE AI readiness survey
- Sorbonne Paris 1 (2025) — AI Charter, École de Droit

### Data model extension

```typescript
interface PolicyBuilderData {
  institutionType: string;
  studentPopulation: string;
  observedUses: string[];
  topConcerns: string[];
  posture: 'permissive' | 'guided' | 'restrictive';
  responsibleBody: string;
  generatedCharter?: string; // markdown output from AI Advisor
  generatedAt?: string;
}
```

The generated charter is stored alongside the solution card and exported in the Module 4 PDF as a dedicated section.
