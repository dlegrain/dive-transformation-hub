import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, BarChart2, Download, CheckCircle } from 'lucide-react';
import { useStore } from '../../../lib/store';
import type { SolutionTarget, DifficultyLevel } from '../../../types';

// ── Data ──────────────────────────────────────────────────────────────────────

const TOOL_OPTIONS = [
  { value: 'chatgpt', label: 'ChatGPT / GPT-4' },
  { value: 'gemini', label: 'Google Gemini' },
  { value: 'copilot', label: 'Microsoft Copilot' },
  { value: 'notebooklm', label: 'NotebookLM' },
  { value: 'midjourney', label: 'Image generators (Midjourney, DALL-E…)' },
  { value: 'code_ai', label: 'Code assistants (GitHub Copilot, Cursor…)' },
  { value: 'translation', label: 'AI translation tools (DeepL, Google Translate…)' },
  { value: 'other', label: 'Other / home-grown tools' },
];

const USE_CASE_OPTIONS = [
  { value: 'content_creation', label: 'Creating course content or materials' },
  { value: 'feedback', label: 'Giving feedback on student work' },
  { value: 'research', label: 'Research & literature review' },
  { value: 'admin', label: 'Administrative tasks (emails, reports, scheduling)' },
  { value: 'assessment', label: 'Designing or grading assessments' },
  { value: 'student_support', label: 'Student tutoring or Q&A support' },
  { value: 'code', label: 'Writing or reviewing code' },
  { value: 'translation', label: 'Translation or multilingual communication' },
];

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Several times a week' },
  { value: 'monthly', label: 'Occasionally (a few times a month)' },
  { value: 'rarely', label: 'Rarely — I\'m still exploring' },
  { value: 'never', label: 'I haven\'t used AI tools yet' },
];

const BARRIER_OPTIONS = [
  { value: 'no_time', label: 'No time to learn new tools' },
  { value: 'no_policy', label: 'No clear institutional policy' },
  { value: 'reliability', label: 'Concerns about accuracy / hallucinations' },
  { value: 'privacy', label: 'Data privacy concerns' },
  { value: 'skills', label: 'Lack of technical skills' },
  { value: 'resistance', label: 'Personal resistance or ethical concerns' },
  { value: 'no_need', label: 'I don\'t see a clear use case for my work' },
];

const READINESS_OPTIONS = [
  { value: 'leading', label: 'Leading — I\'m already coaching others' },
  { value: 'adopting', label: 'Adopting — I use AI regularly in my work' },
  { value: 'exploring', label: 'Exploring — I try it occasionally' },
  { value: 'skeptical', label: 'Skeptical — I\'m not convinced yet' },
  { value: 'waiting', label: 'Waiting — I\'ll adopt once the policy is clear' },
];

// ── Insight box ───────────────────────────────────────────────────────────────

function InsightBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 p-3 bg-primary-50 border border-primary-100 rounded-lg text-xs text-primary-800 leading-relaxed">
      {children}
    </div>
  );
}

// ── Summary view ──────────────────────────────────────────────────────────────

interface Answers {
  role: string;
  department: string;
  toolsUsed: string[];
  useCases: string[];
  frequency: string;
  barriers: string[];
  readiness: string;
  openFeedback: string;
}

