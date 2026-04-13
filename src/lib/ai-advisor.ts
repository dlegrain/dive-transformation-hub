import { DIMENSIONS, RESISTANCE_BEHAVIORS, ANXIETY_TYPES, MISSING_LEVERS, PLAN_PHASES, POWER_LEVELS, INTEREST_LEVELS } from './constants';
import type {
  DimensionKey,
  DimensionAssessment,
  CustomDimension,
  Stakeholder,
  SolutionCard,
  PlanTask,
  KPI,
} from '../types';

// ============================================================
// Build the system prompt with all module data
// ============================================================

function formatDimensionScore(d: DimensionAssessment): string {
  const known = [d.tools, d.data, d.culture].filter((v) => v > 0) as number[];
  const avg = known.length > 0 ? (known.reduce((a, b) => a + b, 0) / known.length).toFixed(1) : 'N/A';
  const toolsLabel = d.tools === 0 ? "I don't know" : String(d.tools);
  const dataLabel = d.data === 0 ? "I don't know" : String(d.data);
  const cultureLabel = d.culture === 0 ? "I don't know" : String(d.culture);
  return `${avg}/3 (Tools=${toolsLabel}, Data=${dataLabel}, Culture=${cultureLabel})`;
}

function dimensionSummary(
  dimensions: Record<DimensionKey, DimensionAssessment>,
  hiddenDimensions: DimensionKey[] = [],
  customDimensions: CustomDimension[] = [],
): string {
  const lines: string[] = [];

  // Standard dimensions (excluding hidden)
  DIMENSIONS.forEach((dim) => {
    if (hiddenDimensions.includes(dim.key)) return;
    lines.push(`  - ${dim.label}: ${formatDimensionScore(dimensions[dim.key])}`);
  });

  // Custom dimensions
  customDimensions
    .filter((cd) => cd.label.trim())
    .forEach((cd) => {
      lines.push(`  - ${cd.label} (custom): ${formatDimensionScore(cd.assessment)}`);
    });

  // Mention hidden dimensions so the AI knows they were deliberately excluded
  if (hiddenDimensions.length > 0) {
    const hiddenLabels = hiddenDimensions
      .map((key) => DIMENSIONS.find((d) => d.key === key)?.label)
      .filter(Boolean);
    lines.push(`  [Hidden by participant as not relevant: ${hiddenLabels.join(', ')}]`);
  }

  return lines.join('\n');
}

function stakeholderSummary(stakeholders: Stakeholder[]): string {
  if (stakeholders.length === 0) return '  (No stakeholders mapped yet)';
  return stakeholders
    .map((s) => {
      const behavior = RESISTANCE_BEHAVIORS.find((b) => b.value === s.behavior)?.label;
      const anxiety = ANXIETY_TYPES.find((a) => a.value === s.anxiety)?.label;
      const lever = MISSING_LEVERS.find((l) => l.value === s.missing_lever)?.label;
      const powerLabel = s.power ? POWER_LEVELS.find((p) => p.value === s.power)?.label : null;
      const interestLabel = s.interest ? INTEREST_LEVELS.find((i) => i.value === s.interest)?.label : null;
      const quadrant = s.power && s.interest
        ? s.power === 'high' && s.interest === 'high' ? 'KEY PLAYER'
        : s.power === 'high' && s.interest === 'low' ? 'KEEP SATISFIED'
        : s.power === 'low' && s.interest === 'high' ? 'KEEP INFORMED'
        : 'MONITOR'
        : null;
      const piStr = powerLabel && interestLabel ? ` | ${powerLabel}/${interestLabel} → ${quadrant}` : '';
      return `  - ${s.name} (${s.role}${s.discipline ? ', ' + s.discipline : ''}): ${behavior} | ${anxiety} | Missing: ${lever}${piStr}`;
    })
    .join('\n');
}

function solutionSummary(solutions: SolutionCard[]): string {
  if (solutions.length === 0) return '  (No solutions created yet)';
  return solutions
    .map((s) => `  - ${s.name} [${s.target}, ${s.difficulty}, ${s.status}${s.assigned_phase ? ', Phase ' + s.assigned_phase : ''}]`)
    .join('\n');
}

function planSummary(tasks: PlanTask[], kpis: KPI[]): string {
  const parts: string[] = [];
  for (const phase of PLAN_PHASES) {
    const phaseTasks = tasks.filter((t) => t.phase === phase.phase);
    parts.push(`  Phase ${phase.phase} (${phase.label}): ${phaseTasks.length} tasks`);
    phaseTasks.forEach((t) => {
      parts.push(`    - ${t.name}${t.champion_name ? ' [In charge: ' + t.champion_name + ' → ' + t.champion_target + ']' : ''} (${t.status})`);
    });
  }
  if (kpis.length > 0) {
    parts.push('  KPIs:');
    kpis.forEach((k) => parts.push(`    - ${k.name} (${k.type}, Target: ${k.target || 'TBD'})`));
  } else {
    parts.push('  KPIs: (none defined yet)');
  }
  return parts.join('\n');
}

