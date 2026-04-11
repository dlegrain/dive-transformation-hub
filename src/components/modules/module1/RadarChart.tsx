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
import type { DimensionKey, DimensionAssessment } from '../../../types';

interface Props {
  dimensions: Record<DimensionKey, DimensionAssessment>;
}

export default function RadarChart({ dimensions }: Props) {
  const data = DIMENSIONS.map((dim) => {
    const scores = dimensions[dim.key];
    const avg = (scores.tools + scores.data + scores.culture) / 3;
    return {
      dimension: dim.label,
      score: Math.round(avg * 10) / 10,
      fullMark: 3,
    };
  });

  const overallScore =
    data.reduce((sum, d) => sum + d.score, 0) / data.length;

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
          <p className="text-xs text-gray-500">Overall Score</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <RechartsRadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fontSize: 11, fill: '#6b7280' }}
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

      {/* Weakness alerts */}
      {data
        .filter((d) => d.score < 1.5)
        .map((d) => (
          <div
            key={d.dimension}
            className="mt-3 p-3 bg-danger-50 border border-danger-200 rounded-lg text-sm text-danger-700"
          >
            <strong>{d.dimension}</strong> is critically low ({d.score.toFixed(1)}).
            This dimension should be a priority in your 90-day plan (Module 4).
          </div>
        ))}
    </div>
  );
}
