import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Plus, Trash2, CheckCircle, Lock, RotateCcw, Shield, Edit3, HelpCircle, Loader2, Sparkles } from 'lucide-react';
import { DIMENSIONS, RESISTANCE_BEHAVIORS, ANXIETY_TYPES, MISSING_LEVERS, MISSING_LEVERS_BY_ROLE, STAKEHOLDER_ROLES, DISCIPLINES, POWER_LEVELS, INTEREST_LEVELS } from '../../../lib/constants';
// import { generateCounterMeasure } from '../../../lib/counter-measures'; // ARCHIVED — replaced by AI call
import ConsensusStatusBadge from '../module1/ConsensusStatusBadge';
import { useM2Consensus } from '../../../lib/use-m2-consensus';
import { useAuth } from '../../../lib/auth-context';
import { useStore } from '../../../lib/store';
import { supabase } from '../../../lib/supabase';
import type {
  Stakeholder,
  GroupStakeholderData,
  StakeholderRole,
  Discipline,
  PowerLevel,
  InterestLevel,
  ResistanceBehavior,
  AnxietyType,
  MissingLever,
  PainPoint,
  PestelCategory,
  BarrierType,
} from '../../../types';

const SAVE_DEBOUNCE_MS = 2000;

// ── Tooltip component ──────────────────────────────────────────
function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex ml-1">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="text-gray-400 hover:text-gray-600"
      >
        <HelpCircle size={13} />
      </button>
      {show && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg leading-relaxed">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </span>
      )}
    </span>
  );
}

// ── AI counter-measure generation ──────────────────────────────
async function generateAICounterMeasure(
  stakeholder: {
    name: string;
    role: StakeholderRole;
    discipline?: Discipline;
    power?: PowerLevel;
    interest?: InterestLevel;
    behavior?: ResistanceBehavior;
    anxiety?: AnxietyType;
    missing_lever?: MissingLever;
    linked_pain_point_ids?: string[];
  },
  institutionName: string,
  maturitySummary: string,
  painPoints: PainPoint[],
): Promise<string> {
  // Build pain points context
  const filledPainPoints = painPoints.filter((pp) => pp.text.trim());
  const linkedPainPoints = filledPainPoints.filter((pp) =>
    (stakeholder.linked_pain_point_ids || []).includes(pp.id)
  );

  const painPointsSection = filledPainPoints.length > 0
    ? `\nINSTITUTIONAL PAIN POINTS (identified from morning PESTEL/Barriers workshop):
${filledPainPoints.map((pp, i) => {
  const pestel = pp.pestel_category ? ` [PESTEL: ${pp.pestel_category}]` : '';
  const barrier = pp.barrier_type ? ` [${pp.barrier_type}]` : '';
  return `  ${i + 1}. ${pp.text}${pestel}${barrier}`;
}).join('\n')}
${linkedPainPoints.length > 0
  ? `\nThis stakeholder's resistance is directly linked to: ${linkedPainPoints.map((pp) => `"${pp.text}"`).join(', ')}. Ground your counter-measure in how their specific behavior/anxiety manifests in the context of these pain points.`
  : '\nThis stakeholder has not been linked to a specific pain point — address the institutional context generally.'
}`
    : '';

  const systemPrompt = `You are the DIVE AI Advisor, generating a personalized counter-measure strategy for a specific stakeholder in a Vietnamese university's AI adoption plan.

INSTITUTION: ${institutionName}

MATURITY CONTEXT (from Module 1 diagnostic):
${maturitySummary}${painPointsSection}

RESEARCH BASE (use these to ground your recommendations):

RESISTANCE BEHAVIORS (Deacon et al., 2025):
- Pronounced Refusal: open opposition, vocal rejection. Approach: don't confront directly, identify underlying values, create safe debate spaces.
- Pronounced Opposing: active argumentation, ideological pushback. Approach: co-design the implementation, don't impose top-down.
- Subtle Undermining: passive sabotage, quiet non-compliance. MOST DANGEROUS — invisible until too late. Monitor actual adoption metrics, not stated attitudes.
- Subtle Avoiding: minimization, deflection, "it's just a fad." Use visible quick wins and peer stories.
- Workload overload is the #1 barrier across all roles.

AI ANXIETIES (Cao et al., 2026):
- Learning Anxiety: fear of not mastering technology. Solution: low-stakes hands-on workshops, augment existing workflows.
- Sociotechnical Blindness: fear of being left behind. Can be leveraged positively with communities of practice.
- Job Displacement: existential fear of losing value. Hardest to solve. Frame AI as augmentation. In stable public universities, this is often NOT the real blocker (Verano-Tacoronte, 2025). IMPORTANT: for Students, this anxiety takes a different form — not "I will lose my job" but "I will graduate irrelevant, without the AI skills employers demand." Reframe as career readiness: mastering AI now is a competitive advantage, not a threat.
- Ethical & Pedagogical Barriers (Hong et al., 2026): NOT resistance — this is critical engagement. These people are your ALLIES for drafting AI guidelines.

