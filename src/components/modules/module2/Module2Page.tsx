import { useState } from 'react';
import { Plus, Trash2, AlertTriangle, Shield } from 'lucide-react';
import { RESISTANCE_BEHAVIORS, ANXIETY_TYPES, MISSING_LEVERS, STAKEHOLDER_ROLES, DISCIPLINES } from '../../../lib/constants';
import { generateCounterMeasure } from '../../../lib/counter-measures';
import type { Stakeholder, ResistanceBehavior, AnxietyType, MissingLever, StakeholderRole, Discipline } from '../../../types';

export default function Module2Page() {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: '',
    role: 'Professors' as StakeholderRole,
    discipline: 'Other' as Discipline,
    behavior: 'subtle_avoiding' as ResistanceBehavior,
    anxiety: 'learning' as AnxietyType,
    missing_lever: 'relative_advantage' as MissingLever,
    notes: '',
  });

  const handleAdd = () => {
    const counterMeasure = generateCounterMeasure({
      role: form.role,
      discipline: form.discipline,
      behavior: form.behavior,
      anxiety: form.anxiety,
      missingLever: form.missing_lever,
    });

    setStakeholders((prev) => [
      ...prev,
      {
        ...form,
        id: crypto.randomUUID(),
        group_id: '',
        generated_counter_measure: counterMeasure,
      },
    ]);
    setForm({ name: '', role: 'Professors', discipline: 'Other', behavior: 'subtle_avoiding', anxiety: 'learning', missing_lever: 'relative_advantage', notes: '' });
    setShowForm(false);
  };

  const handleRemove = (id: string) => {
    setStakeholders((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-primary-600 font-medium mb-1">
          <span className="bg-primary-100 px-2 py-0.5 rounded">Day 2</span>
          Module 2
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Human Resistance Mapping
        </h2>
        <p className="text-gray-500 mt-1">
          Map your stakeholders through a triple diagnostic: how they resist, why, and what lever is missing.
        </p>
        <p className="text-xs text-gray-400 mt-2 italic">
          Based on Deacon et al. (2025), Cao et al. (2026), Singh & Strzelecki (2026)
        </p>
      </div>

      {/* Stakeholder list */}
      <div className="space-y-4">
        {stakeholders.map((s) => (
          <div key={s.id} className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{s.name}</h3>
                <p className="text-sm text-gray-500">
                  {s.role} {s.discipline && s.discipline !== 'Other' ? `(${s.discipline})` : ''}
                </p>
              </div>
              <button
                onClick={() => handleRemove(s.id!)}
                className="text-gray-400 hover:text-danger-500 p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Triple diagnostic tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-danger-50 text-danger-700 border border-danger-200">
                {RESISTANCE_BEHAVIORS.find((b) => b.value === s.behavior)?.label}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-warning-50 text-warning-700 border border-warning-200">
                {ANXIETY_TYPES.find((a) => a.value === s.anxiety)?.label}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200">
                Missing: {MISSING_LEVERS.find((l) => l.value === s.missing_lever)?.label}
              </span>
            </div>

            {/* Counter-measure */}
            {s.generated_counter_measure && (
              <div className={`p-4 rounded-lg text-sm leading-relaxed ${
                s.anxiety === 'ethical_engagement'
                  ? 'bg-accent-50 border border-accent-200'
                  : 'bg-primary-50 border border-primary-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {s.anxiety === 'ethical_engagement' ? (
                    <Shield size={16} className="text-accent-600" />
                  ) : (
                    <AlertTriangle size={16} className="text-primary-600" />
                  )}
                  <span className="font-semibold text-xs uppercase tracking-wider text-gray-600">
                    {s.anxiety === 'ethical_engagement' ? 'Opportunity' : 'Recommended Counter-Measure'}
                  </span>
                </div>
                {s.generated_counter_measure.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="text-gray-700 mb-2 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add form */}
      {showForm ? (
        <div className="mt-4 bg-white rounded-lg border-2 border-primary-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Add Stakeholder</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name / Group</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Faculty of Engineering"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as StakeholderRole })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                {STAKEHOLDER_ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Discipline</label>
              <select
                value={form.discipline}
                onChange={(e) => setForm({ ...form, discipline: e.target.value as Discipline })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                {DISCIPLINES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Triple diagnostic */}
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                Lens 1: How do they resist? (Behavior)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {RESISTANCE_BEHAVIORS.map((b) => (
                  <button
                    key={b.value}
                    onClick={() => setForm({ ...form, behavior: b.value as ResistanceBehavior })}
                    className={`text-left p-3 rounded-lg border text-sm transition-all ${
                      form.behavior === b.value
                        ? 'border-danger-400 bg-danger-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{b.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{b.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                Lens 2: Why do they resist? (Root Cause)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ANXIETY_TYPES.map((a) => (
                  <button
                    key={a.value}
                    onClick={() => setForm({ ...form, anxiety: a.value as AnxietyType })}
                    className={`text-left p-3 rounded-lg border text-sm transition-all ${
                      form.anxiety === a.value
                        ? a.value === 'ethical_engagement'
                          ? 'border-accent-400 bg-accent-50'
                          : 'border-warning-400 bg-warning-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{a.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{a.description}</div>
                    <div className="text-[10px] text-gray-400 mt-1">{a.source}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                Lens 3: What rational lever is missing?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {MISSING_LEVERS.map((l) => (
                  <button
                    key={l.value}
                    onClick={() => setForm({ ...form, missing_lever: l.value as MissingLever })}
                    className={`text-left p-3 rounded-lg border text-sm transition-all ${
                      form.missing_lever === l.value
                        ? 'border-primary-400 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{l.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{l.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
              placeholder="Additional context..."
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!form.name.trim()}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add & Generate Counter-Measure
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
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
          Add Stakeholder
        </button>
      )}

      {/* Summary stats */}
      {stakeholders.length > 0 && (
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
            Resistance Overview
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stakeholders.length}</div>
              <div className="text-xs text-gray-500">Stakeholders mapped</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-danger-600">
                {stakeholders.filter((s) => s.behavior.startsWith('subtle')).length}
              </div>
              <div className="text-xs text-gray-500">Subtle (hidden) resistance</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent-600">
                {stakeholders.filter((s) => s.anxiety === 'ethical_engagement').length}
              </div>
              <div className="text-xs text-gray-500">Potential allies (ethical)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
