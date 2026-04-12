import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { DIMENSIONS } from '../../../lib/constants';
import type { DimensionKey, DimensionAssessment, CustomDimension } from '../../../types';

interface Props {
  dimensions: Record<DimensionKey, DimensionAssessment>;
  customDimensions?: CustomDimension[];
  hiddenDimensions?: DimensionKey[];
}

function computeScore(assessment: DimensionAssessment) {
  const known = [assessment.tools, assessment.data, assessment.culture].filter((v) => v > 0) as number[];
  const avg = known.length > 0 ? known.reduce((a, b) => a + b, 0) / known.length : null;
  return {
    score: avg !== null ? Math.round(avg * 10) / 10 : null,
    hasUnknowns: known.length < 3,
  };
}

export default function RadarChart({ dimensions, customDimensions = [], hiddenDimensions = [] }: Props) {
  // Standard dimensions (not hidden)
  const standardData = DIMENSIONS
    .filter((dim) => !hiddenDimensions.includes(dim.key))
    .map((dim) => {
      const { score, hasUnknowns } = computeScore(dimensions[dim.key]);
      return {
        dimension: dim.label,
        score,
        hasUnknowns,
        fullMark: 3,
      };
    });

  // Custom dimensions (only those with a label)
  const customData = customDimensions
    .filter((cd) => cd.label.trim())
    .map((cd) => {
      const { score, hasUnknowns } = computeScore(cd.assessment);
      return {
        dimension: cd.label,
        score,
        hasUnknowns,
        fullMark: 3,
      };
    });

  const data = [...standardData, ...customData];

  const chartData = data.map((d) => ({
    ...d,
    score: d.score ?? undefined,
  }));

  const scoredData = data.filter((d) => d.score !== null);
  const overallScore = scoredData.length > 0
    ? scoredData.reduce((sum, d) => sum + d.score!, 0) / scoredData.length
    : 0;

  const getColor = (score: number) => {
    if (score < 1.5) return '#ef4444';
    if (score < 2.5) return '#f59e0b';
    return '#22c55e';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Maturity Radar</h3>
        <div className="text-right">
          <span
            className="text-2xl font-bold"
            style={{ color: getColor(overallScore) }}
          >
            {overallScore.toFixed(1)}
          </span>
          <span className="text-sm text-gray-400"> / 3.0</span>
          <p className="text-xs text-gray-500">Overall Score ({data.length} dimensions)</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <RechartsRadarChart data={chartData} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fontSize: data.length > 8 ? 9 : 11, fill: '#6b7280' }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 3]}
            tickCount={4}
            tick={{ fontSize: 10, fill: '#9ca3af' }}
          />
          <Tooltip
            formatter={(value) => [Number(value).toFixed(1), 'Score']}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: '1px solid #e5e7eb',
            }}
          />
          <Radar
            name="Maturity"
            dataKey="score"
            stroke="#2563eb"
            fill="#3b82f6"
            fillOpacity={0.25}
            strokeWidth={2}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>

      {/* Weakness alerts — only for dimensions that have been rated */}
      {data
        .filter((d) => d.score !== null && d.score < 1.5)
        .map((d) => (
          <div
            key={d.dimension}
            className="mt-3 p-3 bg-danger-50 border border-danger-200 rounded-lg text-sm text-danger-700"
          >
            <strong>{d.dimension}</strong> is critically low ({d.score!.toFixed(1)}).
            This dimension should be a priority in your 90-day plan (Module 4).
          </div>
        ))}
    </div>
  );
}
