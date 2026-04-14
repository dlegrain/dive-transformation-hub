import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, FileText, ExternalLink, Loader2, CheckCircle, Eye, Pencil, Download, Save } from 'lucide-react';
import { useStore } from '../../../lib/store';
import { generatePolicyDraft, type PolicyAnswers } from '../../../lib/ai-advisor';
import type { SolutionTarget, DifficultyLevel } from '../../../types';

// ── Step data ────────────────────────────────────────────────────────────────

const OBSERVED_USE_OPTIONS = [
  { value: 'student_assignments', label: 'Student assignments & essays' },
  { value: 'faculty_course_design', label: 'Faculty course & syllabus design' },
  { value: 'admin_tasks', label: 'Administrative tasks (email, reports)' },
  { value: 'research', label: 'Research & literature review' },
  { value: 'exam_prep', label: 'Exam preparation & study' },
  { value: 'other', label: 'Other / not yet observed' },
];

const CONCERN_OPTIONS = [
  { value: 'academic_integrity', label: 'Academic integrity & plagiarism' },
  { value: 'data_privacy', label: 'Data privacy & GDPR compliance' },
  { value: 'cognitive_skills', label: 'Cognitive skill development' },
  { value: 'equity', label: 'Equity between students' },
  { value: 'legal', label: 'Legal & IP liability' },
  { value: 'quality', label: 'Quality & reliability of AI outputs' },
];

const POSTURE_OPTIONS = [
  {
    value: 'permissive' as const,
    label: 'Permissive',
    description: 'AI encouraged across all contexts, with transparency requirements',
    example: 'e.g., Sorbonne "Open approach"',
  },
  {
    value: 'guided' as const,
    label: 'Guided',
    description: 'AI authorized per course, with rules defined by each instructor',
    example: 'e.g., Sorbonne "Intermediate approach"',
  },
  {
    value: 'restrictive' as const,
    label: 'Restrictive',
    description: 'AI prohibited by default; authorized only in clearly defined cases',
    example: 'e.g., Sorbonne "Restrictive approach"',
  },
];

// ── Markdown renderer ─────────────────────────────────────────────────────────

function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="font-semibold text-gray-900 text-sm mt-3 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-bold text-gray-900 text-sm mt-4 mb-1 border-b border-gray-100 pb-1">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="font-bold text-gray-900 text-base mt-4 mb-2">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li class="ml-3 text-xs text-gray-700">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, '<ul class="list-disc space-y-0.5 my-1">$&</ul>')
    .replace(/\n\n/g, '<br/>')
    .replace(/^(?!<[hul]|<br)(.+)$/gm, '<p class="text-xs text-gray-700 leading-relaxed my-0.5">$1</p>');
}

// ── Pedagogical insight boxes ─────────────────────────────────────────────────

function InsightBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 p-3 bg-primary-50 border border-primary-100 rounded-lg text-xs text-primary-800 leading-relaxed">
      {children}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface PolicyBuilderModalProps {
  onClose: () => void;
}

