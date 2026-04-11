# Module 4: 90-Day Adoption Plan (Day 4 Afternoon)

> "How do we make it happen, and how do we know it's working?" — The morning built a Change Dashboard. This afternoon builds the plan it will measure.

## Morning → Afternoon Bridge

J. Parisse's morning covers measurement principles (leading vs lagging indicators, public sector pitfalls) and participants build an institutional Change Dashboard. Module 4 creates the 90-day plan that the Dashboard will track — the KPIs defined in the morning become the success criteria embedded in the plan.

**The bridge**: "Your Dashboard is the speedometer. This plan is the engine."

## Workshop Flow

| Time | Activity | Mode | Tool |
|------|----------|------|------|
| 13:45-14:15 | Conceptual input: Vietnamese HE barriers (Taylor & Francis, 2026), 3-phase model, champion dynamics | Plenary | Slides |
| 14:15-15:00 | Build the plan: import Module 3 solutions, assign to phases, define champions, respond to system alerts | Groups | **App** |
| 15:00-15:15 | Break | | |
| 15:15-15:30 | Define KPIs: align with morning's Change Dashboard | Groups | **App** (KPI section) |
| 15:30-15:45 | Generate Executive Report PDF | Groups | **App** (Export) |
| 15:45-16:00 | Final presentations + wrap-up (J-B. Maillard) | Plenary | |

## Kanban Board — 3 Phases (Lewin/Nguyen & Hong)

### Phase 1: ACTIVATION (Days 1-30)

**Objective**: Infrastructure, leadership, unfreezing habits

**Guiding questions** (displayed in column header):
- Who needs to authorize this initiative?
- What infrastructure is already in place? (link to Module 1 Digital Governance score)
- What quick wins can demonstrate value in week 1?

**From Nguyen & Hong (2025)**:
- Secure high-speed internet, cloud platforms, cybersecurity protocols
- Set clear long-term digital objectives for the institution
- Address equity and inclusion (urban/rural digital divide — critical in Vietnam)
- Secure initial budget

### Phase 2: IMPLEMENTATION (Days 31-60)

**Objective**: Pedagogy, tool deployment, training

**Guiding questions**:
- Which training programs need to be created? (train on pedagogy, not just software)
- Who delivers the training?
- How do you measure early adoption?

**From Nguyen & Hong (2025)**:
- Deploy LMS, AI-based assessment tools, online course models
- Digitize and automate administrative services (admissions, student records, finance) — prove immediate efficiency
- Intensive faculty training: both technical skills AND pedagogical approaches

**Key recommendation**: "Train faculty to USE AI in their teaching design, not just to click buttons. They must learn to critically evaluate AI-generated content before presenting it to students (Hong et al., 2026)."

### Phase 3: INSTITUTIONALIZATION (Days 61-90)

**Objective**: Quality assurance, KPIs, cultural integration

**Guiding questions**:
- What KPIs demonstrate success? (link to morning's Dashboard)
- How does this become policy, not just a project?
- What governance structure sustains this beyond 90 days?

**From Nguyen & Hong (2025)**:
- Invest permanently (flexible classrooms, computer labs) for continuous tech growth
- Set up quality assurance with KPIs and feedback loops
- Build partnerships with tech companies, government, educational community
- **Dynamic refreezing**: Phase 3 doesn't mean "done" — it means the institution now has the structures to continuously adapt

## Smart Logic: Champion Assignment

### Positive Feedback (green banner)

**Condition**: Champion targets "Students" OR "Administration"

> "Excellent strategy: social influence and peer dynamics are massive adoption drivers for this audience. Student ambassadors create institutional momentum. Administrative champions prove efficiency gains that are hard to argue against (Bui et al., 2025)."

### Red Alert (red banner)

**Condition**: Champion targets "Professors"

> "**Warning**: Among academics, the 'champion' model can backfire. Professors work in silos and prefer to evaluate tools privately. Public demonstrations and peer pressure have almost no impact on them. Instead:
> - Offer **risk-free, private experimentation** (no installation, no sign-up, no audience)
> - Demonstrate **immediate time savings on THEIR specific tasks** (not generic demos)
> - Never frame it as 'your colleague is already using it' — this triggers displacement anxiety
> (Singh & Strzelecki, 2026; Cao Kai et al., 2026)"

### Cross-module alert

**Condition**: Module 2 flagged professors with displacement anxiety AND Module 4 assigns a champion to professors

> "**Conflict detected**: In Module 2, you identified displacement anxiety among professors. Assigning a champion will likely worsen this. Consider replacing the champion with a **private pilot program**: 3-5 volunteer professors experiment individually for 30 days, then share results only if they choose to."

## KPI Section (NEW — links to morning Dashboard)

After the Kanban, a dedicated section where groups define 3-5 KPIs:

| Field | Description |
|-------|-------------|
| KPI Name | e.g., "% of courses using AI-assisted assessment" |
| Type | Leading / Lagging |
| Target (90 days) | e.g., "25% of courses" |
| Data Source | e.g., "LMS usage logs" |
| Responsible | e.g., "Vice-Rector Academic Affairs" |
| Phase | Which phase this KPI starts being measured |

**From Bravo-Jaico (2025)**: "Do not launch transformation without metrics. Develop a performance indicator system for each of the 8 dimensions to track progress objectively."

**Auto-suggestions** based on Module 1 weakest dimensions:
- If Teaching & Learning < 1.5 → suggest KPI: "Number of faculty trained on AI pedagogy"
- If Digital Governance < 1.5 → suggest KPI: "Data governance policy approved (Y/N)"
- If Administrative Management < 1.5 → suggest KPI: "% of administrative processes digitized"

## Operational Recommendations (displayed as tips)

From the research, embedded as contextual tips throughout the module:

1. **"Students are consultants, not guinea pigs"** — Include student feedback committees in the plan. They evaluate whether digital tools actually meet their learning needs (Nguyen & Hong, 2025).

2. **"Anticipate the Digital Divide"** — Any AI deployment must include support policies for disadvantaged students (scholarships, equipment loans). Without this, AI adoption widens inequality (Nguyen & Hong, 2025).

3. **"Avoid the isolated gadget syndrome"** — 56% of universities adopt isolated initiatives without alignment. Every tool must connect to the institution's strategic plan (Bravo-Jaico et al., 2025).

4. **"Reward the effort"** — Workload overload is the #1 barrier. Offer financial incentives or reduced teaching loads for staff investing in digital course design (Deacon et al., 2025).

## Data Model

```typescript
interface PlanTask {
  id: string;
  name: string;
  phase: 1 | 2 | 3;
  championName?: string;
  championTarget?: 'Students' | 'Professors' | 'Administration';
  priority: 'Low' | 'Medium' | 'High';
  status: 'Not Started' | 'In Progress' | 'Done';
  sourceSolutionId?: string; // link to Module 3
  order: number;
}

interface KPI {
  id: string;
  name: string;
  type: 'Leading' | 'Lagging';
  target: string;
  dataSource: string;
  responsible: string;
  phase: 1 | 2 | 3;
}

interface AdoptionPlan {
  institutionName: string;
  teamMembers: string[];
  phases: {
    activation: PlanTask[];
    implementation: PlanTask[];
    institutionalization: PlanTask[];
  };
  kpis: KPI[];
  // Cross-module references
  weakestDimensions: string[]; // from Module 1
  flaggedStakeholders: string[]; // from Module 2
}
```