function SummaryView({ answers }: { answers: Answers }) {
  const label = (options: { value: string; label: string }[], value: string) =>
    options.find((o) => o.value === value)?.label ?? value;

  const labels = (options: { value: string; label: string }[], values: string[]) =>
    values.map((v) => label(options, v)).join(', ') || '—';

  const rows = [
    { key: 'Role', value: answers.role || '—' },
    { key: 'Department', value: answers.department || '—' },
    { key: 'AI tools used', value: labels(TOOL_OPTIONS, answers.toolsUsed) },
    { key: 'Use cases', value: labels(USE_CASE_OPTIONS, answers.useCases) },
    { key: 'Frequency', value: label(FREQUENCY_OPTIONS, answers.frequency) },
    { key: 'Main barriers', value: labels(BARRIER_OPTIONS, answers.barriers) },
    { key: 'Readiness level', value: label(READINESS_OPTIONS, answers.readiness) },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle size={16} className="text-accent-600" />
        <span className="font-semibold text-gray-900">Your AI usage profile</span>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        This snapshot will be saved to your Module 3 toolkit. Use it to brief your rector or AI steering committee on where your team stands today.
      </p>
      <div className="rounded-lg border border-gray-200 overflow-hidden mb-4">
        {rows.map((row, i) => (
          <div
            key={row.key}
            className={`flex gap-3 px-4 py-2.5 text-sm ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
          >
            <span className="w-36 shrink-0 text-gray-500 font-medium">{row.key}</span>
            <span className="text-gray-800">{row.value}</span>
          </div>
        ))}
      </div>
      {answers.openFeedback && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-500 mb-1">Your notes</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{answers.openFeedback}</p>
        </div>
      )}
      <p className="text-xs text-gray-400 mt-3">
        Tip: once all participants have completed this, your facilitator can build a consolidated map of AI adoption across your institution.
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface UsageMappingModalProps {
  onClose: () => void;
}

export default function UsageMappingModal({ onClose }: UsageMappingModalProps) {
  const { setSolutions } = useStore();

  const [step, setStep] = useState(0); // 0-5 = questions, 6 = summary
  const [answers, setAnswers] = useState<Answers>({
    role: '',
    department: '',
    toolsUsed: [],
    useCases: [],
    frequency: '',
    barriers: [],
    readiness: '',
    openFeedback: '',
  });

  const TOTAL_STEPS = 6;

  const toggleMulti = (field: 'toolsUsed' | 'useCases' | 'barriers', value: string) => {
    setAnswers((prev) => {
      const current = prev[field];
      return {
        ...prev,
        [field]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
      };
    });
  };

  const canProceed = () => {
    switch (step) {
      case 0: return answers.role.trim().length > 0;
      case 1: return answers.toolsUsed.length > 0 || answers.frequency === 'never';
      case 2: return answers.useCases.length > 0 || answers.frequency === 'never';
      case 3: return answers.frequency.length > 0;
      case 4: return true; // barriers optional
      case 5: return answers.readiness.length > 0;
      default: return false;
    }
  };

  const handleSave = () => {
    const toolList = answers.toolsUsed.map((v) => TOOL_OPTIONS.find((o) => o.value === v)?.label ?? v).join(', ');
    const useCaseList = answers.useCases.map((v) => USE_CASE_OPTIONS.find((o) => o.value === v)?.label ?? v).join(', ');
    const readinessLabel = READINESS_OPTIONS.find((o) => o.value === answers.readiness)?.label ?? answers.readiness;
    const frequencyLabel = FREQUENCY_OPTIONS.find((o) => o.value === answers.frequency)?.label ?? answers.frequency;
    const barrierList = answers.barriers.map((v) => BARRIER_OPTIONS.find((o) => o.value === v)?.label ?? v).join(', ');

    const summary = [
      `## AI Usage Mapping — ${answers.role}${answers.department ? `, ${answers.department}` : ''}`,
      ``,
      `**Readiness level:** ${readinessLabel}`,
      `**Usage frequency:** ${frequencyLabel}`,
      `**Tools used:** ${toolList || 'None yet'}`,
      `**Use cases:** ${useCaseList || 'None yet'}`,
      `**Main barriers:** ${barrierList || 'None identified'}`,
      answers.openFeedback ? `\n**Notes:** ${answers.openFeedback}` : '',
    ].filter(Boolean).join('\n');

    setSolutions((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        group_id: '',
        name: 'AI Usage Map',
        target: 'Administration' as SolutionTarget,
        difficulty: 'Low' as DifficultyLevel,
        status: 'Planned',
        problem_solved: `Institutional snapshot of current AI adoption: tools used, use cases, barriers, and readiness level across staff. Baseline for your transformation roadmap.`,
        vibe_coding_notes: summary,
        platform_used: 'DIVE Usage Mapping',
        assigned_phase: 1,
        sort_order: prev.length,
      } as any,
    ]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <BarChart2 size={18} className="text-accent-600" />
            <span className="font-semibold text-gray-900">AI Usage Mapping</span>
            {step < TOTAL_STEPS && (
              <span className="text-xs text-gray-400 ml-1">Step {step + 1} of {TOTAL_STEPS}</span>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* Progress bar */}
        {step < TOTAL_STEPS && (
          <div className="h-1 bg-gray-100">
            <div
              className="h-1 bg-accent-500 transition-all duration-300"
              style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* Step 0 — Role */}
          {step === 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">What is your role?</h3>
              <p className="text-sm text-gray-500 mb-3">And optionally, your department or faculty.</p>
              <input
                type="text"
                value={answers.role}
                onChange={(e) => setAnswers({ ...answers, role: e.target.value })}
                placeholder="e.g., Associate Professor, Academic Director, IT Manager…"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none mb-3"
                autoFocus
              />
              <input
                type="text"
                value={answers.department}
                onChange={(e) => setAnswers({ ...answers, department: e.target.value })}
                placeholder="Department or faculty (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none"
              />
              <InsightBox>
                <strong>Why map usage?</strong> You can't steer AI adoption without knowing the baseline. The UNamur study (Coumont, 2025) found that <strong>99% of students</strong> already use AI — but most faculty had no idea how extensively. A usage map turns gut feelings into institutional evidence.
              </InsightBox>
            </div>
          )}

          {/* Step 1 — Tools */}
          {step === 1 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Which AI tools do you currently use?</h3>
              <p className="text-sm text-gray-500 mb-3">Select all that apply in your professional work.</p>
              <div className="space-y-2">
                {TOOL_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-accent-300 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={answers.toolsUsed.includes(opt.value)}
                      onChange={() => toggleMulti('toolsUsed', opt.value)}
                      className="accent-accent-600"
                    />
                    <span className="text-sm text-gray-800">{opt.label}</span>
                  </label>
                ))}
              </div>
              <InsightBox>
                <strong>Tool fragmentation is common:</strong> Most institutions end up with 5–8 different AI tools used informally before any official policy exists. Mapping this fragmentation is the first step toward a coherent adoption strategy.
              </InsightBox>
            </div>
          )}

          {/* Step 2 — Use cases */}
          {step === 2 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">What do you use AI for?</h3>
              <p className="text-sm text-gray-500 mb-3">Select the use cases most relevant to your day-to-day work.</p>
              <div className="space-y-2">
                {USE_CASE_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-accent-300 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={answers.useCases.includes(opt.value)}
                      onChange={() => toggleMulti('useCases', opt.value)}
                      className="accent-accent-600"
                    />
                    <span className="text-sm text-gray-800">{opt.label}</span>
                  </label>
                ))}
              </div>
              <InsightBox>
                <strong>Use cases drive policy design:</strong> A faculty member using AI for research has different needs than one using it for grading. Bravo-Jaico et al. (2025) show that institutions that map use cases before writing policy get 40% higher adoption of the policy itself.
              </InsightBox>
            </div>
          )}

          {/* Step 3 — Frequency */}
          {step === 3 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">How often do you use AI tools?</h3>
              <p className="text-sm text-gray-500 mb-3">Be honest — this is for internal mapping only.</p>
              <div className="space-y-2">
                {FREQUENCY_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      answers.frequency === opt.value
                        ? 'border-accent-500 bg-accent-50'
                        : 'border-gray-200 hover:border-accent-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="frequency"
                      value={opt.value}
                      checked={answers.frequency === opt.value}
                      onChange={() => setAnswers({ ...answers, frequency: opt.value })}
                      className="accent-accent-600"
                    />
                    <span className="text-sm text-gray-800">{opt.label}</span>
                  </label>
                ))}
              </div>
              <InsightBox>
                <strong>Frequency ≠ readiness:</strong> Cao Kai et al. (2025) distinguish between high-frequency casual users and low-frequency intentional users. Both profiles are valuable — what matters is understanding the distribution so you can design the right support for each group.
              </InsightBox>
            </div>
          )}

          {/* Step 4 — Barriers */}
          {step === 4 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">What's holding you back?</h3>
              <p className="text-sm text-gray-500 mb-3">Select the barriers most relevant to you (optional).</p>
              <div className="space-y-2">
                {BARRIER_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-accent-300 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={answers.barriers.includes(opt.value)}
                      onChange={() => toggleMulti('barriers', opt.value)}
                      className="accent-accent-600"
                    />
                    <span className="text-sm text-gray-800">{opt.label}</span>
                  </label>
                ))}
              </div>
              <InsightBox>
                <strong>Barriers are addressable:</strong> Singh & Strzelecki (2026) identify 3 diffusion levers — relative advantage, trialability, and observability. Each barrier type maps to a different lever. Naming the barrier is the first step to removing it.
              </InsightBox>
            </div>
          )}

          {/* Step 5 — Readiness */}
          {step === 5 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">How would you describe your own AI readiness?</h3>
              <p className="text-sm text-gray-500 mb-3">Be realistic — this is for your team's map, not an evaluation.</p>
              <div className="space-y-2">
                {READINESS_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      answers.readiness === opt.value
                        ? 'border-accent-500 bg-accent-50'
                        : 'border-gray-200 hover:border-accent-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="readiness"
                      value={opt.value}
                      checked={answers.readiness === opt.value}
                      onChange={() => setAnswers({ ...answers, readiness: opt.value })}
                      className="mt-0.5 accent-accent-600"
                    />
                    <span className="text-sm text-gray-800">{opt.label}</span>
                  </label>
                ))}
              </div>
              <div className="mt-4">
                <label className="block text-xs font-medium text-gray-600 mb-1">Anything else you'd like to add? (optional)</label>
                <textarea
                  value={answers.openFeedback}
                  onChange={(e) => setAnswers({ ...answers, openFeedback: e.target.value })}
                  rows={3}
                  placeholder="Tools you wish existed, specific challenges, ideas for the institution…"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none resize-none"
                />
              </div>
              <InsightBox>
                <strong>Leaders accelerate adoption:</strong> Deacon (2025) shows that "Leading" profiles — even just 1–2 per department — are the most effective change agents. Identifying them now lets you design a peer-coaching programme in Module 4.
              </InsightBox>
            </div>
          )}

          {/* Step 6 — Summary */}
          {step === 6 && <SummaryView answers={answers} />}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
          <button
            onClick={() => step > 0 && step < 6 ? setStep(step - 1) : step === 0 ? onClose() : undefined}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {step === 0 ? 'Cancel' : step === 6 ? null : (
              <span className="flex items-center gap-1"><ChevronLeft size={14} /> Back</span>
            )}
          </button>

          {step < TOTAL_STEPS && (
            <button
              onClick={() => step === TOTAL_STEPS - 1 ? setStep(6) : setStep(step + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-1.5 px-5 py-2 bg-accent-600 text-white text-sm font-medium rounded-lg hover:bg-accent-700 disabled:opacity-40 transition-colors"
            >
              {step === TOTAL_STEPS - 1 ? (
                <>See my profile <BarChart2 size={14} /></>
              ) : (
                <>Next <ChevronRight size={14} /></>
              )}
            </button>
          )}

          {step === 6 && (
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 bg-accent-600 text-white text-sm font-medium rounded-lg hover:bg-accent-700 transition-colors"
            >
              <Download size={14} /> Save to Module 3
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
