import { SUB_CRITERIA, SUB_CRITERIA_LABELS, MATURITY_LEVELS } from '../../../lib/constants';
import type { CustomDimension } from '../../../types';

interface Props {
  customDimension: CustomDimension;
  onChange: React.Dispatch<React.SetStateAction<CustomDimension | null>>;
}

export default function CustomDimensionForm({ customDimension, onChange }: Props) {
  const scores = customDimension.assessment;
  const known = [scores.tools, scores.data, scores.culture].filter((v) => v > 0) as number[];
  const avg = known.length > 0 ? (known.reduce((a, b) => a + b, 0) / known.length).toFixed(1) : '—';

  const updateAssessment = (sub: 'tools' | 'data' | 'culture', value: 0 | 1 | 2 | 3) => {
    onChange((prev) => prev ? {
      ...prev,
      assessment: { ...prev.assessment, [sub]: value },
    } : prev);
  };

  return (
    <div className="bg-white rounded-lg border-2 border-primary-200 p-5">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Dimension Name</label>
          <input
            type="text"
            value={customDimension.label}
            onChange={(e) => onChange((prev) => prev ? { ...prev, label: e.target.value } : prev)}
            placeholder="e.g., Student Wellbeing, AI Readiness..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
          <input
            type="text"
            value={customDimension.description}
            onChange={(e) => onChange((prev) => prev ? { ...prev, description: e.target.value } : prev)}
            placeholder="What does this dimension cover?"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
      </div>

      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{customDimension.label || 'Custom Dimension'}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{customDimension.description || 'Define your own dimension'}</p>
        </div>
        <div className="text-right">
          <span
            className={`text-lg font-bold ${
              avg === '—'
                ? 'text-gray-400'
                : Number(avg) < 1.5
                  ? 'text-danger-600'
                  : Number(avg) < 2.5
                    ? 'text-warning-600'
                    : 'text-accent-600'
            }`}
          >
            {avg}
          </span>
          {avg !== '—' && <span className="text-xs text-gray-400"> / 3</span>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {SUB_CRITERIA.map((sub) => (
          <div key={sub}>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              {SUB_CRITERIA_LABELS[sub]}
            </label>
            <div className="flex gap-1">
              {MATURITY_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => updateAssessment(sub, level.value as 0 | 1 | 2 | 3)}
                  className={`flex-1 py-1.5 px-1 text-xs rounded font-medium transition-all ${
                    scores[sub] === level.value
                      ? 'text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                  style={
                    scores[sub] === level.value
                      ? { backgroundColor: level.color }
                      : undefined
                  }
                  title={level.label}
                >
                  {level.value === 0 ? '?' : level.value}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              {MATURITY_LEVELS.find((l) => l.value === scores[sub])?.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