const RESEARCH_CONTEXT = `
RESEARCH BASE — Your recommendations must be grounded in these studies:

1. Bravo-Jaico et al. (2025) — MTM Model: 8-dimension maturity assessment for HE. The #1 barrier is lack of personnel preparation, not technology. Invest in digital culture and soft skills. Avoid isolated tech initiatives — align with strategic plan.

2. Bui et al. (2025) — AI adoption by Vietnamese students: Social influence and peer success stories are powerful drivers for students. Partner with industry. Provide facilitating conditions without friction.

3. Cao et al. (2026) — 3 AI anxieties: Learning anxiety (solvable with hands-on workshops), Sociotechnical blindness anxiety (can be leveraged positively with communities of practice), Job displacement anxiety (hardest — requires reframing AI as augmentation). STEM profiles adapt faster; humanities need specific interventions.

4. Deacon et al. (2025) — 4 resistance behaviors: pronounced refusal, pronounced opposing, subtle undermining (most dangerous), subtle avoiding (most common). Resistance is a diagnostic tool, not an obstacle. Workload overload is the #1 barrier. Co-create, don't impose top-down.

5. Hong et al. (2026) — Perceived ethical barriers reflect critical engagement, not opposition. Use these people to draft AI ethical guidelines. Faculty must provide formal frameworks — without them, peer mimicry leads to unethical use.

6. Nguyen & Hong (2025) — 3-layer deployment model for Vietnamese HE: Activation (infrastructure, vision, equity), Implementation (pedagogy, admin, training), Institutionalization (QA, KPIs, dynamic refreezing). Address the digital divide. Students are consultants, not guinea pigs.
   MOET 5 MANDATORY STRATEGIES (extracted from 21 national policy documents by Nguyen & Hong):
   S1: Digital Infrastructure & Governance — shared platforms, high-speed internet, cybersecurity protocols. The absolute foundation.
   S2: Equity & Faculty Development — bridge the urban/rural digital divide, intensive teacher training for innovation (not just button-clicking).
   S3: Digital Pedagogy & Administration — online course sharing, digitized admin services, public portals.
   S4: Strategic Planning & Stakeholder Collaboration — long-term digital objectives via steering committees, joint engagement of universities + government + industry.
   S5: Financing & Resource Allocation — guaranteed state budget + institutional resources for sustained tech growth.
   USE THESE STRATEGIES: When analyzing a participant's maturity scores or plan, map their gaps to the relevant MOET strategy. E.g., low Digital Governance score → S1; no budget plan → S5; no faculty training → S2. This anchors their work in Vietnamese national policy.

7. Nguyen & Uong (2026) — Empirical evidence from Vietnamese non-public universities: habits, data reliability, and organizational resistance are the main barriers.

8. Singh & Strzelecki (2026) — For professors: do NOT use social pressure or public demos. They evaluate privately. Offer risk-free solo experimentation. Demonstrate immediate time savings on THEIR specific tasks.

9. Verano-Tacoronte et al. (2025) — Faculty anxiety in stable public universities: job displacement anxiety has NO significant effect on adoption intention when employment is secure. The real blockers are ethical/pedagogical anxieties: fear of misusing the tool (integrity loss), and fear of negative impact on student learning (plagiarism, reduced effort). Training must focus on ethical use and student conduct codes, not just technical skills. Gender matters: female faculty show lower adoption intention — design targeted mentoring. Even faculty who refuse to adopt MUST be trained so they understand how their students use AI.`;

export function buildSystemPrompt(
  currentModule: string,
  institutionName: string,
  dimensions: Record<DimensionKey, DimensionAssessment>,
  stakeholders: Stakeholder[],
  solutions: SolutionCard[],
  tasks: PlanTask[],
  kpis: KPI[],
  hiddenDimensions: DimensionKey[] = [],
  customDimensions: CustomDimension[] = [],
): string {
  return `You are the DIVE AI Advisor, a strategic coach for university leaders planning AI adoption at their institution. You are embedded in the DIVE Transformation Hub workshop tool during a 4-day seminar in Ho Chi Minh City, Vietnam.

INSTITUTION: ${institutionName || '(not specified yet)'}

CURRENT MODULE: ${currentModule}

MODULE DATA:

Module 1 — Maturity Diagnostic:
${dimensionSummary(dimensions, hiddenDimensions, customDimensions)}

Module 2 — Resistance Map:
${stakeholderSummary(stakeholders)}

Module 3 — Solutions Arsenal:
${solutionSummary(solutions)}

Module 4 — 90-Day Plan:
${planSummary(tasks, kpis)}

${RESEARCH_CONTEXT}

RULES:
- Always cite your source: "(Author et al., Year)"
- Be concise — max 3-4 paragraphs per response
- Be actionable — every recommendation should be something they can do
- Be specific to THEIR data — don't give generic advice
- If you spot contradictions between modules (e.g., displacement anxiety in Module 2 but a professor assigned as person in charge in Module 4), flag them proactively
- Language: English only
- Tone: professional but warm, like a knowledgeable colleague
- Use bullet points for actionable items`;
}

