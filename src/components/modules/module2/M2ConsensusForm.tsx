import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Trash2, CheckCircle, Lock, RotateCcw, AlertTriangle, Shield, Edit3 } from 'lucide-react';
import { RESISTANCE_BEHAVIORS, ANXIETY_TYPES, MISSING_LEVERS, STAKEHOLDER_ROLES, DISCIPLINES, POWER_LEVELS, INTEREST_LEVELS } from '../../../lib/constants';
import { generateCounterMeasure } from '../../../lib/counter-measures';
import ConsensusStatusBadge from '../module1/ConsensusStatusBadge';
import { useM2Consensus } from '../../../lib/use-m2-consensus';
import { useAuth } from '../../../lib/auth-context';
import { useStore } from '../../../lib/store';
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
} from '../../../types';

const SAVE_DEBOUNCE_MS = 2000;

interface Props {
  groupData: GroupStakeholderData;
  isValidator: boolean;
  onRefetch: () => void;
}

export default function M2ConsensusForm({ groupData, isValidator, onRefetch }: Props) {
  const { participant, group } = useAuth();
  const store = useStore();
  const { saveConsensus, validateConsensus, requestReopen } = useM2Consensus(group?.id);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const status = groupData.consensusStatus;
  const isEditable = isValidator && (status === 'draft' || status === 'reopened' || status === 'none');
  const isValidated = status === 'validated';
  const isReopenRequested = status === 'reopen_requested';

  // Initialize from existing consensus or union of individual stakeholders
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>(() => {
    if (groupData.consensusStakeholders.length > 0) return groupData.consensusStakeholders;
    // Pre-fill from individual stakeholders (union)
    return groupData.individualStakeholders.map((s) => ({
      ...s,
      id: crypto.randomUUID(),
      group_id: group?.id || '',
    }));
  });

  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    role: 'Professors' as StakeholderRole,
    discipline: 'Other' as Discipline,
    power: 'low' as PowerLevel,
    interest: 'high' as InterestLevel,
    behavior: 'subtle_avoiding' as ResistanceBehavior,
    anxiety: 'learning' as AnxietyType,
    missing_lever: 'relative_advantage' as MissingLever,
    notes: '',
  });

  // Update local state when consensus data arrives from server
  useEffect(() => {
    if (groupData.consensusStakeholders.length > 0) {
      setStakeholders(groupData.consensusStakeholders);
    }
  }, [groupData.consensusStakeholders]);

  // Debounced save
  const debouncedSave = useCallback(
    (newStakeholders: Stakeholder[]) => {
      if (!isEditable) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        setSaving(true);
        await saveConsensus(newStakeholders);
        setSaving(false);
      }, SAVE_DEBOUNCE_MS);
    },
    [isEditable, saveConsensus]
  );

  const handleRemove = (id: string) => {
    if (!isEditable) return;
    const updated = stakeholders.filter((s) => s.id !== id);
    setStakeholders(updated);
    debouncedSave(updated);
  };

  const handleAdd = () => {
    if (!isEditable) return;
    const counterMeasure = generateCounterMeasure({
      role: form.role,
      discipline: form.discipline,
      power: form.power,
      interest: form.interest,
      behavior: form.behavior,
      anxiety: form.anxiety,
      missingLever: form.missing_lever,
    });

    const newStakeholder: Stakeholder = {
      id: crypto.randomUUID(),
      group_id: group?.id || '',
      name: form.name,
      role: form.role,
      discipline: form.discipline,
      power: form.power,
      interest: form.interest,
      behavior: form.behavior,
      anxiety: form.anxiety,
      missing_lever: form.missing_lever,
      notes: form.notes,
      generated_counter_measure: counterMeasure,
    };

    const updated = [...stakeholders, newStakeholder];
    setStakeholders(updated);
    debouncedSave(updated);
    setForm({ name: '', role: 'Professors', discipline: 'Other', power: 'low', interest: 'high', behavior: 'subtle_avoiding', anxiety: 'learning', missing_lever: 'relative_advantage', notes: '' });
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
      behavior: s.behavior,
      anxiety: s.anxiety,
      missing_lever: s.missing_lever,
      notes: s.notes || '',
    });
    setShowForm(true);
  };

  const handleSaveEdit = () => {
    if (!editingId || !isEditable) return;
    const counterMeasure = generateCounterMeasure({
      role: form.role,
      discipline: form.discipline,
      power: form.power,
      interest: form.interest,
      behavior: form.behavior,
      anxiety: form.anxiety,
      missingLever: form.missing_lever,
    });

    const updated = stakeholders.map((s) =>
      s.id === editingId
        ? { ...s, ...form, generated_counter_measure: counterMeasure }
        : s
    );
    setStakeholders(updated);
    debouncedSave(updated);
    setEditingId(null);
    setForm({ name: '', role: 'Professors', discipline: 'Other', power: 'low', interest: 'high', behavior: 'subtle_avoiding', anxiety: 'learning', missing_lever: 'relative_advantage', notes: '' });
    setShowForm(false);
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
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, []);

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
              <button onClick={() => setConfirming(true)} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
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
          This group stakeholder mapping has been validated and is now used by Modules 3–4.
        </div>
      )}

      {/* Not validator info */}
      {!isValidator && !isValidated && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          <Lock size={14} />
          Only the validator can edit. Discuss with your group and tell them what to change.
        </div>
      )}

      {/* Stakeholder list */}
      <div className={!isEditable ? 'opacity-60 pointer-events-none' : ''}>
        <div className="space-y-3">
          {stakeholders.map((s) => (
            <div key={s.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{s.name}</h4>
                  <span className="text-xs text-gray-500">
                    {s.role} {s.discipline && s.discipline !== 'Other' ? `(${s.discipline})` : ''}
                  </span>
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
              {s.generated_counter_measure && (
                <div className={`p-3 rounded-lg text-xs leading-relaxed ${
                  s.behavior === 'supportive' || s.anxiety === 'ethical_engagement'
                    ? 'bg-accent-50 border border-accent-200'
                    : 'bg-primary-50 border border-primary-200'
                }`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    {s.behavior === 'supportive' || s.anxiety === 'ethical_engagement' ? (
                      <Shield size={12} className="text-accent-600" />
                    ) : (
                      <AlertTriangle size={12} className="text-primary-600" />
                    )}
                    <span className="font-semibold text-[10px] uppercase tracking-wider text-gray-600">
                      {s.behavior === 'supportive' ? 'Leverage Strategy' : 'Counter-Measure'}
                    </span>
                  </div>
                  {s.generated_counter_measure.split('\n\n').map((p, i) => (
                    <p key={i} className="text-gray-700 mb-1 last:mb-0">{p}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add/Edit form */}
        {isEditable && showForm && (
          <div className="mt-4 bg-white rounded-lg border-2 border-primary-200 p-5">
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
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as StakeholderRole })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
                  {STAKEHOLDER_ROLES.map((r) => (<option key={r} value={r}>{r}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Discipline</label>
                <select value={form.discipline} onChange={(e) => setForm({ ...form, discipline: e.target.value as Discipline })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
                  {DISCIPLINES.map((d) => (<option key={d} value={d}>{d}</option>))}
                </select>
              </div>
            </div>

            {/* Power / Interest */}
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Power</label>
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
                <label className="block text-[10px] text-gray-500 mb-1">Interest</label>
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

            {/* Triple diagnostic */}
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">Behavior</label>
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
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">Root Cause</label>
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
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">Missing Lever</label>
                <div className="grid grid-cols-3 gap-2">
                  {MISSING_LEVERS.map((l) => (
                    <button key={l.value} onClick={() => setForm({ ...form, missing_lever: l.value as MissingLever })}
                      className={`text-left p-3 rounded-lg border text-sm transition-all ${
                        form.missing_lever === l.value ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <div className="font-medium text-gray-900">{l.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{l.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes (optional)</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                placeholder="Additional context..." />
            </div>

            <div className="flex gap-2">
              <button onClick={editingId ? handleSaveEdit : handleAdd} disabled={!form.name.trim()}
                className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {editingId ? 'Save Changes' : 'Add & Generate Counter-Measure'}
              </button>
              <button onClick={() => { setShowForm(false); setEditingId(null); }}
                className="px-4 py-2 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {isEditable && !showForm && (
          <button onClick={() => { setEditingId(null); setShowForm(true); }}
            className="mt-4 flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 text-gray-500 text-sm font-medium rounded-lg hover:border-primary-400 hover:text-primary-600 transition-colors w-full justify-center">
            <Plus size={16} /> Add Stakeholder
          </button>
        )}
      </div>
    </div>
  );
}
