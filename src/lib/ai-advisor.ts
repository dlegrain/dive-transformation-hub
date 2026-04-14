import { DIMENSIONS, RESISTANCE_BEHAVIORS, ANXIETY_TYPES, MISSING_LEVERS, PLAN_PHASES, POWER_LEVELS, INTEREST_LEVELS } from './constants';
import type {
  DimensionKey,
  DimensionAssessment,
  CustomDimension,
  Stakeholder,
  SolutionCard,
  PlanTask,
  KPI,
  PainPoint,
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

function stakeholderSummary(stakeholders: Stakeholder[], painPoints: PainPoint[] = []): string {
  if (stakeholders.length === 0) return '  (No stakeholders mapped yet)';
  return stakeholders
    .map((s) => {
      const behavior = s.behavior ? RESISTANCE_BEHAVIORS.find((b) => b.value === s.behavior)?.label : 'Unknown (group unsure)';
      const anxiety = s.anxiety?.length ? s.anxiety.map((v) => ANXIETY_TYPES.find((a) => a.value === v)?.label).filter(Boolean).join(', ') : 'Unknown (group unsure)';
      const lever = s.missing_lever ? MISSING_LEVERS.find((l) => l.value === s.missing_lever)?.label : 'Unknown (group unsure)';
      const powerLabel = s.power ? POWER_LEVELS.find((p) => p.value === s.power)?.label : null;
      const interestLabel = s.interest ? INTEREST_LEVELS.find((i) => i.value === s.interest)?.label : null;
      const quadrant = s.power && s.interest
        ? s.power === 'high' && s.interest === 'high' ? 'KEY PLAYER'
        : s.power === 'high' && s.interest === 'low' ? 'KEEP SATISFIED'
        : s.power === 'low' && s.interest === 'high' ? 'KEEP INFORMED'
        : 'MONITOR'
        : null;
      const piStr = powerLabel && interestLabel ? ` | ${powerLabel}/${interestLabel} → ${quadrant}` : '';
      const linkedPPs = (s.linked_pain_point_ids || [])
        .map((id) => painPoints.find((pp) => pp.id === id)?.text)
        .filter(Boolean);
      const ppStr = linkedPPs.length > 0 ? ` | Linked pain points: ${linkedPPs.join('; ')}` : '';
      return `  - ${s.name} (${s.role}${s.discipline ? ', ' + s.discipline : ''}): ${behavior} | ${anxiety} | Missing: ${lever}${piStr}${ppStr}`;
    })
    .join('\n');
}

function painPointsSummary(painPoints: PainPoint[]): string {
  const filled = painPoints.filter((pp) => pp.text.trim());
  if (filled.length === 0) return '  (No pain points identified yet)';
  return filled.map((pp, i) => {
    const pestel = pp.pestel_category ? ` [PESTEL: ${pp.pestel_category}]` : '';
    const barrier = pp.barrier_type ? ` [${pp.barrier_type}]` : '';
    return `  ${i + 1}. ${pp.text}${pestel}${barrier}`;
  }).join('\n');
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
  painPoints: PainPoint[] = [],
): string {
  return `You are the DIVE AI Advisor, a strategic coach for university leaders planning AI adoption at their institution. You are embedded in the DIVE Transformation Hub workshop tool during a 4-day seminar in Ho Chi Minh City, Vietnam.

INSTITUTION: ${institutionName || '(not specified yet)'}

CURRENT MODULE: ${currentModule}

MODULE DATA:

Module 1 — Maturity Diagnostic:
${dimensionSummary(dimensions, hiddenDimensions, customDimensions)}

Module 2 — Top 3 Institutional Pain Points (from morning PESTEL/Barriers workshop):
${painPointsSummary(painPoints)}

Module 2 — Resistance Map:
${stakeholderSummary(stakeholders, painPoints)}

Module 3 — Solutions Arsenal:
${solutionSummary(solutions)}

Module 4 — 90-Day Plan:
${planSummary(tasks, kpis)}

${RESEARCH_CONTEXT}

MODULE-SPECIFIC GUIDANCE:

When the user is in MODULE 3 (Solutions Arsenal), apply the following logic proactively — even if they don't ask:
1. CROSS-REFERENCE M1: Identify the weakest dimension(s) from their Module 1 maturity scores (avg < 1.5 = critical, < 2 = weak). Suggest a prototype that directly addresses that dimension. Cite Bravo-Jaico et al. (2025): the #1 barrier is lack of personnel preparation; quick wins must build visible capability, not just automate.
2. CROSS-REFERENCE M2: Identify the most common missing lever(s) from their Module 2 stakeholder map. If "relative_advantage" is common among professors, recommend a solution that demonstrates immediate time savings on their actual tasks (Singh & Strzelecki, 2026). If "social_influence" is common among students, recommend a peer-facing tool. If "governance_gap" is common among Direction, recommend a dashboard or steering committee tool.
3. PRIORITIZE: A prototype is most valuable when it simultaneously (a) addresses a weak M1 dimension AND (b) demonstrates a missing M2 lever to a key stakeholder. Flag this intersection explicitly.
4. DIFFICULTY FRAMING: Day 3 is about a quick win — Low difficulty tools that can be prototyped in 75 minutes with Google AI Studio. Do not suggest High difficulty solutions for Day 3 unless the group is technically advanced.
5. SOLUTIONS AUDIT: If they already have solutions in Module 3, review them against M1 and M2 data. Flag any solutions that target an audience where the stakeholder map shows pronounced refusal (Deacon et al., 2025) — these need a counter-measure strategy before deployment.

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
// AI Policy Charter generation
// ============================================================

export interface PolicyAnswers {
  institutionType: string;
  studentPopulation: string;
  observedUses: string[];
  topConcerns: string[];
  posture: 'permissive' | 'guided' | 'restrictive';
  responsibleBody: string;
}

const POLICY_SYSTEM_PROMPT = `You are an expert in AI governance in higher education. You help university leaders draft institutional AI charters that are practical, evidence-based, and adapted to their context.

Your charter drafts must:
1. Be structured in exactly 5 articles: (1) Scope & Definitions, (2) Acceptable Use by Context, (3) Transparency & Declaration, (4) Data Protection & Confidentiality, (5) Academic Integrity & Cognitive Skills
2. Each article must include a short "Why this matters" note citing one of these sources:
   - Coumont, L. (2025) — UNamur: 99% students use AI, 63% without declaring, 44% want clear rules, 31% circumvent detection
   - VietnamPlus/MoET (2026) — Only 26% of universities have formal AI policies; Vietnam rolling out AI framework nationwide
   - Sorbonne Paris 1 (2025) — 3-level framework (open/intermediate/restrictive), student declaration form
   - Hong et al. (2026) — Without formal frameworks, peer mimicry leads to unethical use
3. Include an Annex: Student AI Declaration Form with 4 levels (No use / Limited assistance / Shared production / Majority AI-assisted)
4. Use clear, jargon-free English suitable for a Vietnamese university context
5. Keep each article concise (80-120 words max)
6. End with 3 source links:
   - https://droit.pantheonsorbonne.fr/sites/default/files/2025-10/2025-Charte%20IA-VF%20EDS-Septembre2025.pdf
   - https://researchportal.unamur.be/fr/studentTheses/usages-et-perceptions-de-lintelligence-artificielle-par-les-%C3%A9tudi/
   - https://www.vietnam.vn/en/tri-tue-nhan-tao-trong-dai-hoc-su-dung-nhieu-chuan-bi-it`;

const POSTURE_DESCRIPTIONS = {
  permissive: 'AI use is encouraged across all contexts, provided it is declared and verified by the user.',
  guided: 'AI use is authorized on a course-by-course basis, with each instructor defining rules for their course.',
  restrictive: 'AI use is prohibited by default; it is only authorized in explicitly defined cases communicated in advance.',
};

export async function generatePolicyDraft(
  answers: PolicyAnswers,
  institutionName: string,
): Promise<string> {
  const userPrompt = `Generate an institutional AI charter for the following university:

Institution: ${institutionName || answers.institutionType}
Type & size: ${answers.institutionType}
Observed AI uses on campus: ${answers.observedUses.join(', ')}
Top concerns: ${answers.topConcerns.join(', ')}
Chosen posture: ${answers.posture} — ${POSTURE_DESCRIPTIONS[answers.posture]}
Responsible body: ${answers.responsibleBody}

Generate the complete charter now, following the 5-article structure with "Why this matters" notes, and include the student declaration annex.`;

  const devProxy = typeof window !== 'undefined' && import.meta.env.DEV ? 'http://localhost:3001' : null;

  let content: string;

  if (devProxy) {
    const resp = await fetch(`${devProxy}/functions/v1/ai-advisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemPrompt: POLICY_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });
    if (!resp.ok) throw new Error(`Proxy error: ${resp.status}`);
    const data = await resp.json();
    content = data?.content || '';
  } else {
    const { supabase } = await import('./supabase');
    const { data, error } = await supabase.functions.invoke('ai-advisor', {
      body: {
        systemPrompt: POLICY_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      },
    });
    if (error) throw error;
    content = data?.content || '';
  }

  if (!content) throw new Error('Empty response from AI');
  return content;
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
    (s) => s.role === 'Professors' && s.anxiety?.includes('displacement')
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
  const hasEthicalProf = profStakeholders.some((s) => s.anxiety?.includes('ethical_engagement'));
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

  // ── MOET Strategy Alerts (Nguyen & Hong, 2025) ──

  // Helper: avg score for a dimension (0 if all unknown)
  const dimAvg = (key: DimensionKey): number => {
    const d = dimensions[key];
    const known = [d.tools, d.data, d.culture].filter((v) => v > 0) as number[];
    return known.length > 0 ? known.reduce((a, b) => a + b, 0) / known.length : 0;
  };

  // S1: Infrastructure & Governance → digitalGovernance
  const govScore = dimAvg('digitalGovernance');
  if (govScore > 0 && govScore < 1.5) {
    alerts.push({
      id: 'moet-s1',
      message: 'MOET Strategy S1 gap: your Digital Governance score is critically low. National policy requires shared platforms, high-speed connectivity, and cybersecurity protocols as the absolute foundation (Nguyen & Hong, 2025).',
      severity: 'critical',
      module: 'module1',
    });
  }

  // S2: Equity & Faculty Development → teachingLearning
  const teachScore = dimAvg('teachingLearning');
  if (teachScore > 0 && teachScore < 1.5) {
    alerts.push({
      id: 'moet-s2',
      message: 'MOET Strategy S2 gap: your Teaching & Learning score suggests faculty are not trained for digital innovation. MOET requires intensive teacher training — not just for early adopters, for ALL faculty (Nguyen & Hong, 2025).',
      severity: 'warning',
      module: 'module1',
    });
  }

  // S3: Digital Pedagogy & Administration → academicManagement + administrativeManagement
  const acadScore = dimAvg('academicManagement');
  const adminScore = dimAvg('administrativeManagement');
  if ((acadScore > 0 && acadScore < 1.5) || (adminScore > 0 && adminScore < 1.5)) {
    const weak = [
      acadScore > 0 && acadScore < 1.5 ? 'Academic Management' : '',
      adminScore > 0 && adminScore < 1.5 ? 'Administrative Management' : '',
    ].filter(Boolean).join(' and ');
    alerts.push({
      id: 'moet-s3',
      message: `MOET Strategy S3 gap: your ${weak} score is low. National policy mandates digitized courses, admin services, and public portals (Nguyen & Hong, 2025).`,
      severity: 'warning',
      module: 'module1',
    });
  }

  // S4: Strategic Planning & Stakeholders → institutionalImage + universityExtension
  const imageScore = dimAvg('institutionalImage');
  const extScore = dimAvg('universityExtension');
  if ((imageScore > 0 && imageScore < 1.5) && (extScore > 0 && extScore < 1.5)) {
    alerts.push({
      id: 'moet-s4',
      message: 'MOET Strategy S4 gap: both Institutional Image and University Extension scores are low. MOET requires a steering committee with industry and government partners for long-term digital strategy (Nguyen & Hong, 2025).',
      severity: 'warning',
      module: 'module1',
    });
  }

  // S5: Financing — check if the plan has any budget/financing related task
  if (tasks.length > 0) {
    const budgetKeywords = /budget|financ|fund|invest|resource|cost|alloc/i;
    const hasBudgetTask = tasks.some((t) => budgetKeywords.test(t.name));
    const hasBudgetKpi = kpis.some((k) => budgetKeywords.test(k.name));
    if (!hasBudgetTask && !hasBudgetKpi) {
      alerts.push({
        id: 'moet-s5',
        message: 'MOET Strategy S5 gap: your 90-day plan has no financing or budget action. Without guaranteed resource allocation, transformation stalls. Add a budget task or KPI (Nguyen & Hong, 2025).',
        severity: 'warning',
        module: 'module4',
      });
    }
  }

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