export default function PolicyBuilderModal({ onClose }: PolicyBuilderModalProps) {
  const { solutions, setSolutions, institutionName } = useStore();

  // Find existing charter card (if already saved)
  const existingCard = solutions.find((s) => s.platform_used === 'DIVE Policy Builder') ?? null;

  const [step, setStep] = useState<number>(existingCard ? 6 : 0);
  const [answers, setAnswers] = useState<PolicyAnswers>({
    institutionType: '',
    studentPopulation: '',
    observedUses: [],
    topConcerns: [],
    posture: 'guided',
    responsibleBody: '',
    ...((existingCard?.policy_answers as Partial<PolicyAnswers>) ?? {}),
  });
  const [generatedDraft, setGeneratedDraft] = useState<string>(existingCard?.vibe_coding_notes ?? '');
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(true);
  const [saved, setSaved] = useState<boolean>(!!existingCard);

  const TOTAL_STEPS = 5;

  // Keep draft in sync if another group member updates the card via Realtime
  useEffect(() => {
    const card = solutions.find((s) => s.platform_used === 'DIVE Policy Builder');
    if (card && card.vibe_coding_notes && card.vibe_coding_notes !== generatedDraft) {
      setGeneratedDraft(card.vibe_coding_notes);
      setSaved(true);
    }
  }, [solutions]);

  const toggleMulti = (field: 'observedUses' | 'topConcerns', value: string) => {
    setAnswers((prev) => {
      const current = prev[field];
      return {
        ...prev,
        [field]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  };

  const canProceed = () => {
    switch (step) {
      case 0: return answers.institutionType.trim().length > 0;
      case 1: return answers.observedUses.length > 0;
      case 2: return answers.topConcerns.length > 0;
      case 3: return true;
      case 4: return answers.responsibleBody.trim().length > 0;
      default: return false;
    }
  };

  const handleGenerate = async () => {
    setStep(5);
    setError(null);
    try {
      const draft = await generatePolicyDraft(answers, institutionName);
      setGeneratedDraft(draft);
      setSaved(false);
      setStep(6);
    } catch (e) {
      setError('Generation failed. Please try again.');
      setStep(4);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedDraft], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI-Charter-${institutionName || 'draft'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    const cardData = {
      group_id: '',
      name: 'AI Policy Charter',
      target: 'Administration' as SolutionTarget,
      difficulty: 'Low' as DifficultyLevel,
      status: 'Planned',
      problem_solved: 'An institutional AI charter structured around 5 principles: scope, acceptable use, transparency, data protection, and academic integrity.',
      vibe_coding_notes: generatedDraft,
      platform_used: 'DIVE Policy Builder',
      assigned_phase: 1,
      policy_draft: generatedDraft,
      policy_answers: answers,
    };

    setSolutions((prev) => {
      const idx = prev.findIndex((s) => (s as any).platform_used === 'DIVE Policy Builder');
      if (idx >= 0) {
        // Update existing card
        return prev.map((s, i) => i === idx ? { ...s, ...cardData } : s);
      }
      // Create new card
      return [...prev, { id: crypto.randomUUID(), sort_order: prev.length, ...cardData } as any];
    });
    setSaved(true);
    // Modal stays open — user can still edit or download
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-primary-600" />
            <span className="font-semibold text-gray-900">AI Policy Builder</span>
            {step < TOTAL_STEPS && (
              <span className="text-xs text-gray-400 ml-1">Step {step + 1} of {TOTAL_STEPS}</span>
            )}
            {saved && step === 6 && (
              <span className="flex items-center gap-1 text-xs text-accent-600 font-medium ml-1">
                <CheckCircle size={12} /> Saved
              </span>
            )}
          </div>
          {step !== 5 && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Progress bar */}
        {step < TOTAL_STEPS && (
          <div className="h-1 bg-gray-100">
            <div
              className="h-1 bg-primary-500 transition-all duration-300"
              style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* Step 0 — Institution type */}
          {step === 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">What type of institution are you?</h3>
              <p className="text-sm text-gray-500 mb-3">Include type and approximate student population.</p>
              <input
                type="text"
                value={answers.institutionType}
                onChange={(e) => setAnswers({ ...answers, institutionType: e.target.value })}
                placeholder="e.g., Public research university, ~15,000 students"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                autoFocus
              />
              <InsightBox>
                <strong>Why this matters:</strong> Only <strong>26% of universities</strong> worldwide have formal AI policies today — and Vietnam's MoET is actively rolling out an AI competency framework in 2026. By writing yours now, you become an institutional reference.{' '}
                <a
                  href="https://www.vietnam.vn/en/tri-tue-nhan-tao-trong-dai-hoc-su-dung-nhieu-chuan-bi-it"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary-600 hover:underline"
                >
                  VietnamPlus / MoET, 2026 <ExternalLink size={10} />
                </a>
              </InsightBox>
            </div>
          )}

          {/* Step 1 — Observed uses */}
          {step === 1 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">What AI uses are you already seeing on your campus?</h3>
              <p className="text-sm text-gray-500 mb-3">Select all that apply.</p>
              <div className="space-y-2">
                {OBSERVED_USE_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-primary-300 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={answers.observedUses.includes(opt.value)}
                      onChange={() => toggleMulti('observedUses', opt.value)}
                      className="accent-primary-600"
                    />
                    <span className="text-sm text-gray-800">{opt.label}</span>
                  </label>
                ))}
              </div>
              <InsightBox>
                <strong>Research finding:</strong> At UNamur (Belgium), <strong>99% of students</strong> already use AI tools — mainly ChatGPT. <strong>63% use it for academic tasks without declaring it</strong> — not out of bad faith, but because the rules are unclear. <strong>44% of students are actually asking for clearer institutional rules.</strong>{' '}
                <a
                  href="https://researchportal.unamur.be/fr/studentTheses/usages-et-perceptions-de-lintelligence-artificielle-par-les-%C3%A9tudi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary-600 hover:underline"
                >
                  Coumont, 2025 <ExternalLink size={10} />
                </a>
              </InsightBox>
            </div>
          )}

          {/* Step 2 — Top concerns */}
          {step === 2 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">What are your top concerns about AI in your institution?</h3>
              <p className="text-sm text-gray-500 mb-3">Select up to 3.</p>
              <div className="space-y-2">
                {CONCERN_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      answers.topConcerns.includes(opt.value)
                        ? 'border-primary-400 bg-primary-50'
                        : answers.topConcerns.length >= 3
                        ? 'border-gray-100 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={answers.topConcerns.includes(opt.value)}
                      onChange={() => {
                        if (!answers.topConcerns.includes(opt.value) && answers.topConcerns.length >= 3) return;
                        toggleMulti('topConcerns', opt.value);
                      }}
                      className="accent-primary-600"
                      disabled={!answers.topConcerns.includes(opt.value) && answers.topConcerns.length >= 3}
                    />
                    <span className="text-sm text-gray-800">{opt.label}</span>
                  </label>
                ))}
              </div>
              <InsightBox>
                <strong>Don't bet on detection:</strong> <strong>77% of students</strong> believe AI use = cheating only "depending on how it's used." And <strong>31% have already tried to circumvent detection software.</strong> Detection-first policies backfire. Transparency-first policies work.{' '}
                <a
                  href="https://researchportal.unamur.be/fr/studentTheses/usages-et-perceptions-de-lintelligence-artificielle-par-les-%C3%A9tudi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary-600 hover:underline"
                >
                  Coumont, 2025 <ExternalLink size={10} />
                </a>
              </InsightBox>
            </div>
          )}

          {/* Step 3 — Posture */}
          {step === 3 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">What institutional posture do you want to adopt?</h3>
              <p className="text-sm text-gray-500 mb-3">This sets the tone for all 5 articles of your charter.</p>
              <div className="space-y-2">
                {POSTURE_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      answers.posture === opt.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="posture"
                      value={opt.value}
                      checked={answers.posture === opt.value}
                      onChange={() => setAnswers({ ...answers, posture: opt.value })}
                      className="mt-0.5 accent-primary-600"
                    />
                    <div>
                      <div className="font-medium text-sm text-gray-900">{opt.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{opt.description}</div>
                      <div className="text-xs text-primary-600 mt-0.5">{opt.example}</div>
                    </div>
                  </label>
                ))}
              </div>
              <InsightBox>
                <strong>Best practice (Sorbonne Paris 1, 2025):</strong> Rather than one institution-wide rule, the Sorbonne defines posture <strong>per course</strong>, giving each instructor autonomy. This avoids blanket bans that fail in practice and blanket permissiveness that erodes integrity.{' '}
                <a
                  href="https://droit.pantheonsorbonne.fr/sites/default/files/2025-10/2025-Charte%20IA-VF%20EDS-Septembre2025.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary-600 hover:underline"
                >
                  Sorbonne Charter, 2025 <ExternalLink size={10} />
                </a>
              </InsightBox>
            </div>
          )}

          {/* Step 4 — Responsible body */}
          {step === 4 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Who will be responsible for enforcing this charter?</h3>
              <p className="text-sm text-gray-500 mb-3">Name a body, committee, or role — even if it's "to be defined."</p>
              <input
                type="text"
                value={answers.responsibleBody}
                onChange={(e) => setAnswers({ ...answers, responsibleBody: e.target.value })}
                placeholder="e.g., Academic Affairs Office, Dean's Council, AI Committee"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                autoFocus
              />
              {error && <p className="mt-2 text-sm text-danger-600">{error}</p>}
              <InsightBox>
                <strong>Naming matters:</strong> Hong et al. (2026) found that without formal institutional frameworks, peer mimicry leads to unethical AI use. A charter that names no responsible body is a charter that lives in a drawer. Even "AI Steering Committee — to be created in Phase 1" is better than silence.
              </InsightBox>
            </div>
          )}

          {/* Step 5 — Generating */}
          {step === 5 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 size={36} className="text-primary-500 animate-spin mb-4" />
              <p className="font-medium text-gray-800">Generating your AI charter draft…</p>
              <p className="text-sm text-gray-500 mt-1">
                Based on the Sorbonne Paris 1 framework, UNamur research, and Vietnam MoET guidelines.
              </p>
              <div className="mt-6 flex items-center gap-2 px-4 py-2.5 bg-warning-50 border border-warning-200 rounded-lg text-sm text-warning-800 font-medium">
                <span>⚠️</span> Please do not close this window
              </div>
            </div>
          )}

          {/* Step 6 — Draft (edit / preview) */}
          {step === 6 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-500">
                  {saved
                    ? 'Shared with your group. Edit below and save again to update.'
                    : 'Review and edit, then save to share with your group.'}
                </p>
                <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-0.5 shrink-0">
                  <button
                    onClick={() => setPreviewMode(true)}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md transition-colors ${previewMode ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Eye size={11} /> Preview
                  </button>
                  <button
                    onClick={() => setPreviewMode(false)}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md transition-colors ${!previewMode ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Pencil size={11} /> Edit
                  </button>
                </div>
              </div>

              {previewMode ? (
                <div
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 min-h-[18rem] overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(generatedDraft) }}
                />
              ) : (
                <textarea
                  value={generatedDraft}
                  onChange={(e) => { setGeneratedDraft(e.target.value); setSaved(false); }}
                  rows={18}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none font-mono leading-relaxed"
                />
              )}

              <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-400">
                <a href="https://droit.pantheonsorbonne.fr/sites/default/files/2025-10/2025-Charte%20IA-VF%20EDS-Septembre2025.pdf" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary-600">
                  <ExternalLink size={10} /> Sorbonne Charter (2025)
                </a>
                <a href="https://researchportal.unamur.be/fr/studentTheses/usages-et-perceptions-de-lintelligence-artificielle-par-les-%C3%A9tudi/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary-600">
                  <ExternalLink size={10} /> Coumont, UNamur (2025)
                </a>
                <a href="https://www.vietnam.vn/en/tri-tue-nhan-tao-trong-dai-hoc-su-dung-nhieu-chuan-bi-it" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary-600">
                  <ExternalLink size={10} /> VietnamPlus / MoET (2026)
                </a>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
          {/* Left */}
          {step !== 5 && (
            <button
              onClick={() => step > 0 && step < 5 ? setStep(step - 1) : onClose()}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {step === 0 || step === 6 ? 'Close' : (
                <span className="flex items-center gap-1"><ChevronLeft size={14} /> Back</span>
              )}
            </button>
          )}
          {step === 5 && <div />}

          {/* Right */}
          <div className="flex items-center gap-2">
            {step < TOTAL_STEPS && (
              <button
                onClick={() => step === TOTAL_STEPS - 1 ? handleGenerate() : setStep(step + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-1.5 px-5 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-40 transition-colors"
              >
                {step === TOTAL_STEPS - 1 ? (
                  <>Generate Charter <FileText size={14} /></>
                ) : (
                  <>Next <ChevronRight size={14} /></>
                )}
              </button>
            )}

            {step === 6 && (
              <>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download size={14} /> Download .md
                </button>
                <button
                  onClick={handleSave}
                  disabled={saved}
                  className="flex items-center gap-1.5 px-5 py-2 bg-accent-600 text-white text-sm font-medium rounded-lg hover:bg-accent-700 disabled:opacity-50 transition-colors"
                >
                  {saved ? <><CheckCircle size={14} /> Saved</> : <><Save size={14} /> Save & share</>}
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
