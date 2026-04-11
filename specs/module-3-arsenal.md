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
| FAQ Chatbot | Students | Low | AI-powered Q&A for common student inquiries |
| Quiz Generator | Professors | Low | Auto-generate quizzes from lecture content |
| Writing Feedback Tool | Students | Medium | AI writing assistant with plagiarism awareness |
| Research Paper Summarizer | Professors | Medium | Summarize and analyze research papers using AI |
| Enrollment Predictor | Administration | High | Predict enrollment trends from historical data |
| Curriculum Recommender | Professors | High | AI-driven curriculum gap analysis |

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
