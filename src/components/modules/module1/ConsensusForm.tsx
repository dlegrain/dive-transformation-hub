import { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle, Lock, RotateCcw } from 'lucide-react';
import DimensionForm from './DimensionForm';
import RadarChart from './RadarChart';
import ConsensusStatusBadge from './ConsensusStatusBadge';
import { useConsensus } from '../../../lib/use-consensus';
import { useAuth } from '../../../lib/auth-context';
import { useStore } from '../../../lib/store';
import type {
  DimensionKey,
  DimensionAssessment,
  GroupAssessmentData,
} from '../../../types';

const SAVE_DEBOUNCE_MS = 2000;

interface Props {
  groupData: GroupAssessmentData;
  onRefetch: () => void;
}

/** Round a fractional average to the nearest valid score (1, 2, or 3). Never 0. */
function roundToScore(val: number): 0 | 1 | 2 | 3 {
  if (val <= 0) return 1;
  return Math.max(1, Math.min(3, Math.round(val))) as 1 | 2 | 3;
}

function buildInitialDimensions(
  groupAverage: Record<DimensionKey, DimensionAssessment> | null
): Record<DimensionKey, DimensionAssessment> {
  const keys: DimensionKey[] = [
    'socioCultural', 'teachingLearning', 'academicManagement', 'administrativeManagement',
    'researchInnovation', 'digitalGovernance', 'institutionalImage', 'universityExtension',
  ];
  const result = {} as Record<DimensionKey, DimensionAssessment>;
  for (const key of keys) {
    const avg = groupAverage?.[key];
    result[key] = avg
      ? { tools: roundToScore(avg.tools), data: roundToScore(avg.data), culture: roundToScore(avg.culture) }
      : { tools: 1, data: 1, culture: 1 };
  }
  return result;
}

export default function ConsensusForm({ groupData, onRefetch }: Props) {
  const { participant, group } = useAuth();
  const store = useStore();
  const { saveConsensus, validateConsensus, requestReopen } = useConsensus(group?.id);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const status = groupData.consensusStatus;
  const isEditable = status === 'draft' || status === 'reopened' || status === 'none';
  const isValidated = status === 'validated';
  const isReopenRequested = status === 'reopen_requested';

  // Initialize from existing consensus or group average
  const [dims, setDims] = useState<Record<DimensionKey, DimensionAssessment>>(() => {
    if (groupData.consensus) return groupData.consensus.dimensions as Record<DimensionKey, DimensionAssessment>;
    return buildInitialDimensions(groupData.groupAverage);
  });
  const [hiddenDims, setHiddenDims] = useState<DimensionKey[]>(() => {
    return groupData.consensus?.hiddenDimensions || [];
  });
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Update local state when consensus data arrives from server (e.g., another member editing)
  useEffect(() => {
    if (groupData.consensus) {
      setDims(groupData.consensus.dimensions as Record<DimensionKey, DimensionAssessment>);
      setHiddenDims(groupData.consensus.hiddenDimensions || []);
    }
  }, [groupData.consensus]);

  // Debounced save to server
  const debouncedSave = useCallback(
    (newDims: Record<DimensionKey, DimensionAssessment>, newHidden: DimensionKey[]) => {
      if (!isEditable) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        setSaving(true);
        await saveConsensus(newDims, { customDimensions: [], hiddenDimensions: newHidden });
        setSaving(false);
      }, SAVE_DEBOUNCE_MS);
    },
    [isEditable, saveConsensus]
  );

  const handleChange = (key: DimensionKey, sub: 'tools' | 'data' | 'culture', value: 0 | 1 | 2 | 3) => {
    if (!isEditable) return;
    const updated = { ...dims, [key]: { ...dims[key], [sub]: value } };
    setDims(updated);
    debouncedSave(updated, hiddenDims);
  };

  const handleToggleDimension = (key: DimensionKey) => {
    if (!isEditable) return;
    const updated = hiddenDims.includes(key) ? hiddenDims.filter((k) => k !== key) : [...hiddenDims, key];
    setHiddenDims(updated);
    debouncedSave(dims, updated);
  };

  const handleValidate = async () => {
    if (!participant?.id) return;
    setConfirming(false);
    // Final save before validating
    await saveConsensus(dims, { customDimensions: [], hiddenDimensions: hiddenDims });
    await validateConsensus(participant.id);
    // Update local store so downstream modules use consensus
    store.setConsensusDimensions(dims);
    store.setConsensusHiddenDimensions(hiddenDims);
    store.setConsensusStatus('validated');
    onRefetch();
  };

  const handleRequestReopen = async () => {
    if (!participant?.id) return;
    await requestReopen(participant.id);
    store.setConsensusStatus('reopen_requested');
    onRefetch();
  };

  // Cleanup timer
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
                <span className="text-xs text-gray-600">Lock this diagnostic for the group?</span>
                <button
                  onClick={handleValidate}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  <CheckCircle size={12} />
                  Confirm
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <CheckCircle size={14} />
                Validate Group Diagnostic
              </button>
            )
          )}
          {isValidated && (
            <button
              onClick={handleRequestReopen}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs font-medium rounded-lg transition-colors"
            >
              <RotateCcw size={12} />
              Request Modification
            </button>
          )}
          {isReopenRequested && (
            <span className="text-xs text-orange-600 font-medium">
              Waiting for facilitator approval...
            </span>
          )}
        </div>
      </div>

      {/* Locked overlay message */}
      {isValidated && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          <Lock size={14} />
          This group diagnostic has been validated and is now used by Modules 2–4.
        </div>
      )}

      {/* Form + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={!isEditable ? 'opacity-60 pointer-events-none' : ''}>
          <DimensionForm
            dimensions={dims}
            onChange={handleChange}
            hiddenDimensions={hiddenDims}
            onToggleDimension={handleToggleDimension}
          />
        </div>
        <div className="lg:sticky lg:top-6 lg:self-start">
          <RadarChart
            dimensions={dims}
            hiddenDimensions={hiddenDims}
          />
        </div>
      </div>
    </div>
  );
}
