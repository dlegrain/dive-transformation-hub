import { useState } from 'react';
import { Plus, Trash2, GripVertical, Wrench, AlertTriangle, Lightbulb, FileText, Shield } from 'lucide-react';
import { SOLUTION_TEMPLATES, DIMENSIONS, MISSING_LEVERS } from '../../../lib/constants';
import { useStore } from '../../../lib/store';
import { useAuth } from '../../../lib/auth-context';
import { useGroupPolicy } from '../../../lib/use-group-policy';
import { useValidator } from '../../../lib/use-validator';
import { supabase } from '../../../lib/supabase';
import type { SolutionTarget, DifficultyLevel, SolutionStatus, DimensionKey, DimensionAssessment } from '../../../types';
import PolicyBuilderModal from './PolicyBuilderModal';

function dimAvg(d: DimensionAssessment): number {
  const known = [d.tools, d.data, d.culture].filter((v) => v > 0) as number[];
  return known.length > 0 ? known.reduce((a, b) => a + b, 0) / known.length : 0;
}

function M3ContextBanner({ dimensions, stakeholders }: {
  dimensions: Record<DimensionKey, DimensionAssessment>;
  stakeholders: ReturnType<typeof useStore>['effectiveStakeholders'];
}) {
  // Weakest M1 dimension
  const scored = DIMENSIONS
    .map((dim) => ({ dim, avg: dimAvg(dimensions[dim.key]) }))
    .filter((x) => x.avg > 0)
    .sort((a, b) => a.avg - b.avg);
  const weakest = scored[0] ?? null;

  // Most common missing lever among stakeholders
  const leverCounts: Record<string, number> = {};
  stakeholders.forEach((s) => {
    if (s.missing_lever) leverCounts[s.missing_lever] = (leverCounts[s.missing_lever] ?? 0) + 1;
  });
  const topLeverValue = Object.entries(leverCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const topLever = topLeverValue ? MISSING_LEVERS.find((l) => l.value === topLeverValue) : null;

  if (!weakest && !topLever) return null;

  return (
    <div className="mb-6 rounded-lg border border-primary-200 bg-primary-50 p-4 space-y-3">
      <p className="text-xs font-semibold text-primary-700 uppercase tracking-wider">
        Build something that matters — insights from your diagnostics
      </p>
      {weakest && (
        <div className="flex items-start gap-2">
          <AlertTriangle size={15} className="text-warning-500 mt-0.5 shrink-0" />
          <p className="text-sm text-gray-700">
            <span className="font-medium">Weakest M1 dimension:</span>{' '}
            <span className="font-semibold text-warning-700">{weakest.dim.label}</span>{' '}
            ({weakest.avg.toFixed(1)}/3). A prototype that addresses this dimension will have the highest strategic impact.{' '}
            <span className="text-xs text-gray-500">(Bravo-Jaico et al., 2025)</span>
          </p>
        </div>
      )}
      {topLever && (
        <div className="flex items-start gap-2">
          <Lightbulb size={15} className="text-primary-500 mt-0.5 shrink-0" />
          <p className="text-sm text-gray-700">
            <span className="font-medium">Most common adoption barrier (M2):</span>{' '}
            <span className="font-semibold text-primary-700">{topLever.label}</span>{' '}
            — {topLever.description}. Build something that directly demonstrates this missing lever to your stakeholders.{' '}
            <span className="text-xs text-gray-500">(Singh & Strzelecki, 2026)</span>
          </p>
        </div>
      )}
    </div>
  );
}

// Simple markdown → HTML for policy/charter cards
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
    .replace(/^(?!<[hul]|<br)(.+)$/gm, '<p class="text-xs text-gray-700 leading-relaxed">$1</p>');
}

const ARTIFACT_PLATFORMS = ['DIVE Policy Builder', 'DIVE Usage Mapping'];

const difficultyColors: Record<DifficultyLevel, string> = {
  Low: 'bg-accent-100 text-accent-700 border-accent-200',
  Medium: 'bg-warning-100 text-warning-700 border-warning-200',
  High: 'bg-danger-100 text-danger-700 border-danger-200',
};

const statusColors: Record<SolutionStatus, string> = {
  Planned: 'bg-gray-100 text-gray-600',
  Prototyped: 'bg-primary-100 text-primary-700',
  Tested: 'bg-accent-100 text-accent-700',
};

