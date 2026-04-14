import { Plus, EyeOff, Users, Handshake, BarChart2 } from 'lucide-react';
import DimensionForm from './DimensionForm';
import CustomDimensionForm from './CustomDimensionForm';
import RadarChart from './RadarChart';
import GroupComparisonOverlay from './GroupComparisonOverlay';
import ConsensusForm from './ConsensusForm';
import GroupConsensusTable from '../../plenary/GroupConsensusTable';
import ConsensusStatusBadge from './ConsensusStatusBadge';
import { useStore } from '../../../lib/store';
import { useAuth } from '../../../lib/auth-context';
import { useGroupData } from '../../../lib/use-group-data';
import { DIMENSIONS } from '../../../lib/constants';
import type { DimensionKey } from '../../../types';

export default function Module1Page() {
  const {
    dimensions, setDimension,
    customDimensions, setCustomDimensions,
    hiddenDimensions, setHiddenDimensions,
    institutionName, setInstitutionName,
    assessorName, setAssessorName,
  } = useStore();

  const { group } = useAuth();
  const { data: groupData, refetch } = useGroupData(group?.id);

  const handleAddCustom = () => {
    setCustomDimensions((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        label: '',
        description: '',
        assessment: { tools: 1, data: 1, culture: 1 },
      },
    ]);
  };

  const handleRemoveCustom = (id: string) => {
    setCustomDimensions((prev) => prev.filter((d) => d.id !== id));
  };

  const toggleDimension = (key: DimensionKey) => {
    setHiddenDimensions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const visibleStandardDimensions = DIMENSIONS.filter(
    (d) => !hiddenDimensions.includes(d.key)
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-primary-600 font-medium mb-1">
          <span className="bg-primary-100 px-2 py-0.5 rounded">Day 1</span>
          Module 1
          {(groupData?.consensusStatus && groupData.consensusStatus !== 'none') && (
            <ConsensusStatusBadge status={groupData.consensusStatus} />
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Maturity Diagnostic
        </h2>
        <p className="text-gray-500 mt-1">
          Rate your institution across up to 8 dimensions. You can hide dimensions that don't apply and add your own.
          Each dimension is evaluated on 3 sub-criteria: Tools & Processes, Data, and Culture.
        </p>
        <p className="text-xs text-gray-400 mt-2 italic">
          Based on the MTM Model (Bravo-Jaico et al., 2025)
        </p>
      </div>

      {/* Institution info */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Institution Name
            </label>
            <input
              type="text"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              placeholder="e.g., Saigon University"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assessor Name
            </label>
            <input
              type="text"
              value={assessorName}
              onChange={(e) => setAssessorName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Hidden dimensions toggle */}
      {hiddenDimensions.length > 0 && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6">
          <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase">
            Hidden Dimensions ({hiddenDimensions.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {DIMENSIONS.filter((d) => hiddenDimensions.includes(d.key)).map((dim) => (
              <button
                key={dim.key}
                onClick={() => toggleDimension(dim.key)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-colors"
              >
                <EyeOff size={12} />
                {dim.label}
                <span className="text-gray-400 ml-1">click to restore</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main content: form + radar side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
            Assessment ({visibleStandardDimensions.length + customDimensions.length} dimensions)
          </h3>
          <DimensionForm
            dimensions={dimensions}
            onChange={setDimension}
            hiddenDimensions={hiddenDimensions}
            onToggleDimension={toggleDimension}
          />

          {/* Custom dimensions */}
          {customDimensions.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-primary-700 mb-3 uppercase tracking-wider">
                Your Custom Dimensions
              </h3>
              <div className="space-y-4">
                {customDimensions.map((cd) => (
                  <CustomDimensionForm
                    key={cd.id}
                    customDimension={cd}
                    onUpdate={(updated) => {
                      setCustomDimensions((prev) =>
                        prev.map((d) => (d.id === cd.id ? updated : d))
                      );
                    }}
                    onRemove={() => handleRemoveCustom(cd.id)}
                  />
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleAddCustom}
            className="mt-4 flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 text-gray-500 text-sm font-medium rounded-lg hover:border-primary-400 hover:text-primary-600 transition-colors w-full justify-center"
          >
            <Plus size={16} />
            Add a Custom Dimension
          </button>
        </div>
        <div className="lg:sticky lg:top-6 lg:self-start">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
            Radar View
          </h3>
          <RadarChart
            dimensions={dimensions}
            customDimensions={customDimensions}
            hiddenDimensions={hiddenDimensions}
          />

          {/* Legend */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
            <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase">
              Maturity Levels
            </h4>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full bg-danger-500" />
                <span className="text-gray-600">
                  <strong>1 — Beginner:</strong> Minimal automation, no data-driven decisions, staff disengaged
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full bg-warning-500" />
                <span className="text-gray-600">
                  <strong>2 — In Progress:</strong> Platforms exist but underperform, emerging data initiatives, growing awareness
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full bg-accent-500" />
                <span className="text-gray-600">
                  <strong>3 — Continuous Improvement:</strong> Full digitization, data-driven governance, digital-first culture
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ─── Phase 2: Group Comparison ─────────────────────────── */}
      {groupData && groupData.totalCount > 1 && (
        <>
          <div className="mt-10 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Users size={16} className="text-primary-600" />
              <h2 className="text-lg font-bold text-gray-900">
                Phase 2 — Group Comparison
              </h2>
            </div>
            <p className="text-gray-500 text-sm">
              See how your individual assessment compares to your group's anonymous average.
            </p>
          </div>
          <GroupComparisonOverlay
            groupData={groupData}
            personalDimensions={dimensions}
            customDimensions={customDimensions}
            hiddenDimensions={hiddenDimensions}
          />
        </>
      )}

      {/* ─── Phase 3: Group Consensus ──────────────────────────── */}
      {groupData && groupData.totalCount > 1 && (
        groupData.completedCount === groupData.totalCount || groupData.consensusStatus !== 'none'
      ) && (
        <>
          <div className="mt-10 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Handshake size={16} className="text-primary-600" />
              <h2 className="text-lg font-bold text-gray-900">
                Phase 3 — Group Consensus
              </h2>
            </div>
            <p className="text-gray-500 text-sm">
              Discuss with your group and agree on a single shared diagnostic.
              This will be used by Modules 2, 3, and 4.
            </p>
          </div>
          <ConsensusForm groupData={groupData} onRefetch={refetch} />
        </>
      )}

      {/* ─── Phase 4: Inter-institution Comparison ─────────────── */}
      {groupData?.consensusStatus === 'validated' && (
        <>
          <div className="mt-10 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <BarChart2 size={16} className="text-primary-600" />
              <h2 className="text-lg font-bold text-gray-900">
                Phase 4 — How Do Other Institutions Compare?
              </h2>
            </div>
            <p className="text-gray-500 text-sm">
              Once groups validate their consensus, their results appear here. Compare maturity profiles across institutions.
            </p>
          </div>
          <GroupConsensusTable dark={false} />
        </>
      )}
    </div>
  );
}
