import { useState, useEffect, useCallback } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { CheckCircle, Clock, Minus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { DIMENSIONS } from '../../lib/constants';

interface GroupConsensus {
  group_id: string;
  institution_name: string;
  consensus_status: string;
  consensus_validated_at: string | null;
  dimensions: Record<string, { tools: number; data: number; culture: number }> | null;
}

const RADAR_COLORS = ['#3b82f6', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];

function dimAvg(d: { tools: number; data: number; culture: number }): number {
  const known = [d.tools, d.data, d.culture].filter((v) => v > 0);
  if (known.length === 0) return 0;
  return Math.round((known.reduce((a, b) => a + b, 0) / known.length) * 10) / 10;
}

function scoreColor(score: number): string {
  if (score < 1.5) return 'text-red-600';
  if (score < 2.5) return 'text-amber-600';
  return 'text-green-600';
}

interface Props {
  dark: boolean;
}

export default function GroupConsensusTable({ dark }: Props) {
  const [groups, setGroups] = useState<GroupConsensus[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('group-data', {
        body: { action: 'get_group_consensuses' },
      });
      if (error) {
        console.error('fetch group consensuses error:', error);
        return;
      }
      setGroups(data?.groups || []);
    } catch (err) {
      console.error('fetch group consensuses failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const validatedGroups = groups.filter((g) => g.consensus_status === 'validated' && g.dimensions);

  if (loading) {
    return <p className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-400'} text-center py-4`}>Loading group data...</p>;
  }

  if (groups.length === 0) {
    return null;
  }

  // Build radar overlay data for validated groups
  const radarOverlayData = DIMENSIONS.map((dim) => {
    const point: Record<string, unknown> = { dimension: dim.label, fullMark: 3 };
    for (const g of validatedGroups) {
      const d = g.dimensions?.[dim.key as string];
      point[g.institution_name || g.group_id] = d ? dimAvg(d) : undefined;
    }
    return point;
  });

  return (
    <div className="space-y-6 mt-6">
      {/* Comparison Table */}
      <div className={`rounded-xl border p-6 ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>
          Group Consensus Comparison
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className={`text-left pb-3 pr-4 text-xs font-semibold uppercase ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Institution
                </th>
                <th className={`text-center pb-3 px-2 text-xs font-semibold uppercase ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Status
                </th>
                {DIMENSIONS.map((dim) => (
                  <th
                    key={dim.key}
                    className={`text-center pb-3 px-2 text-xs font-semibold ${dark ? 'text-gray-400' : 'text-gray-500'}`}
                    title={dim.label}
                  >
                    {dim.label.length > 12 ? dim.label.substring(0, 12) + '...' : dim.label}
                  </th>
                ))}
                <th className={`text-center pb-3 px-2 text-xs font-bold uppercase ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Overall
                </th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => {
                const isValidated = g.consensus_status === 'validated';
                const overall = isValidated && g.dimensions
                  ? DIMENSIONS.reduce((sum, dim) => {
                      const d = g.dimensions?.[dim.key as string];
                      return sum + (d ? dimAvg(d) : 0);
                    }, 0) / DIMENSIONS.length
                  : null;

                return (
                  <tr
                    key={g.group_id}
                    className={`border-t ${dark ? 'border-gray-700' : 'border-gray-100'}`}
                  >
                    <td className={`py-3 pr-4 font-medium ${dark ? 'text-white' : 'text-gray-900'}`}>
                      {g.institution_name || 'Unknown'}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {isValidated ? (
                        <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                          <CheckCircle size={12} /> Validated
                        </span>
                      ) : g.consensus_status === 'none' ? (
                        <span className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                          <Minus size={12} className="inline" /> Not started
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-medium">
                          <Clock size={12} /> {g.consensus_status === 'draft' ? 'Draft' : g.consensus_status === 'reopen_requested' ? 'Reopen req.' : 'Reopened'}
                        </span>
                      )}
                    </td>
                    {DIMENSIONS.map((dim) => {
                      const d = g.dimensions?.[dim.key as string];
                      const avg = d ? dimAvg(d) : null;
                      return (
                        <td key={dim.key} className="py-3 px-2 text-center">
                          {avg !== null ? (
                            <span className={`font-semibold text-sm ${scoreColor(avg)}`}>
                              {avg.toFixed(1)}
                            </span>
                          ) : (
                            <span className={dark ? 'text-gray-600' : 'text-gray-300'}>—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="py-3 px-2 text-center">
                      {overall !== null ? (
                        <span className={`font-bold text-sm ${scoreColor(overall)}`}>
                          {overall.toFixed(1)}
                        </span>
                      ) : (
                        <span className={dark ? 'text-gray-600' : 'text-gray-300'}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Radar Overlay for validated groups */}
      {validatedGroups.length >= 2 && (
        <div className={`rounded-xl border p-6 ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>
            Validated Consensus — Radar Overlay ({validatedGroups.length} institutions)
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarOverlayData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke={dark ? '#374151' : '#e5e7eb'} />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fontSize: 10, fill: dark ? '#9ca3af' : '#6b7280' }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 3]}
                tickCount={4}
                tick={{ fontSize: 10, fill: dark ? '#6b7280' : '#9ca3af' }}
              />
              <Tooltip
                formatter={(value) => [Number(value).toFixed(1), 'Score']}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
              {validatedGroups.map((g, i) => (
                <Radar
                  key={g.group_id}
                  name={g.institution_name || `Group ${i + 1}`}
                  dataKey={g.institution_name || g.group_id}
                  stroke={RADAR_COLORS[i % RADAR_COLORS.length]}
                  fill={RADAR_COLORS[i % RADAR_COLORS.length]}
                  fillOpacity={0.08}
                  strokeWidth={2}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