ROLE-SPECIFIC LEVERS:
- Professors (Singh & Strzelecki, 2026): Do NOT use social pressure or public demos. Offer private, risk-free experimentation. 3 levers: relative advantage (show time savings on THEIR tasks), compatibility (fit their workflow), low complexity (zero friction). Even resistors MUST be trained so they understand how students use AI (Verano-Tacoronte, 2025). Female faculty show lower adoption — design targeted mentoring.
- Students (Bui et al., 2025): Social influence and peer success stories are powerful drivers. Facilitating conditions (devices, WiFi, access) are prerequisites. Partner with industry. Students are LEARNERS, not professionals — do NOT apply faculty disciplinary identity logic to them. Their resistance is not about defending a career; it is about uncertainty, access, and social norms within their peer group.
- Direction (Nguyen & Hong, 2025 — MOET): Need governance structures (steering committees), dedicated budget allocation, strategic vision integrating AI into long-term plans. 5 MOET strategies: S1 Infrastructure, S2 Equity/Faculty Dev, S3 Digital Pedagogy, S4 Strategic Planning, S5 Financing.
- Administration (Deacon et al., 2025): Overwhelmed by workload. Departmental silos prevent data sharing. Legacy paper-based rules block digital workflows. Universities are decentralized — each faculty is a "small kingdom."

DISCIPLINE MODIFIER — applies to Professors only (Cao et al., 2026). Do NOT apply this logic to Students — students are learners, not discipline practitioners, and the research does not support a discipline effect for them:
- STEM: AI anxiety often converts into curiosity or problem-solving drive. Frame AI as a tool that accelerates disciplinary work (faster literature reviews, data analysis, simulations). Lead with concrete efficiency gains. These profiles respond well to hands-on experimentation.
- Humanities / Social Sciences: AI is frequently perceived as a direct threat to disciplinary identity and the irreplaceable value of interpretive, contextual, and critical expertise. Do NOT frame AI as a productivity tool — this reinforces the fear. Instead, explicitly validate that AI cannot replace hermeneutics, close reading, ethnographic judgment, or contextual analysis. Lead with examples from their own field (e.g., AI-assisted corpus analysis, not "AI writes essays"). Engage their critical thinking as an asset: invite them to audit AI outputs, co-author AI use guidelines, or evaluate AI-generated content — positions where their disciplinary expertise is the quality control. Their ethical engagement is a strength, not a blocker.

CULTURAL CONTEXT (Vietnamese universities):
- High Power Distance: people wait for the Boss to decide. Staff may not report problems to "show respect."
- Collectivism & "Saving Face": people agree in meetings but resist quietly afterwards.
- Shared Governance trap: decisions slow because everyone wants input.

RULES:
- Structure your response with exactly 3 short sections using these markdown headers:
  ### 🎯 Approach
  (1-2 sentences: how to engage given their behavior and quadrant)
  ### 🧠 Root Cause
  (1-2 sentences: the specific anxiety and how to address it)
  ### ⚡ This Week
  (1 concrete action the group can take immediately — bold the key action)
- Keep each section tight — max 50 words per section
- Always cite sources inline: "(Author, Year)"
- Be HIGHLY specific: reference behavior type, anxiety, missing lever, and quadrant by name
- Language: English`;

  // Asymmetric rule: block if behavior unknown, allow partial if anxiety/lever unknown
  if (!stakeholder.behavior) {
    throw new Error('BEHAVIOR_UNKNOWN');
  }

  const behaviorEntry = RESISTANCE_BEHAVIORS.find((b) => b.value === stakeholder.behavior);
  const anxietyEntry = stakeholder.anxiety ? ANXIETY_TYPES.find((a) => a.value === stakeholder.anxiety) : null;
  const leverEntry = stakeholder.missing_lever ? MISSING_LEVERS.find((l) => l.value === stakeholder.missing_lever) : null;
  const powerEntry = stakeholder.power ? POWER_LEVELS.find((p) => p.value === stakeholder.power) : null;
  const interestEntry = stakeholder.interest ? INTEREST_LEVELS.find((i) => i.value === stakeholder.interest) : null;

  const quadrant = stakeholder.power && stakeholder.interest
    ? stakeholder.power === 'high' && stakeholder.interest === 'high' ? 'KEY PLAYER — manage closely, highest priority'
    : stakeholder.power === 'high' && stakeholder.interest === 'low' ? 'KEEP SATISFIED — powerful but disengaged, dangerous if hostile'
    : stakeholder.power === 'low' && stakeholder.interest === 'high' ? 'KEEP INFORMED — enthusiastic ally, potential champion'
    : 'MONITOR — low priority, minimal effort'
    : 'Unknown';

  const userMessage = `Generate a counter-measure strategy for this stakeholder:

**Name:** ${stakeholder.name}
**Role:** ${stakeholder.role}${stakeholder.discipline && stakeholder.discipline !== 'Other' ? ` (${stakeholder.discipline})` : ''}

**Power/Interest Matrix:**
- Power: ${powerEntry?.label || 'Unknown'} — ${powerEntry?.description || ''}
- Interest: ${interestEntry?.label || 'Unknown'} — ${interestEntry?.description || ''}
- Quadrant: ${quadrant}

**Lens 1 — Resistance Behavior:** ${behaviorEntry?.label || 'Unknown'}
- Description: ${behaviorEntry?.description || ''}
- Severity: ${(behaviorEntry as { severity?: string })?.severity || 'unknown'}

**Lens 2 — Root Cause (AI Anxiety):** ${anxietyEntry ? `${anxietyEntry.label} — ${anxietyEntry.description} (${anxietyEntry.source})` : 'Unknown — the group could not determine the root anxiety. Acknowledge this uncertainty in your strategy and offer a diagnosis question the group could ask the stakeholder to clarify.'}

