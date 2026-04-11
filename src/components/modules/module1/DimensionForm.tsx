import { DIMENSIONS, SUB_CRITERIA, SUB_CRITERIA_LABELS, MATURITY_LEVELS } from '../../../lib/constants';
import type { DimensionKey, DimensionAssessment } from '../../../types';

interface Props {
  dimensions: Record<DimensionKey, DimensionAssessment>;
  onChange: (key: DimensionKey, sub: 'tools' | 'data' | 'culture', value: 0 | 1 | 2 | 3) => void;
}

export default function DimensionForm({ dimensions, onChange }: Props) {
  return (
    <div className="space-y-6">
      {DIMENSIONS.map((dim) => {
        const scores = dimensions[dim.key];
        const known = [scores.tools, scores.data, scores.culture].filter((v) => v > 0) as number[];
        const avg = known.length > 0 ? (known.reduce((a, b) => a + b, 0) / known.length).toFixed(1) : '—';

        return (
          <div
            key={dim.key}
            className="bg-white rounded-lg border border-gray-200 p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{dim.label}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{dim.description}</p>
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
                        onClick={() => onChange(dim.key, sub, level.value as 0 | 1 | 2 | 3)}
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
      })}
    </div>
  );
}
