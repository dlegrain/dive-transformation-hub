# Module 2: Human Resistance Mapping (Day 2 Afternoon)

> "Who will resist, why, and how do we convince them?" — The morning mapped the stakeholders and their power. Now let's diagnose their resistance scientifically and use AI to build persuasion strategies.

## Morning → Afternoon Bridge

J. Parisse's morning covers stakeholder mapping (power/interest matrix), change curve, and resistance mechanisms in general. Module 2 takes the specific stakeholders identified that morning and runs them through a science-based triple diagnostic, then uses AI tools (NotebookLM/Gemini) to generate tailored persuasion strategies.

**The key insight for participants**: "You mapped WHO this morning. Now let's understand WHY they resist, and let's use the very AI tools they're afraid of to solve the problem."

## Workshop Flow

| Time | Activity | Mode | Tool |
|------|----------|------|------|
| 13:45-14:15 | Conceptual input: 3 anxieties, 4 behaviors, 3 levers + how they interact | Plenary | Slides |
| 14:15-14:45 | Hands-on AI exercise: use NotebookLM/Gemini to synthesize an institutional document or build an argumentaire for a resistant stakeholder | Individual/Pairs | NotebookLM/Gemini |
| 14:45-15:00 | Self-debrief in the app: "What anxiety did YOU just experience? What did you observe?" | Individual | **App** |
| 15:00-15:15 | Break | | |
| 15:15-15:45 | Map your institution's stakeholders: triple diagnostic per stakeholder | Groups | **App** |
| 15:45-16:00 | Plenary debrief: most surprising counter-measures, link to morning's stakeholder map | Plenary | |

## The Triple Diagnostic

Instead of a single "resistance type" dropdown, each stakeholder gets analyzed through 3 complementary lenses:

### Lens 1: HOW do they resist? (Observable Behavior — Deacon et al., 2025)

| Behavior | Description | Danger Level |
|----------|-------------|-------------|
| Pronounced Refusal | Open opposition, vocal rejection | Visible — manageable |
| Pronounced Opposing | Active argumentation against, ideological pushback | Visible — requires dialogue |
| Subtle Undermining | Passive sabotage, "forgetting" to use tools, quiet non-compliance | **Invisible — most dangerous** |
| Subtle Avoiding | Minimization ("it's just a fad"), deflection, schedule conflicts | **Invisible — most common** |

### Lens 2: WHY do they resist? (Root Cause — Cao Kai et al., 2026)

| Anxiety Type | Description | Key Insight |
|-------------|-------------|-------------|
| AI Learning Anxiety | Fear of not being able to master the technology | Solvable with structured, low-stakes practice |
| Sociotechnical Blindness Anxiety | Fear of being marginalized, left behind by the institution | **Can be leveraged positively** — this anxiety motivates learning IF paired with community of practice |
| Job Displacement Anxiety | Existential fear of losing professional value and identity | **The hardest to solve** — requires reframing AI as augmentation + career orientation |

**Discipline modifier** (Cao Kai): STEM profiles convert anxiety into motivation more easily. Humanities/social sciences need specific interventions to defuse the threat to disciplinary traditions.

### Lens 3: WHAT rational lever is missing? (Adoption Decision — Singh & Strzelecki, 2026)

| Missing Lever | Description | What To Do |
|--------------|-------------|------------|
| Relative Advantage | They don't see how AI saves them time or improves their work | **Demonstrate immediate, tangible benefit** on THEIR tasks (not generic demos) |
| Compatibility | AI doesn't fit their existing workflow or values | **Adapt the tool** to their methods, don't ask them to change methods for the tool |
| Low Complexity | The tool feels too complicated to learn | **Reduce friction**: no installation, no login, one-click access, guided tutorials |

### Key insight from Singh & Strzelecki

> For professors specifically: do NOT rely on social pressure or public demonstrations. Academics work in silos and prefer to evaluate tools privately. The champion model fails here. Instead, offer risk-free individual experimentation.

## Generated Counter-Measures

The app generates a **composite recommendation** based on the combination of the 3 lenses. Examples:

**Scenario**: Professor + Subtle Avoiding + Learning Anxiety + Low Complexity missing
> "This professor avoids AI because it feels overwhelming, not because they oppose it. Don't push — provide a private sandbox where they can experiment alone, without judgment. Start with a tool that augments their existing research workflow (e.g., literature review). No public demos, no champion pressure (Singh & Strzelecki, 2026; Cao Kai et al., 2026)."

**Scenario**: Administration + Pronounced Opposing + Displacement Anxiety + Relative Advantage missing
> "This administrative group actively opposes because they fear job loss. Counter with concrete evidence: show how AI automates the tedious parts (data entry, scheduling) and frees time for higher-value tasks they actually enjoy. Involve them in designing the new workflows, not just receiving them (Deacon et al., 2025)."

**Scenario**: Professor + Pronounced Opposing + Ethical Barriers (special case)
> "**Do not fight this!** This opposition reflects critical engagement and professional responsibility. These are your most valuable allies for drafting ethical AI guidelines. Involve them in governance, not in adoption campaigns (Hong et al., 2026)."

## Self-Debrief Section

After the NotebookLM/Gemini exercise, participants answer in the app:
- "Which anxiety did you experience while using AI just now?" (radio buttons: Learning / Sociotechnical / Displacement / None)
- "What surprised you?" (free text)
- "Would you use this tool again tomorrow?" (Yes / Maybe / No)

This creates a personal data point that connects to the theoretical framework — they're not just mapping others, they're recognizing their own reactions.

## Data Model

```typescript
interface Stakeholder {
  id: string;
  name: string;
  role: 'Students' | 'Professors' | 'Administration' | 'Direction';
  discipline?: 'STEM' | 'Humanities' | 'Social Sciences' | 'Other';
  
  // Triple diagnostic
  behavior: 'pronounced_refusal' | 'pronounced_opposing' | 'subtle_undermining' | 'subtle_avoiding';
  anxiety: 'learning' | 'sociotechnical' | 'displacement' | 'ethical_engagement';
  missingLever: 'relative_advantage' | 'compatibility' | 'low_complexity';
  
  notes?: string;
  generatedCounterMeasure?: string; // auto-generated by the app
}

interface SelfDebrief {
  anxietyExperienced: 'learning' | 'sociotechnical' | 'displacement' | 'none';
  surprise: string;
  wouldUseAgain: 'yes' | 'maybe' | 'no';
}
```

## Integration with Other Modules

- **From morning**: Stakeholder names/roles can be pre-filled if participants bring their power/interest matrix
- **To Module 4**: Stakeholders with displacement anxiety targeting professors → auto-flag champion assignments in Module 4
- **To Module 3**: Stakeholders with "relative advantage missing" → suggest building a demo tool in Module 3 that targets their specific need