**Lens 3 — Missing Adoption Lever:** ${leverEntry ? `${leverEntry.label} — ${leverEntry.description}` : 'Unknown — the group could not identify the missing lever. Acknowledge this and suggest 2 likely candidates based on the role and behavior.'}

Generate a strategy that specifically addresses:
1. HOW to approach this person given their resistance behavior
2. WHY they resist (the root anxiety) and how to address that specific fear${!anxietyEntry ? ' — anxiety is unknown, flag this and suggest a diagnostic question' : ''}
3. WHAT concrete action would provide the missing lever${!leverEntry ? ' — lever is unknown, suggest the 2 most likely candidates given the role' : ''}
4. Their position in the Power/Interest matrix and what that means for prioritization`;

  try {
    const devProxy = import.meta.env.DEV ? 'http://localhost:3001' : null;
    let content: string;

    if (devProxy) {
      const resp = await fetch(`${devProxy}/functions/v1/ai-advisor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
        }),
      });
      if (!resp.ok) throw new Error(`Proxy error: ${resp.status}`);
      const data = await resp.json();
      content = data.content;
    } else {
      const { data, error } = await supabase.functions.invoke('ai-advisor', {
        body: {
          systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
        },
      });
      if (error) throw error;
      content = data.content;
    }

    return content || 'Could not generate counter-measure. Please try again.';
  } catch (err) {
    console.error('AI counter-measure error:', err);
    return 'Error generating counter-measure. Check that the AI service is configured.';
  }
}

// ── Helper: build maturity summary from store ──────────────────
function buildMaturitySummary(store: ReturnType<typeof useStore>): string {
  const dims = store.effectiveDimensions;
  const lines: string[] = [];
  for (const dim of DIMENSIONS) {
    const d = dims[dim.key];
    if (!d) continue;
    const known = [d.tools, d.data, d.culture].filter((v) => v > 0) as number[];
    const avg = known.length > 0 ? (known.reduce((a, b) => a + b, 0) / known.length).toFixed(1) : 'N/A';
    lines.push(`  ${dim.label}: ${avg}/3`);
  }
  return lines.length > 0 ? lines.join('\n') : '(No maturity data yet)';
}

// ── Props ──────────────────────────────────────────────────────
interface Props {
  groupData: GroupStakeholderData;
  isValidator: boolean;
  onRefetch: () => void;
}