// ============================================================
// Proactive alert detection
// ============================================================

export interface ProactiveAlert {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  module: string;
}

export function detectAlerts(
  dimensions: Record<DimensionKey, DimensionAssessment>,
  stakeholders: Stakeholder[],
  solutions: SolutionCard[],
  tasks: PlanTask[],
  kpis: KPI[],
): ProactiveAlert[] {
  const alerts: ProactiveAlert[] = [];

  // Weak dimension with no corresponding task
  const weakDimensions = DIMENSIONS.filter((dim) => {
    const d = dimensions[dim.key];
    const known = [d.tools, d.data, d.culture].filter((v) => v > 0) as number[];
    if (known.length === 0) return false; // all unknown — can't assess
    return known.reduce((a, b) => a + b, 0) / known.length < 1.5;
  });
  if (weakDimensions.length > 0 && tasks.length > 0) {
    weakDimensions.forEach((dim) => {
      alerts.push({
        id: `weak-${dim.key}`,
        message: `Your "${dim.label}" score is critically low but your 90-day plan may not address it. Consider adding specific actions in Phase 1.`,
        severity: 'warning',
        module: 'module4',
      });
    });
  }

  // Conflict: professors with displacement anxiety targeted in Module 4
  const profDisplacement = stakeholders.some(
    (s) => s.role === 'Professors' && s.anxiety === 'displacement'
  );
  const profTargeted = tasks.some((t) => t.champion_target === 'Professors');
  if (profDisplacement && profTargeted) {
    alerts.push({
      id: 'prof-target-conflict',
      message:
        'Conflict: you identified displacement anxiety among professors (Module 2) but assigned a professor-facing task with a person in charge (Module 4). A top-down approach will likely backfire. Consider private pilot programs instead.',
      severity: 'critical',
      module: 'module4',
    });
  }

  // Professors mapped without ethical/pedagogical consideration
  const profStakeholders = stakeholders.filter((s) => s.role === 'Professors');
  const hasEthicalProf = profStakeholders.some((s) => s.anxiety === 'ethical_engagement');
  if (profStakeholders.length > 0 && !hasEthicalProf) {
    alerts.push({
      id: 'no-ethical-prof',
      message:
        'None of your professor stakeholders are mapped with ethical/pedagogical concerns. Research shows these are often the real adoption blockers for faculty — not just displacement anxiety. Consider whether some professors have ethical fears (integrity, plagiarism) that need specific training (Verano-Tacoronte et al., 2025).',
      severity: 'info',
      module: 'module2',
    });
  }

  // No KPIs
  if (tasks.length > 0 && kpis.length === 0) {
    alerts.push({
      id: 'no-kpis',
      message: `Your plan has ${tasks.length} tasks but no success metrics. Without KPIs, you won't know if the transformation is working.`,
      severity: 'warning',
      module: 'module4',
    });
  }

  // Low-difficulty solution not in Phase 1
  solutions
    .filter((s) => s.difficulty === 'Low' && s.assigned_phase !== 1)
    .forEach((s) => {
      alerts.push({
        id: `lowdiff-${s.id}`,
        message: `"${s.name}" is a low-difficulty solution but not assigned to Phase 1. Quick wins in Phase 1 build momentum.`,
        severity: 'info',
        module: 'module3',
      });
    });

  // Missing stakeholder roles
  if (stakeholders.length > 0) {
    const mappedRoles = new Set(stakeholders.map((s) => s.role));
    const allRoles = ['Students', 'Professors', 'Administration', 'Direction'] as const;
    const missing = allRoles.filter((r) => !mappedRoles.has(r));
    if (missing.length >= 2) {
      alerts.push({
        id: 'missing-roles',
        message: `You've only mapped ${[...mappedRoles].join(', ')}. Consider also mapping ${missing.join(', ')} for a complete picture.`,
        severity: 'info',
        module: 'module2',
      });
    }
  }

  return alerts;
}
