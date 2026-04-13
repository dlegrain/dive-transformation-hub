import { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import {
  Radar as RadarIcon,
  Users,
  Lightbulb,
  CalendarCheck,
  ClipboardList,
  ArrowLeft,
  Monitor,
  EyeOff,
  RefreshCw,
  Wifi,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import GroupConsensusTable from './GroupConsensusTable';
import {
  RESISTANCE_BEHAVIORS,
  ANXIETY_TYPES,
  MISSING_LEVERS,
  PLAN_PHASES,
} from '../../lib/constants';

type Tab = 'survey' | 'maturity' | 'resistance' | 'solutions' | 'plan';

const TABS: { id: Tab; label: string; icon: typeof RadarIcon; day: string }[] = [
  { id: 'survey', label: 'AI Survey', icon: ClipboardList, day: 'Intro' },
  { id: 'maturity', label: 'Maturity', icon: RadarIcon, day: 'Day 1' },
  { id: 'resistance', label: 'Resistance', icon: Users, day: 'Day 2' },
  { id: 'solutions', label: 'Solutions', icon: Lightbulb, day: 'Day 3' },
  { id: 'plan', label: '90-Day Plan', icon: CalendarCheck, day: 'Day 4' },
];

const COLORS = ['#3b82f6', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
const PIE_COLORS = ['#3b82f6', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6'];

// ============================================================
// Data types from plenary-data Edge Function
// ============================================================
interface PlenaryData {
  participantCount: number;
  dimensionAverages: Record<string, { tools: number; data: number; culture: number }>;
  stakeholders: { role: string; behavior: string; anxiety: string; missing_lever: string }[];
  solutions: { name: string; target: string; difficulty: string; status: string; assigned_phase: number | null }[];
  tasks: { name: string; phase: number; champion_target: string; priority: string; status: string }[];
  kpis: { name: string; type: string; phase: number | null }[];
  surveys: { models_count: number; models_used: string[]; task_types: string[]; frequency: string; paid_vs_free: string; vibe_coding: string | null }[];
}

const EMPTY_DATA: PlenaryData = {
  participantCount: 0,
  dimensionAverages: {},
  stakeholders: [],
  solutions: [],
  tasks: [],
  kpis: [],
  surveys: [],
};

// Auto-refresh interval (seconds)
const REFRESH_INTERVAL = 15;

export default function PlenaryDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('survey');
  const [presentationMode, setPresentationMode] = useState(false);
  const [data, setData] = useState<PlenaryData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const { data: fnData, error } = await supabase.functions.invoke('plenary-data');
      if (error) throw error;

      setData(fnData);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to fetch plenary data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + auto-refresh
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className={`min-h-screen ${presentationMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Top bar */}
      <div className={`sticky top-0 z-10 ${presentationMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className={`p-2 rounded-lg transition-colors ${presentationMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className={`text-lg font-bold ${presentationMode ? 'text-white' : 'text-gray-900'}`}>
              Plenary Dashboard
            </h1>
            <p className={`text-xs ${presentationMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Anonymous aggregate data — safe to project
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Live status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${presentationMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
            <Wifi size={12} className="text-green-500" />
            <span>{data.participantCount} participant{data.participantCount !== 1 ? 's' : ''}</span>
            {lastRefresh && (
              <span className="opacity-50">
                · {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </div>
          <button
            onClick={() => { setLoading(true); fetchData(); }}
            className={`p-2 rounded-lg transition-colors ${presentationMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
            title="Refresh now"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setPresentationMode(!presentationMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              presentationMode
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Monitor size={16} />
            {presentationMode ? 'Exit Presentation' : 'Presentation Mode'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={`px-6 pt-4 flex gap-2 ${presentationMode ? 'border-gray-700' : ''}`}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? presentationMode
                  ? 'bg-primary-600 text-white'
                  : 'bg-primary-50 text-primary-700 border border-primary-200'
                : presentationMode
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
            <span className={`text-xs ${activeTab === tab.id ? 'opacity-70' : 'opacity-50'}`}>
              {tab.day}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6 max-w-7xl mx-auto">
        {loading && data === EMPTY_DATA ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={24} className="animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {activeTab === 'survey' && <SurveyTab data={data} dark={presentationMode} />}
            {activeTab === 'maturity' && <MaturityTab dark={presentationMode} />}
            {activeTab === 'resistance' && <ResistanceTab data={data} dark={presentationMode} />}
            {activeTab === 'solutions' && <SolutionsTab data={data} dark={presentationMode} />}
            {activeTab === 'plan' && <PlanTab data={data} dark={presentationMode} />}
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Shared components
// ============================================================
function Card({ title, children, dark, className = '' }: { title: string; children: React.ReactNode; dark: boolean; className?: string }) {
  return (
    <div className={`rounded-xl border p-6 ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} ${className}`}>
      <h3 className={`font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
      {children}
    </div>
  );
}

function EmptyState({ message, dark }: { message: string; dark: boolean }) {
  return (
    <div className={`text-center py-12 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
      <EyeOff size={32} className="mx-auto mb-3 opacity-50" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

function StatBox({ label, value, color, dark }: { label: string; value: string | number; color?: string; dark: boolean }) {
  return (
    <div className={`rounded-lg p-4 text-center ${dark ? 'bg-gray-700' : 'bg-gray-50'}`}>
      <div className="text-2xl font-bold" style={color ? { color } : undefined}>
        {value}
      </div>
      <div className={`text-xs mt-1 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</div>
    </div>
  );
}

// ============================================================
// Intro: AI Usage Survey
// ============================================================
const FREQ_LABELS: Record<string, string> = {
  never: 'Never',
  monthly: 'Monthly',
  weekly: 'Weekly',
  daily: 'Daily',
  multiple_daily: 'Multiple × / day',
};
const PAID_LABELS: Record<string, string> = {
  free_only: 'Free only',
  mostly_free: 'Mostly free',
  mix: 'Mix',
  mostly_paid: 'Mostly paid',
  paid_only: 'Paid only',
};
const VIBE_LABELS: Record<string, string> = {
  yes: 'Yes, I do it',
  heard: 'Heard of it',
  no: 'No idea',
};

function countItems(arrays: string[][]): { name: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const arr of arrays) {
    for (const item of arr) {
      counts[item] = (counts[item] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function SurveyTab({ data, dark }: { data: PlenaryData; dark: boolean }) {
  const { surveys } = data;

  if (surveys.length === 0) {
    return <EmptyState message="No survey responses yet. Waiting for participants..." dark={dark} />;
  }

  // Stats
  const avgModels =
    surveys.reduce((s, r) => s + (r.models_count || 0), 0) / surveys.length;
  const modelPopularity = countItems(surveys.map((s) => s.models_used || []));
  const taskPopularity = countItems(surveys.map((s) => s.task_types || []));
  const topModel = modelPopularity[0]?.name || '—';
  const topTask = taskPopularity[0]?.name || '—';

  // Frequency distribution
  const freqOrder = ['never', 'monthly', 'weekly', 'daily', 'multiple_daily'];
  const freqData = freqOrder.map((key) => ({
    name: FREQ_LABELS[key] || key,
    count: surveys.filter((s) => s.frequency === key).length,
  }));

  // Paid vs free
  const paidOrder = ['free_only', 'mostly_free', 'mix', 'mostly_paid', 'paid_only'];
  const paidData = paidOrder
    .map((key) => ({
      name: PAID_LABELS[key] || key,
      count: surveys.filter((s) => s.paid_vs_free === key).length,
    }))
    .filter((d) => d.count > 0);

  // Vibe coding
  const vibeOrder = ['yes', 'heard', 'no'];
  const vibeData = vibeOrder.map((key) => ({
    key,
    label: VIBE_LABELS[key] || key,
    count: surveys.filter((s) => s.vibe_coding === key).length,
    pct: surveys.length > 0
      ? Math.round((surveys.filter((s) => s.vibe_coding === key).length / surveys.length) * 100)
      : 0,
  }));

  const vibeColors: Record<string, string> = { yes: '#22c55e', heard: '#f59e0b', no: '#94a3b8' };

  return (
    <div className="space-y-6">
      {/* Stat boxes */}
      <div className="grid grid-cols-4 gap-4">
        <StatBox label="Responses" value={surveys.length} dark={dark} />
        <StatBox label="Avg Models / Person" value={avgModels.toFixed(1)} color="#3b82f6" dark={dark} />
        <StatBox label="Most Popular Tool" value={topModel} color="#f59e0b" dark={dark} />
        <StatBox label="Most Common Use" value={topTask} color="#22c55e" dark={dark} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Frequency */}
        <Card title="How Often Do You Use AI?" dark={dark}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={freqData} margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#374151' : '#f3f4f6'} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: dark ? '#9ca3af' : '#6b7280' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: dark ? '#9ca3af' : '#6b7280' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="count" name="People" radius={[4, 4, 0, 0]}>
                {freqData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Model popularity */}
        <Card title="Which AI Models?" dark={dark}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={modelPopularity.slice(0, 8)} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#374151' : '#f3f4f6'} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: dark ? '#9ca3af' : '#6b7280' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: dark ? '#9ca3af' : '#6b7280' }} width={100} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="count" name="Users" radius={[0, 4, 4, 0]} barSize={18}>
                {modelPopularity.slice(0, 8).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Task types */}
        <Card title="What Tasks?" dark={dark}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={taskPopularity.slice(0, 10)} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#374151' : '#f3f4f6'} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: dark ? '#9ca3af' : '#6b7280' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: dark ? '#9ca3af' : '#6b7280' }} width={130} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="count" name="Users" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Paid vs free */}
        <Card title="Paid vs Free AI" dark={dark}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={paidData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                labelLine={true}
                fontSize={11}
              >
                {paidData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>

          {/* Vibe coding */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className={`text-sm font-medium mb-3 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
              Vibe Coding Experience
            </h4>
            <div className="space-y-2">
              {vibeData.map((v) => (
                <div key={v.key}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{v.label}</span>
                    <span className={`text-xs font-semibold ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {v.count} ({v.pct}%)
                    </span>
                  </div>
                  <div className={`h-2 rounded-full ${dark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${v.pct}%`, backgroundColor: vibeColors[v.key] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// Module 1: Maturity — Group consensus only (validated scores)
// ============================================================
function MaturityTab({ dark }: { dark: boolean }) {
  return <GroupConsensusTable dark={dark} />;
}

// ============================================================
// Module 2: Resistance — distribution charts
// ============================================================
function ResistanceTab({ data, dark }: { data: PlenaryData; dark: boolean }) {
  const { stakeholders } = data;

  if (stakeholders.length === 0) {
    return <EmptyState message="No stakeholder data collected yet. Waiting for participants..." dark={dark} />;
  }

  const behaviorCounts = RESISTANCE_BEHAVIORS.map((b) => ({
    name: b.label.length > 18 ? b.label.substring(0, 18) + '...' : b.label,
    count: stakeholders.filter((s) => s.behavior === b.value).length,
  })).filter((b) => b.count > 0);

  const anxietyCounts = ANXIETY_TYPES.map((a) => ({
    name: a.label,
    count: stakeholders.filter((s) => s.anxiety === a.value).length,
  })).filter((a) => a.count > 0);

  const leverCounts = MISSING_LEVERS.map((l) => ({
    name: l.label,
    count: stakeholders.filter((s) => s.missing_lever === l.value).length,
  })).filter((l) => l.count > 0);

  const roleCounts = ['Students', 'Professors', 'Administration', 'Direction'].map((r) => ({
    name: r,
    count: stakeholders.filter((s) => s.role === r).length,
  })).filter((r) => r.count > 0);

  const resistantCount = stakeholders.filter((s) => s.behavior !== 'supportive').length;
  const supportiveCount = stakeholders.filter((s) => s.behavior === 'supportive').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <StatBox label="Total Stakeholders" value={stakeholders.length} dark={dark} />
        <StatBox label="Supportive" value={supportiveCount} color="#22c55e" dark={dark} />
        <StatBox label="Resistant" value={resistantCount} color="#ef4444" dark={dark} />
        <StatBox label="Most Common Anxiety" value={anxietyCounts.sort((a, b) => b.count - a.count)[0]?.name || '—'} dark={dark} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Resistance Behaviors" dark={dark}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={behaviorCounts} margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#374151' : '#f3f4f6'} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: dark ? '#9ca3af' : '#6b7280' }} angle={-20} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: dark ? '#9ca3af' : '#6b7280' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="count" name="Count" radius={[4, 4, 0, 0]}>
                {behaviorCounts.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Anxiety Types (Cao et al.)" dark={dark}>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={anxietyCounts}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                labelLine={true}
                fontSize={11}
              >
                {anxietyCounts.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Missing Diffusion Levers (Singh & Strzelecki)" dark={dark}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={leverCounts} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#374151' : '#f3f4f6'} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: dark ? '#9ca3af' : '#6b7280' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: dark ? '#9ca3af' : '#6b7280' }} width={130} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="count" name="Count" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Stakeholders by Role" dark={dark}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={roleCounts}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={75}
                label={({ name, value }) => `${name} (${value})`}
                fontSize={11}
              >
                {roleCounts.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// Module 3: Solutions
// ============================================================
function SolutionsTab({ data, dark }: { data: PlenaryData; dark: boolean }) {
  const { solutions } = data;

  if (solutions.length === 0) {
    return <EmptyState message="No solutions data collected yet. Waiting for participants..." dark={dark} />;
  }

  const targetCounts = ['Students', 'Professors', 'Administration'].map((t) => ({
    name: t,
    count: solutions.filter((s) => s.target === t).length,
  })).filter((t) => t.count > 0);

  const difficultyCounts = ['Low', 'Medium', 'High'].map((d) => ({
    name: d,
    count: solutions.filter((s) => s.difficulty === d).length,
  }));

  const statusCounts = ['Planned', 'Prototyped', 'Tested'].map((s) => ({
    name: s,
    count: solutions.filter((sol) => sol.status === s).length,
  }));

  const phaseCounts = PLAN_PHASES.map((p) => ({
    name: `Phase ${p.phase}: ${p.label}`,
    count: solutions.filter((s) => s.assigned_phase === p.phase).length,
    color: p.color,
  }));

  const solutionNames = solutions.reduce<Record<string, number>>((acc, s) => {
    acc[s.name] = (acc[s.name] || 0) + 1;
    return acc;
  }, {});
  const topSolutions = Object.entries(solutionNames)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <StatBox label="Total Solutions" value={solutions.length} dark={dark} />
        <StatBox label="For Students" value={targetCounts.find((t) => t.name === 'Students')?.count || 0} color="#3b82f6" dark={dark} />
        <StatBox label="For Professors" value={targetCounts.find((t) => t.name === 'Professors')?.count || 0} color="#f59e0b" dark={dark} />
        <StatBox label="For Admin" value={targetCounts.find((t) => t.name === 'Administration')?.count || 0} color="#22c55e" dark={dark} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Solution Status" dark={dark}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusCounts} margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#374151' : '#f3f4f6'} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: dark ? '#9ca3af' : '#6b7280' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: dark ? '#9ca3af' : '#6b7280' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="count" name="Solutions" radius={[4, 4, 0, 0]}>
                <Cell fill="#94a3b8" />
                <Cell fill="#f59e0b" />
                <Cell fill="#22c55e" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Difficulty Distribution" dark={dark}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={difficultyCounts.filter((d) => d.count > 0)}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, value }) => `${name} (${value})`}
                fontSize={11}
              >
                <Cell fill="#22c55e" />
                <Cell fill="#f59e0b" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Solutions by Phase" dark={dark}>
          <div className="space-y-3">
            {phaseCounts.map((p) => (
              <div key={p.name} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{p.name}</span>
                    <span className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>{p.count}</span>
                  </div>
                  <div className={`h-2 rounded-full mt-1 ${dark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${solutions.length > 0 ? (p.count / solutions.length) * 100 : 0}%`, backgroundColor: p.color }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Most Chosen Solutions" dark={dark}>
          <div className="space-y-2">
            {topSolutions.map(([name, count], i) => (
              <div key={name} className={`flex items-center justify-between py-2 px-3 rounded-lg ${dark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${dark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                    {i + 1}
                  </span>
                  <span className={`text-sm ${dark ? 'text-gray-200' : 'text-gray-800'}`}>{name}</span>
                </div>
                <span className={`text-sm font-semibold ${dark ? 'text-primary-400' : 'text-primary-600'}`}>{count}</span>
              </div>
            ))}
            {topSolutions.length === 0 && (
              <p className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>No data yet</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// Module 4: Plan
// ============================================================
function PlanTab({ data, dark }: { data: PlenaryData; dark: boolean }) {
  const { tasks, kpis } = data;

  if (tasks.length === 0 && kpis.length === 0) {
    return <EmptyState message="No plan data collected yet. Waiting for participants..." dark={dark} />;
  }

  const tasksByPhase = PLAN_PHASES.map((p) => ({
    name: `Phase ${p.phase}`,
    label: p.label,
    period: p.period,
    color: p.color,
    total: tasks.filter((t) => t.phase === p.phase).length,
    done: tasks.filter((t) => t.phase === p.phase && t.status === 'Done').length,
    inProgress: tasks.filter((t) => t.phase === p.phase && t.status === 'In Progress').length,
  }));

  const priorityCounts = ['High', 'Medium', 'Low'].map((p) => ({
    name: p,
    count: tasks.filter((t) => t.priority === p).length,
  }));

  const statusCounts = ['Not Started', 'In Progress', 'Done'].map((s) => ({
    name: s,
    count: tasks.filter((t) => t.status === s).length,
  }));

  const championRoles = ['Students', 'Professors', 'Administration'].map((r) => ({
    name: r,
    count: tasks.filter((t) => t.champion_target === r).length,
  })).filter((r) => r.count > 0);

  const kpiLeading = kpis.filter((k) => k.type === 'Leading').length;
  const kpiLagging = kpis.filter((k) => k.type === 'Lagging').length;

  const taskNames = tasks.reduce<Record<string, number>>((acc, t) => {
    acc[t.name] = (acc[t.name] || 0) + 1;
    return acc;
  }, {});
  const topTasks = Object.entries(taskNames)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <StatBox label="Total Actions" value={tasks.length} dark={dark} />
        <StatBox label="Completed" value={statusCounts.find((s) => s.name === 'Done')?.count || 0} color="#22c55e" dark={dark} />
        <StatBox label="KPIs Defined" value={kpis.length} color="#3b82f6" dark={dark} />
        <StatBox label="High Priority" value={priorityCounts.find((p) => p.name === 'High')?.count || 0} color="#ef4444" dark={dark} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Actions by Phase" dark={dark} className="lg:col-span-2">
          <div className="grid grid-cols-3 gap-4">
            {tasksByPhase.map((p) => (
              <div key={p.name} className={`rounded-lg p-4 border ${dark ? 'border-gray-600 bg-gray-750' : 'border-gray-100 bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>
                    {p.name}: {p.label}
                  </span>
                </div>
                <p className={`text-xs mb-3 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{p.period}</p>
                <div className="flex gap-4 text-center">
                  <div>
                    <div className={`text-xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{p.total}</div>
                    <div className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Total</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-amber-500">{p.inProgress}</div>
                    <div className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Active</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-green-500">{p.done}</div>
                    <div className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Done</div>
                  </div>
                </div>
                {p.total > 0 && (
                  <div className={`h-2 rounded-full mt-3 ${dark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className="h-full rounded-full bg-green-500 transition-all"
                      style={{ width: `${(p.done / p.total) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Task Status" dark={dark}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusCounts} margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#374151' : '#f3f4f6'} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: dark ? '#9ca3af' : '#6b7280' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: dark ? '#9ca3af' : '#6b7280' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="count" name="Tasks" radius={[4, 4, 0, 0]}>
                <Cell fill="#94a3b8" />
                <Cell fill="#f59e0b" />
                <Cell fill="#22c55e" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="KPIs & Champions" dark={dark}>
          <div className="space-y-4">
            <div>
              <h4 className={`text-xs font-medium mb-2 uppercase tracking-wider ${dark ? 'text-gray-400' : 'text-gray-500'}`}>KPI Types</h4>
              <div className="flex gap-3">
                <div className={`flex-1 rounded-lg p-3 text-center ${dark ? 'bg-gray-700' : 'bg-blue-50'}`}>
                  <div className="text-lg font-bold text-blue-500">{kpiLeading}</div>
                  <div className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Leading</div>
                </div>
                <div className={`flex-1 rounded-lg p-3 text-center ${dark ? 'bg-gray-700' : 'bg-green-50'}`}>
                  <div className="text-lg font-bold text-green-500">{kpiLagging}</div>
                  <div className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Lagging</div>
                </div>
              </div>
            </div>
            {championRoles.length > 0 && (
              <div>
                <h4 className={`text-xs font-medium mb-2 uppercase tracking-wider ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Champions by Role</h4>
                <div className="space-y-1.5">
                  {championRoles.map((r, i) => (
                    <div key={r.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                        <span className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{r.name}</span>
                      </div>
                      <span className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>{r.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {topTasks.length > 0 && (
          <Card title="Most Common Actions" dark={dark} className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {topTasks.map(([name, count], i) => (
                <div key={name} className={`rounded-lg p-3 text-center ${dark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="text-lg font-bold" style={{ color: COLORS[i] }}>{count}</div>
                  <div className={`text-xs mt-1 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{name}</div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