const PESTEL_OPTIONS: { value: PestelCategory; label: string; color: string }[] = [
  { value: 'P', label: 'Political', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'E', label: 'Economic', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'S', label: 'Social', color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'T', label: 'Technological', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  { value: 'En', label: 'Environmental', color: 'bg-teal-100 text-teal-700 border-teal-300' },
  { value: 'L', label: 'Legal', color: 'bg-red-100 text-red-700 border-red-300' },
];

export default function M2ConsensusForm({ groupData, isValidator, onRefetch }: Props) {
  const { participant, group } = useAuth();
  const store = useStore();
  const { saveConsensus, validateConsensus, requestReopen, savePainPoints } = useM2Consensus(group?.id);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const painPointsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPainPointsTyping = useRef(false);
  const formRef = useRef<HTMLDivElement>(null);

  const status = groupData.consensusStatus;
  const isEditable = isValidator && (status === 'draft' || status === 'reopened' || status === 'none');
  const isValidated = status === 'validated';
  const isReopenRequested = status === 'reopen_requested';

  // Initialize from existing consensus or empty
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>(() => {
    if (groupData.consensusStakeholders.length > 0) return groupData.consensusStakeholders;
    return [];
  });

  // Pain points state — initialized from server data
  const [painPoints, setPainPoints] = useState<PainPoint[]>(() => {
    if (groupData.painPoints?.length > 0) return groupData.painPoints;
    return [
      { id: crypto.randomUUID(), text: '', pestel_category: undefined, barrier_type: undefined },
      { id: crypto.randomUUID(), text: '', pestel_category: undefined, barrier_type: undefined },
      { id: crypto.randomUUID(), text: '', pestel_category: undefined, barrier_type: undefined },
    ];
  });

  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [generatingCM, setGeneratingCM] = useState<string | null>(null); // stakeholder id being generated
  const [form, setForm] = useState({
    name: '',
    role: 'Professors' as StakeholderRole,
    discipline: 'Other' as Discipline,
    power: 'low' as PowerLevel,
    interest: 'high' as InterestLevel,
    behavior: undefined as ResistanceBehavior | undefined,
    anxiety: undefined as AnxietyType | undefined,
    missing_lever: undefined as MissingLever | undefined,
    notes: '',
    linked_pain_point_ids: [] as string[],
  });

  // Update local state when consensus data arrives from server
  useEffect(() => {
    if (groupData.consensusStakeholders.length > 0) {
      setStakeholders(groupData.consensusStakeholders);
    }
  }, [groupData.consensusStakeholders]);

  // Sync pain points from server (only overwrite if server has data and user is not typing)
  useEffect(() => {
    if (groupData.painPoints?.length > 0 && !isPainPointsTyping.current) {
      setPainPoints(groupData.painPoints);
      store.setPainPoints(groupData.painPoints);
    }
  }, [groupData.painPoints]); // eslint-disable-line react-hooks/exhaustive-deps

  const debouncedSavePainPoints = useCallback(
    (newPainPoints: PainPoint[]) => {
      isPainPointsTyping.current = true;
      store.setPainPoints(newPainPoints);
      if (painPointsTimer.current) clearTimeout(painPointsTimer.current);
      painPointsTimer.current = setTimeout(async () => {
        await savePainPoints(newPainPoints);
        // Keep the lock for one full poll cycle (6s) after save completes
        // so the next poll doesn't overwrite with stale data
        setTimeout(() => { isPainPointsTyping.current = false; }, 6000);
      }, SAVE_DEBOUNCE_MS);
    },
    [savePainPoints, store]
  );

  // Debounced save + update store so chatbot sees data immediately
  const debouncedSave = useCallback(
    (newStakeholders: Stakeholder[]) => {
      if (!isEditable) return;
      // Update store immediately so AI chatbot sees current data
      store.setConsensusStakeholders(newStakeholders);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        setSaving(true);
        await saveConsensus(newStakeholders);
        setSaving(false);
      }, SAVE_DEBOUNCE_MS);
    },
    [isEditable, saveConsensus, store]
  );

  const handleRemove = (id: string) => {
    if (!isEditable) return;
    const updated = stakeholders.filter((s) => s.id !== id);
    setStakeholders(updated);
    debouncedSave(updated);
  };

  const handleAdd = () => {
    if (!isEditable) return;

    const newStakeholder: Stakeholder = {
      id: crypto.randomUUID(),
      group_id: group?.id || '',
      name: form.name,
      role: form.role,
      discipline: form.discipline,
      power: form.power,
      interest: form.interest,
      behavior: form.behavior ?? undefined,
      anxiety: form.anxiety ?? undefined,
      missing_lever: form.missing_lever ?? undefined,
      notes: form.notes,
      generated_counter_measure: undefined,
      linked_pain_point_ids: form.linked_pain_point_ids,
    };

    const updated = [...stakeholders, newStakeholder];
    setStakeholders(updated);
    debouncedSave(updated);
    setForm({ name: '', role: 'Professors', discipline: 'Other', power: 'low', interest: 'high', behavior: undefined, anxiety: undefined, missing_lever: undefined, notes: '', linked_pain_point_ids: [] });
    setShowForm(false);
  };

  const handleStartEdit = (s: Stakeholder) => {
    if (!isEditable) return;
    setEditingId(s.id!);
    setForm({
      name: s.name,
      role: s.role,
      discipline: s.discipline || 'Other',
      power: s.power || 'low',
      interest: s.interest || 'high',
      behavior: s.behavior ?? undefined,
      anxiety: s.anxiety ?? undefined,
      missing_lever: s.missing_lever ?? undefined,
      notes: s.notes || '',
      linked_pain_point_ids: s.linked_pain_point_ids || [],
    });
    setShowForm(true);
    // Scroll to form after render
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleSaveEdit = () => {
    if (!editingId || !isEditable) return;

    const updated = stakeholders.map((s) =>
      s.id === editingId
        ? { ...s, ...form, generated_counter_measure: s.generated_counter_measure }
        : s
    );
    setStakeholders(updated);
    debouncedSave(updated);
    setEditingId(null);
    setForm({ name: '', role: 'Professors', discipline: 'Other', power: 'low', interest: 'high', behavior: undefined, anxiety: undefined, missing_lever: undefined, notes: '', linked_pain_point_ids: [] });
    setShowForm(false);
  };

  // Generate AI counter-measure for a single stakeholder
  const handleGenerateCounterMeasure = async (stakeholderId: string) => {
    const s = stakeholders.find((st) => st.id === stakeholderId);
    if (!s || !s.behavior) return; // block if behavior unknown
    setGeneratingCM(stakeholderId);
    try {
      const maturitySummary = buildMaturitySummary(store);
      const counterMeasure = await generateAICounterMeasure(
        {
          name: s.name,
          role: s.role,
          discipline: s.discipline,
          power: s.power,
          interest: s.interest,
          behavior: s.behavior,
          anxiety: s.anxiety,
          missing_lever: s.missing_lever,
          linked_pain_point_ids: s.linked_pain_point_ids,
        },
        store.institutionName,
        maturitySummary,
        painPoints,
      );
      const updated = stakeholders.map((st) =>
        st.id === stakeholderId ? { ...st, generated_counter_measure: counterMeasure } : st
      );
      setStakeholders(updated);
      debouncedSave(updated);
    } catch {
      // generation failed silently
    } finally {
      setGeneratingCM(null);
    }
  };

  // Generate all counter-measures at once (skip those without behavior)
  const handleGenerateAll = async () => {
    const toGenerate = stakeholders.filter((s) => !s.generated_counter_measure && s.behavior);
    for (const s of toGenerate) {
      await handleGenerateCounterMeasure(s.id!);
    }
  };

  const handleValidate = async () => {
    if (!participant?.id || !isValidator) return;
    setConfirming(false);
    await saveConsensus(stakeholders);
    await validateConsensus(participant.id);
    store.setConsensusStakeholders(stakeholders);
    store.setM2ConsensusStatus('validated');
    onRefetch();
  };

  const handleRequestReopen = async () => {
    if (!participant?.id || !isValidator) return;
    await requestReopen(participant.id);
    store.setM2ConsensusStatus('reopen_requested');
    onRefetch();
  };

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (painPointsTimer.current) clearTimeout(painPointsTimer.current);
    };
  }, []);

  const missingCounterMeasures = stakeholders.filter((s) => !s.generated_counter_measure).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ConsensusStatusBadge status={status} />
          {saving && <span className="text-xs text-gray-400 animate-pulse">Saving...</span>}
        </div>
        <div className="flex gap-2">
          {isEditable && (
            confirming ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Lock this stakeholder mapping for the group?</span>
                <button onClick={handleValidate} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors">
                  <CheckCircle size={12} /> Confirm
                </button>
                <button onClick={() => setConfirming(false)} className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium rounded-lg transition-colors">
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirming(true)} disabled={stakeholders.length === 0} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <CheckCircle size={14} /> Validate Group Mapping
              </button>
            )
          )}
          {isValidated && isValidator && (
            <button onClick={handleRequestReopen} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs font-medium rounded-lg transition-colors">
              <RotateCcw size={12} /> Request Modification
            </button>
          )}
          {isReopenRequested && (
            <span className="text-xs text-orange-600 font-medium">Waiting for facilitator approval...</span>
          )}
        </div>
      </div>

      {/* Locked overlay */}
      {isValidated && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          <Lock size={14} />
          This group stakeholder mapping has been validated and is now used by Modules 3-4 and the AI Advisor.
        </div>
      )}

      {/* Not validator info */}
      {!isValidator && !isValidated && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          <Lock size={14} />
          Only the validator can edit. Discuss with your group and tell them what to change.
        </div>
      )}

      {/* ── Step 0: Top 3 Pain Points ─────────────────────────── */}
      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Step 0 — Top 3 Pain Points from this morning</span>
          <Tooltip text="J. Parisse's workshop task: use the PESTEL and Barrier lists to identify the top 3 problems in your department. Enter them here — they will inform your stakeholder analysis and AI counter-measures." />
        </div>
        <p className="text-xs text-amber-600 mb-3">From J. Parisse's PESTEL + Barriers workshop — what are your institution's 3 main pain points for AI adoption?</p>
        <div className="space-y-3">
          {painPoints.map((pp, idx) => (
            <div key={pp.id} className="bg-white rounded-lg border border-amber-200 p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-200 text-amber-800 text-[10px] font-bold flex items-center justify-center">{idx + 1}</span>
                <input
                  type="text"
                  value={pp.text}
                  disabled={!isEditable}
                  onChange={(e) => {
                    const updated = painPoints.map((p, i) => i === idx ? { ...p, text: e.target.value } : p);
                    setPainPoints(updated);
                    debouncedSavePainPoints(updated);
                  }}
                  placeholder={`Pain point #${idx + 1} — e.g., "No IT support for classroom tools"`}
                  className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-amber-400 focus:border-amber-400 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              <div className="flex flex-wrap gap-2 ml-7">
                {/* PESTEL category */}
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[10px] text-gray-400 mr-0.5">PESTEL:</span>
                  {PESTEL_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={!isEditable}
                      onClick={() => {
                        const updated = painPoints.map((p, i) =>
                          i === idx ? { ...p, pestel_category: p.pestel_category === opt.value ? undefined : opt.value as PestelCategory } : p
                        );
                        setPainPoints(updated);
                        debouncedSavePainPoints(updated);
                      }}
                      className={`px-1.5 py-0.5 rounded border text-[10px] font-medium transition-all disabled:opacity-50 ${
                        pp.pestel_category === opt.value ? opt.color : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {opt.value}
                    </button>
                  ))}
                </div>
                {/* Barrier type */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-400 mr-0.5">Type:</span>
                  {(['structural', 'behavioral'] as BarrierType[]).map((bt) => (
                    <button
                      key={bt}
                      type="button"
                      disabled={!isEditable}
                      onClick={() => {
                        const updated = painPoints.map((p, i) =>
                          i === idx ? { ...p, barrier_type: p.barrier_type === bt ? undefined : bt } : p
                        );
                        setPainPoints(updated);
                        debouncedSavePainPoints(updated);
                      }}
                      className={`px-1.5 py-0.5 rounded border text-[10px] font-medium capitalize transition-all disabled:opacity-50 ${
                        pp.barrier_type === bt
                          ? bt === 'structural' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-orange-100 text-orange-700 border-orange-300'
                          : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {bt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        {!isEditable && painPoints.every((pp) => !pp.text) && (
          <p className="text-xs text-amber-500 italic mt-2">Waiting for the validator to enter the pain points...</p>
        )}
      </div>

      {/* Stakeholder list */}
      <div className={!isEditable && !isValidated ? 'opacity-60 pointer-events-none' : !isEditable ? '' : ''}>
        <div className="space-y-3">
          {stakeholders.length === 0 && isEditable && (
            <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
              No stakeholders yet. Click "Add Stakeholder" to import the people you identified this morning.
            </div>
          )}

          {stakeholders.map((s) => (
            <div key={s.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{s.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">
                      {s.role} {s.discipline && s.discipline !== 'Other' ? `(${s.discipline})` : ''}
                    </span>
                    {s.power && s.interest && (
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        s.power === 'high' && s.interest === 'high'
                          ? 'bg-danger-100 text-danger-700'
                          : s.power === 'high' && s.interest === 'low'
                            ? 'bg-warning-100 text-warning-700'
                            : s.power === 'low' && s.interest === 'high'
                              ? 'bg-primary-100 text-primary-700'
                              : 'bg-gray-100 text-gray-500'
                      }`}>
                        {s.power === 'high' && s.interest === 'high' && 'Key Player'}
                        {s.power === 'high' && s.interest === 'low' && 'Keep Satisfied'}
                        {s.power === 'low' && s.interest === 'high' && 'Keep Informed'}
                        {s.power === 'low' && s.interest === 'low' && 'Monitor'}
                      </span>
                    )}
                  </div>
                </div>
                {isEditable && (
                  <div className="flex gap-1">
                    <button onClick={() => handleStartEdit(s)} className="text-gray-400 hover:text-primary-500 p-1">
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => handleRemove(s.id!)} className="text-gray-400 hover:text-danger-500 p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                  s.behavior === 'supportive' ? 'bg-accent-50 text-accent-700 border-accent-200' : 'bg-danger-50 text-danger-700 border-danger-200'
                }`}>
                  {RESISTANCE_BEHAVIORS.find((b) => b.value === s.behavior)?.label}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-warning-50 text-warning-700 border border-warning-200">
                  {ANXIETY_TYPES.find((a) => a.value === s.anxiety)?.label}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary-50 text-primary-700 border border-primary-200">
                  {MISSING_LEVERS.find((l) => l.value === s.missing_lever)?.label}
                </span>
              </div>

              {/* Counter-measure or generate button */}
              {s.generated_counter_measure ? (
                <div className={`rounded-lg border overflow-hidden ${
                  s.behavior === 'supportive' || s.anxiety === 'ethical_engagement'
                    ? 'border-accent-200'
                    : 'border-primary-200'
                }`}>
                  {/* Header bar */}
                  <div className={`flex items-center gap-1.5 px-3 py-2 ${
                    s.behavior === 'supportive' || s.anxiety === 'ethical_engagement'
                      ? 'bg-accent-100'
                      : 'bg-primary-100'
                  }`}>
                    {s.behavior === 'supportive' || s.anxiety === 'ethical_engagement' ? (
                      <Shield size={12} className="text-accent-600" />
                    ) : (
                      <Sparkles size={12} className="text-primary-600" />
                    )}
                    <span className="font-semibold text-[10px] uppercase tracking-wider text-gray-600">
                      {s.behavior === 'supportive' ? 'Leverage Strategy' : 'AI Counter-Measure'}
                    </span>
                  </div>
                  {/* Content */}
                  <div className={`px-3 py-3 ${
                    s.behavior === 'supportive' || s.anxiety === 'ethical_engagement'
                      ? 'bg-accent-50'
                      : 'bg-primary-50'
                  }`}>
                  <div className="prose prose-sm prose-gray max-w-none text-gray-700
                    [&>h3]:text-[11px] [&>h3]:font-bold [&>h3]:uppercase [&>h3]:tracking-wider [&>h3]:text-gray-500 [&>h3]:mt-3 [&>h3]:mb-1 [&>h3:first-child]:mt-0
                    [&>p]:text-xs [&>p]:leading-relaxed [&>p]:mb-0
                    [&>ul]:text-xs [&>ul]:my-1 [&>ul]:pl-4
                    [&>ol]:text-xs [&>ol]:my-1 [&>ol]:pl-4
                    [&>li]:mb-0.5
                    [&>strong]:font-semibold [&>strong]:text-gray-900">
                    <ReactMarkdown>{s.generated_counter_measure}</ReactMarkdown>
                  </div>
                  {isEditable && (
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={() => handleGenerateCounterMeasure(s.id!)}
                        disabled={generatingCM !== null || !s.behavior}
                        className="text-[10px] text-gray-400 hover:text-primary-500 underline disabled:opacity-40 disabled:cursor-not-allowed"
                        title={!s.behavior ? 'Set Lens 1 (behavior) to enable regeneration' : 'Regenerate counter-measure'}
                      >
                        Regenerate
                      </button>
                    </div>
                  )}
                  </div>
                </div>
              ) : (
                isEditable && (
                  s.behavior ? (
                    <button
                      onClick={() => handleGenerateCounterMeasure(s.id!)}
                      disabled={generatingCM !== null}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-600 text-xs font-medium rounded-lg border border-primary-200 transition-colors disabled:opacity-50"
                    >
                      {generatingCM === s.id ? (
                        <><Loader2 size={12} className="animate-spin" /> Generating...</>
                      ) : (
                        <><Sparkles size={12} /> Generate AI Counter-Measure</>
                      )}
                    </button>
                  ) : (
                    <p className="text-[10px] text-warning-600 italic">Set Lens 1 (behavior) to generate a counter-measure.</p>
                  )
                )
              )}
            </div>
          ))}
        </div>

        {/* Generate all button */}
        {isEditable && stakeholders.length > 0 && missingCounterMeasures > 0 && (
          <button
            onClick={handleGenerateAll}
            disabled={generatingCM !== null}
            className="mt-3 flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 w-full justify-center"
          >
            {generatingCM !== null ? (
              <><Loader2 size={14} className="animate-spin" /> Generating counter-measures...</>
            ) : (
              <><Sparkles size={14} /> Generate All Counter-Measures ({missingCounterMeasures})</>
            )}
          </button>
        )}

        {/* Add/Edit form */}
        {isEditable && showForm && (
          <div ref={formRef} className="mt-4 bg-white rounded-lg border-2 border-primary-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">
              {editingId ? 'Edit Stakeholder' : 'Add Stakeholder'}
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Name / Group</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Faculty of Engineering"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                <select value={form.role} onChange={(e) => {
                    const newRole = e.target.value as StakeholderRole;
                    const firstLever = MISSING_LEVERS_BY_ROLE[newRole][0].value as MissingLever;
                    setForm({ ...form, role: newRole, missing_lever: firstLever });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
                  {STAKEHOLDER_ROLES.map((r) => (<option key={r} value={r}>{r}</option>))}
                </select>
              </div>
              {form.role === 'Professors' && (
                <div>
                  <label className="flex items-center text-xs font-medium text-gray-600 mb-1">
                    Discipline
                    <Tooltip text="STEM faculty tend to reframe AI anxiety as a challenge to solve. Humanities & Social Sciences faculty often perceive AI as a threat to their disciplinary identity and interpretive expertise — they need fundamentally different interventions (Cao et al., 2026)." />
                  </label>
                  <select value={form.discipline} onChange={(e) => setForm({ ...form, discipline: e.target.value as Discipline })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
                    {DISCIPLINES.map((d) => (<option key={d} value={d}>{d}</option>))}
                  </select>
                </div>
              )}
            </div>

            {/* Power / Interest */}
            <div className="mb-4">
              <label className="flex items-center text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                Power / Interest Matrix
                <Tooltip text="From J. Parisse's morning session. Power = can they make or block decisions? Interest = how much do they care about this AI initiative? This determines your engagement strategy." />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center text-[10px] text-gray-500 mb-1">
                    Power
                    <Tooltip text="High Power: rectors, deans, ministry officials who can approve or veto. Low Power: junior faculty, students, admin staff with limited formal authority." />
                  </label>
                  <div className="flex gap-2">
                    {POWER_LEVELS.map((p) => (
                      <button key={p.value} onClick={() => setForm({ ...form, power: p.value as PowerLevel })}
                        className={`flex-1 p-2 rounded-lg border text-sm transition-all ${form.power === p.value ? 'border-primary-400 bg-primary-50 font-medium' : 'border-gray-200 hover:border-gray-300'}`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="flex items-center text-[10px] text-gray-500 mb-1">
                    Interest
                    <Tooltip text="High Interest: directly affected by or invested in AI adoption. Low Interest: indifferent, unaware, or not personally impacted." />
                  </label>
                  <div className="flex gap-2">
                    {INTEREST_LEVELS.map((i) => (
                      <button key={i.value} onClick={() => setForm({ ...form, interest: i.value as InterestLevel })}
                        className={`flex-1 p-2 rounded-lg border text-sm transition-all ${form.interest === i.value ? 'border-primary-400 bg-primary-50 font-medium' : 'border-gray-200 hover:border-gray-300'}`}>
                        {i.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 italic">
                {form.power === 'high' && form.interest === 'high' && 'Key Player — manage closely, highest priority'}
                {form.power === 'high' && form.interest === 'low' && "Keep Satisfied — powerful but disengaged, don't let them become hostile"}
                {form.power === 'low' && form.interest === 'high' && 'Keep Informed — enthusiastic allies, potential champions'}
                {form.power === 'low' && form.interest === 'low' && 'Monitor — minimal effort needed'}
              </p>
            </div>

            {/* Triple diagnostic */}
            <div className="space-y-4 mb-4">
              <div>
                <label className="flex items-center text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                  Lens 1: How do they resist?
                  <Tooltip text="Deacon et al. (2025) identified 4 resistance behaviors in universities. Subtle forms are more dangerous because they're invisible until it's too late. 'Supportive' means this person is an ally — a valuable asset to leverage." />
                </label>
                {!form.behavior && (
                  <p className="text-xs text-warning-600 mb-2 font-medium">⚠ Required — counter-measure generation is blocked until this is filled.</p>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {RESISTANCE_BEHAVIORS.map((b) => (
                    <button key={b.value} onClick={() => setForm({ ...form, behavior: b.value as ResistanceBehavior })}
                      className={`text-left p-3 rounded-lg border text-sm transition-all ${
                        form.behavior === b.value
                          ? b.value === 'supportive' ? 'border-accent-400 bg-accent-50' : 'border-danger-400 bg-danger-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <div className="font-medium text-gray-900">{b.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{b.description}</div>
                    </button>
                  ))}
                  <button onClick={() => setForm({ ...form, behavior: undefined })}
                    className={`text-left p-3 rounded-lg border text-sm transition-all col-span-2 ${
                      form.behavior === undefined ? 'border-gray-400 bg-gray-100' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <div className="font-medium text-gray-500">I don't know yet</div>
                    <div className="text-xs text-gray-400 mt-0.5">Counter-measure generation will be unavailable until this is filled.</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="flex items-center text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                  Lens 2: Why do they resist?
                  <Tooltip text="Cao et al. (2026) identified 3 types of AI anxiety. The root cause determines which solution works. 'Ethical engagement' (Hong et al., 2026) is actually positive — these people should help draft AI guidelines, not be treated as resistors." />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ANXIETY_TYPES.map((a) => (
                    <button key={a.value} onClick={() => setForm({ ...form, anxiety: a.value as AnxietyType })}
                      className={`text-left p-3 rounded-lg border text-sm transition-all ${
                        form.anxiety === a.value
                          ? a.value === 'ethical_engagement' ? 'border-accent-400 bg-accent-50' : 'border-warning-400 bg-warning-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <div className="font-medium text-gray-900">{a.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{a.description}</div>
                      <div className="text-[10px] text-gray-400 mt-1">{a.source}</div>
                    </button>
                  ))}
                  <button onClick={() => setForm({ ...form, anxiety: undefined })}
                    className={`text-left p-3 rounded-lg border text-sm transition-all col-span-2 ${
                      form.anxiety === undefined ? 'border-gray-400 bg-gray-100' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <div className="font-medium text-gray-500">I don't know yet</div>
                    <div className="text-xs text-gray-400 mt-0.5">Counter-measure can still be generated — Claude will note the uncertainty.</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="flex items-center text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                  Lens 3: What lever is missing?
                  <Tooltip text={
                    form.role === 'Professors'
                      ? 'Singh & Strzelecki (2026): professors adopt AI when 3 conditions are met — they see a clear advantage, it fits their workflow, and it\'s easy to use. Which is missing?'
                      : form.role === 'Students'
                        ? 'Bui et al. (2025): students adopt AI through social influence, peer success stories, and facilitating conditions (access, devices, connectivity). Which is missing?'
                        : form.role === 'Direction'
                          ? 'Nguyen & Hong (2025) / MOET policy: leadership needs governance structures, dedicated budget, and strategic vision to drive AI adoption. Which is missing?'
                          : 'Deacon et al. (2025): admin staff face workload overload, departmental silos, and legacy paper-based rules as barriers to digital tools. Which is the main blocker?'
                  } />
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {MISSING_LEVERS_BY_ROLE[form.role].map((l) => (
                    <button key={l.value} onClick={() => setForm({ ...form, missing_lever: l.value as MissingLever })}
                      className={`text-left p-3 rounded-lg border text-sm transition-all ${
                        form.missing_lever === l.value ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <div className="font-medium text-gray-900">{l.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{l.description}</div>
                    </button>
                  ))}
                  <button onClick={() => setForm({ ...form, missing_lever: undefined })}
                    className={`text-left p-3 rounded-lg border text-sm transition-all col-span-3 ${
                      form.missing_lever === undefined ? 'border-gray-400 bg-gray-100' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <div className="font-medium text-gray-500">I don't know yet</div>
                    <div className="text-xs text-gray-400 mt-0.5">Counter-measure can still be generated — Claude will note the uncertainty.</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Link to pain points */}
            {painPoints.some((pp) => pp.text.trim()) && (
              <div className="mb-4">
                <label className="flex items-center text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                  Linked Pain Points
                  <Tooltip text="Is this person's resistance connected to one of your 3 institutional pain points? Select all that apply — Claude will use this to generate a more targeted counter-measure." />
                </label>
                <div className="space-y-1.5">
                  {painPoints.filter((pp) => pp.text.trim()).map((pp) => {
                    const isLinked = (form.linked_pain_point_ids || []).includes(pp.id);
                    const pestelOpt = PESTEL_OPTIONS.find((o) => o.value === pp.pestel_category);
                    return (
                      <button
                        key={pp.id}
                        type="button"
                        onClick={() => {
                          const current = form.linked_pain_point_ids || [];
                          const updated = isLinked
                            ? current.filter((id) => id !== pp.id)
                            : [...current, pp.id];
                          setForm({ ...form, linked_pain_point_ids: updated });
                        }}
                        className={`w-full text-left flex items-start gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                          isLinked ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-amber-300 bg-white'
                        }`}
                      >
                        <span className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center ${
                          isLinked ? 'border-amber-500 bg-amber-500' : 'border-gray-300'
                        }`}>
                          {isLinked && <CheckCircle size={10} className="text-white" />}
                        </span>
                        <span className="flex-1 text-gray-700">{pp.text}</span>
                        {pestelOpt && (
                          <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium border ${pestelOpt.color}`}>{pestelOpt.value}</span>
                        )}
                        {pp.barrier_type && (
                          <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium capitalize border ${
                            pp.barrier_type === 'structural' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-orange-50 text-orange-600 border-orange-200'
                          }`}>{pp.barrier_type}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes (optional)</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                placeholder="Additional context..." />
            </div>

            <div className="flex gap-2">
              <button onClick={editingId ? handleSaveEdit : handleAdd} disabled={!form.name.trim()}
                className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {editingId ? 'Save Changes' : 'Add Stakeholder'}
              </button>
              <button onClick={() => { setShowForm(false); setEditingId(null); }}
                className="px-4 py-2 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {isEditable && !showForm && (
          <button onClick={() => { setEditingId(null); setForm({ name: '', role: 'Professors', discipline: 'Other', power: 'low', interest: 'high', behavior: undefined, anxiety: undefined, missing_lever: undefined, notes: '', linked_pain_point_ids: [] }); setShowForm(true); }}
            className="mt-4 flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 text-gray-500 text-sm font-medium rounded-lg hover:border-primary-400 hover:text-primary-600 transition-colors w-full justify-center">
            <Plus size={16} /> Add Stakeholder
          </button>
        )}
      </div>

      {/* Summary stats */}
      {stakeholders.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
            Group Overview
          </h4>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-gray-900">{stakeholders.length}</div>
              <div className="text-xs text-gray-500">Stakeholders</div>
            </div>
            <div>
              <div className="text-xl font-bold text-danger-600">
                {stakeholders.filter((s) => s.behavior?.startsWith('subtle')).length}
              </div>
              <div className="text-xs text-gray-500">Subtle resistance</div>
            </div>
            <div>
              <div className="text-xl font-bold text-accent-600">
                {stakeholders.filter((s) => s.behavior === 'supportive' || s.anxiety === 'ethical_engagement').length}
              </div>
              <div className="text-xs text-gray-500">Allies</div>
            </div>
            <div>
              <div className="text-xl font-bold text-primary-600">
                {stakeholders.filter((s) => s.generated_counter_measure).length}/{stakeholders.length}
              </div>
              <div className="text-xs text-gray-500">AI strategies</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