export default function Module3Page() {
  const { solutions, setSolutions, effectiveDimensions, effectiveStakeholders } = useStore();
  const { participant, group } = useAuth();
  const { policy, refetch: refetchPolicy } = useGroupPolicy(group?.id);
  const validator = useValidator(group?.id, 'module3');
  const isValidator = validator.validatorId === participant?.id;
  const [showForm, setShowForm] = useState(false);
  const [showPolicyBuilder, setShowPolicyBuilder] = useState(false);
  const [form, setForm] = useState({
    name: '',
    target: 'Students' as SolutionTarget,
    difficulty: 'Low' as DifficultyLevel,
    status: 'Planned' as SolutionStatus,
    problem_solved: '',
    vibe_coding_notes: '',
    platform_used: '',
    assigned_phase: undefined as 1 | 2 | 3 | undefined,
    linked_quick_win: '',
  });

  const suggestPhase = (difficulty: DifficultyLevel): 1 | 2 | 3 => {
    if (difficulty === 'Low') return 1;
    if (difficulty === 'Medium') return 2;
    return 3;
  };

  const handleAdd = () => {
    const phase = form.assigned_phase || suggestPhase(form.difficulty);
    setSolutions((prev) => [
      ...prev,
      {
        ...form,
        id: crypto.randomUUID(),
        group_id: '',
        assigned_phase: phase,
        sort_order: prev.length,
      },
    ]);
    resetForm();
  };

  const handleAddTemplate = (template: typeof SOLUTION_TEMPLATES[number]) => {
    const phase = suggestPhase(template.difficulty as DifficultyLevel);
    setSolutions((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        group_id: '',
        name: template.name,
        target: template.target as SolutionTarget,
        difficulty: template.difficulty as DifficultyLevel,
        status: 'Planned',
        problem_solved: template.problemSolved,
        assigned_phase: phase,
        sort_order: prev.length,
      },
    ]);
  };

  const handleRemove = (id: string) => {
    setSolutions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdateStatus = (id: string, status: SolutionStatus) => {
    setSolutions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  const handleUpdateNotes = (id: string, vibe_coding_notes: string) => {
    setSolutions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, vibe_coding_notes } : s))
    );
  };

  const resetForm = () => {
    setForm({
      name: '', target: 'Students', difficulty: 'Low', status: 'Planned',
      problem_solved: '', vibe_coding_notes: '', platform_used: '',
      assigned_phase: undefined, linked_quick_win: '',
    });
    setShowForm(false);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-primary-600 font-medium mb-1">
          <span className="bg-primary-100 px-2 py-0.5 rounded">Day 3</span>
          Module 3
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          AI Solutions Arsenal
        </h2>
        <p className="text-gray-500 mt-1">
          Catalogue your AI use cases. Pick one quick win from this morning's roadmap and build it with vibe coding.
        </p>
      </div>

      {/* M1/M2 context banner */}
      <M3ContextBanner dimensions={effectiveDimensions} stakeholders={effectiveStakeholders} />

      {/* Quick-start templates — always visible */}
      <div className="mb-6 bg-primary-50 border border-primary-200 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-primary-800 mb-3">
          Ideas — Add a template to your arsenal
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {SOLUTION_TEMPLATES.map((t) => (
            <button
              key={t.name}
              onClick={() => handleAddTemplate(t)}
              className="text-left p-3 bg-white rounded-lg border border-primary-200 hover:border-primary-400 transition-colors"
            >
              <div className="text-sm font-medium text-gray-900">{t.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">{t.target} · {t.difficulty}</div>
            </button>
          ))}
        </div>
      </div>

      {/* AI tools CTAs */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* AI Policy Builder */}
        {(() => {
          const hasCharter = !!policy.policy_draft;
          return (
            <div className={`rounded-lg border p-4 flex items-center justify-between gap-3 ${hasCharter ? 'border-primary-200 bg-primary-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-start gap-3">
                <Shield size={18} className="text-primary-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">AI Policy Builder</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {hasCharter ? 'Charter saved — click to edit or download.' : '5 questions → draft AI charter ready to submit to your rector.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPolicyBuilder(true)}
                className={`shrink-0 flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${hasCharter ? 'bg-white border border-primary-300 text-primary-700 hover:bg-primary-100' : 'bg-primary-600 text-white hover:bg-primary-700'}`}
              >
                <FileText size={13} />
                {hasCharter ? 'Open Charter' : 'Build Charter'}
              </button>
            </div>
          );
        })()}

      </div>

      {/* Solution cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* AI Policy Charter card */}
        {policy.policy_draft && (
          <div
            onClick={() => setShowPolicyBuilder(true)}
            className="bg-white rounded-lg border border-primary-200 p-5 relative group cursor-pointer hover:border-primary-400 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-primary-600 shrink-0" />
                <h3 className="font-semibold text-gray-900">AI Policy Charter</h3>
              </div>
              {/* Validator-only delete */}
              {isValidator && (
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!group?.id) return;
                    if (!confirm('Delete the group AI Policy Charter? This cannot be undone.')) return;
                    await supabase.functions.invoke('group-data', {
                      body: { action: 'save_m3_policy', group_id: group.id, policy_draft: null, policy_answers: null },
                    });
                    refetchPolicy();
                  }}
                  className="text-gray-300 hover:text-danger-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="px-2 py-0.5 text-xs font-medium rounded border bg-accent-100 text-accent-700 border-accent-200">Low</span>
              <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600">Administration</span>
              <span className="px-2 py-0.5 text-xs font-medium rounded bg-primary-100 text-primary-600">Phase 1</span>
            </div>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              Institutional AI charter — scope, acceptable use, transparency, data protection, academic integrity.
            </p>
            <p className="text-xs text-primary-600 font-medium">Click to open, edit or download →</p>
          </div>
        )}

        {solutions.map((sol) => (
          <div
            key={sol.id}
            className="bg-white rounded-lg border border-gray-200 p-5 relative group"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <GripVertical size={14} className="text-gray-300" />
                <h3 className="font-semibold text-gray-900">{sol.name}</h3>
              </div>
              <button
                onClick={() => handleRemove(sol.id!)}
                className="text-gray-300 hover:text-danger-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className={`px-2 py-0.5 text-xs font-medium rounded border ${difficultyColors[sol.difficulty]}`}>
                {sol.difficulty}
              </span>
              <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600">
                {sol.target}
              </span>
              {sol.assigned_phase && (
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-primary-100 text-primary-600">
                  Phase {sol.assigned_phase}
                </span>
              )}
            </div>

            {sol.problem_solved && (
              <p className="text-sm text-gray-600 mb-3">{sol.problem_solved}</p>
            )}

            {/* Artifact cards (policy / usage map): render markdown, no status toggle */}
            {ARTIFACT_PLATFORMS.includes(sol.platform_used ?? '') ? (
              sol.vibe_coding_notes && (
                <div className="border-t border-gray-100 pt-3 max-h-48 overflow-y-auto">
                  <div
                    className="text-xs leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(sol.vibe_coding_notes) }}
                  />
                </div>
              )
            ) : (
              <>
                {/* Status toggle */}
                <div className="flex gap-1 mb-3">
                  {(['Planned', 'Prototyped', 'Tested'] as SolutionStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(sol.id!, status)}
                      className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                        sol.status === status
                          ? statusColors[status]
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                {/* Vibe coding notes */}
                {(sol.status === 'Prototyped' || sol.status === 'Tested') && (
                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-1 text-xs font-medium text-gray-500 mb-1">
                      <Wrench size={12} />
                      Vibe Coding Notes
                    </div>
                    <textarea
                      value={sol.vibe_coding_notes || ''}
                      onChange={(e) => handleUpdateNotes(sol.id!, e.target.value)}
                      rows={2}
                      placeholder="What did you build? What worked?"
                      className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-primary-500 outline-none resize-none"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add custom solution */}
      {showForm ? (
        <div className="mt-4 bg-white rounded-lg border-2 border-primary-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Add Custom Solution</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tool Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Student Onboarding Bot"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Target</label>
              <select
                value={form.target}
                onChange={(e) => setForm({ ...form, target: e.target.value as SolutionTarget })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none"
              >
                <option value="Students">Students</option>
                <option value="Professors">Professors</option>
                <option value="Administration">Administration</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Difficulty</label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value as DifficultyLevel })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Quick Win from Morning (optional)</label>
              <input
                type="text"
                value={form.linked_quick_win}
                onChange={(e) => setForm({ ...form, linked_quick_win: e.target.value })}
                placeholder="Link to morning's roadmap"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Problem it Solves</label>
            <textarea
              value={form.problem_solved}
              onChange={(e) => setForm({ ...form, problem_solved: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none resize-none"
              placeholder="What problem does this tool solve?"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={!form.name.trim()} className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">
              Add Solution
            </button>
            <button onClick={resetForm} className="px-4 py-2 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 text-gray-500 text-sm font-medium rounded-lg hover:border-primary-400 hover:text-primary-600 transition-colors w-full justify-center"
        >
          <Plus size={16} />
          Add Custom Solution
        </button>
      )}

      {/* Policy Builder Modal */}
      {showPolicyBuilder && (
        <PolicyBuilderModal onClose={() => setShowPolicyBuilder(false)} />
      )}

    </div>
  );
}
