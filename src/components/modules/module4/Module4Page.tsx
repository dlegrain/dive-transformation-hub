import { useState } from 'react';
import { Plus, Trash2, AlertTriangle, CheckCircle, Target } from 'lucide-react';
import { PLAN_PHASES } from '../../../lib/constants';
import { useStore } from '../../../lib/store';
import type { SolutionTarget, Priority, TaskStatus, KPIType, PlanPhase } from '../../../types';

export default function Module4Page() {
  const { tasks, setTasks, kpis, setKpis } = useStore();
  const [showTaskForm, setShowTaskForm] = useState<number | null>(null);
  const [showKpiForm, setShowKpiForm] = useState(false);

  const [taskForm, setTaskForm] = useState({
    name: '',
    champion_name: '',
    champion_target: 'Students' as SolutionTarget,
    priority: 'Medium' as Priority,
  });

  const [kpiForm, setKpiForm] = useState({
    name: '',
    type: 'Leading' as KPIType,
    target: '',
    data_source: '',
    responsible: '',
    phase: 1 as PlanPhase,
  });

  const addTask = (phase: PlanPhase) => {
    setTasks((prev) => [
      ...prev,
      {
        ...taskForm,
        id: crypto.randomUUID(),
        group_id: '',
        phase,
        status: 'Not Started' as TaskStatus,
        sort_order: prev.filter((t) => t.phase === phase).length,
      },
    ]);
    setTaskForm({ name: '', champion_name: '', champion_target: 'Students', priority: 'Medium' });
    setShowTaskForm(null);
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  const addKpi = () => {
    setKpis((prev) => [...prev, { ...kpiForm, id: crypto.randomUUID(), group_id: '' }]);
    setKpiForm({ name: '', type: 'Leading', target: '', data_source: '', responsible: '', phase: 1 });
    setShowKpiForm(false);
  };

  const removeKpi = (id: string) => {
    setKpis((prev) => prev.filter((k) => k.id !== id));
  };

  const getPersonInChargeAlert = (target: SolutionTarget | undefined) => {
    if (!target) return null;
    if (target === 'Professors') {
      return {
        type: 'danger' as const,
        message:
          'Warning: Among academics, a top-down approach can backfire. Professors evaluate tools privately. ' +
          'Offer risk-free, individual experimentation instead. No public demos, no peer pressure (Singh & Strzelecki, 2026; Cao et al., 2026).',
      };
    }
    return {
      type: 'success' as const,
      message:
        `Excellent strategy: social influence and peer dynamics are massive adoption drivers for ${target.toLowerCase()}. ` +
        `${target === 'Students' ? 'Student ambassadors create institutional momentum' : 'Administrative leads prove efficiency gains that are hard to argue against'} (Bui et al., 2025).`,
    };
  };

  const priorityColors: Record<Priority, string> = {
    Low: 'bg-gray-100 text-gray-600',
    Medium: 'bg-warning-100 text-warning-700',
    High: 'bg-danger-100 text-danger-700',
  };

  const statusColors: Record<TaskStatus, string> = {
    'Not Started': 'bg-gray-100 text-gray-600',
    'In Progress': 'bg-primary-100 text-primary-700',
    Done: 'bg-accent-100 text-accent-700',
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-primary-600 font-medium mb-1">
          <span className="bg-primary-100 px-2 py-0.5 rounded">Day 4</span>
          Module 4
        </div>
        <h2 className="text-2xl font-bold text-gray-900">90-Day Adoption Plan</h2>
        <p className="text-gray-500 mt-1">
          Build your action plan in 3 phases. Assign people in charge, track progress, define success metrics.
        </p>
        <p className="text-xs text-gray-400 mt-2 italic">
          Based on Lewin's model adapted by Nguyen & Hong (2025)
        </p>
      </div>

      {/* Kanban: 3 phases */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {PLAN_PHASES.map((phase) => {
          const phaseTasks = tasks.filter((t) => t.phase === phase.phase);

          return (
            <div key={phase.phase} className="bg-white rounded-lg border border-gray-200">
              {/* Phase header */}
              <div className="p-4 border-b border-gray-100" style={{ borderTopColor: phase.color, borderTopWidth: 3 }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">Phase {phase.phase}: {phase.label}</h3>
                    <p className="text-xs text-gray-500">{phase.period}</p>
                  </div>
                  <span className="text-xs font-medium text-gray-400">{phaseTasks.length} tasks</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 italic">{phase.objective}</p>
              </div>

              {/* Guiding questions */}
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                <ul className="space-y-0.5">
                  {phase.questions.map((q, i) => (
                    <li key={i} className="text-[11px] text-gray-400 flex gap-1">
                      <span>?</span> {q}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tasks */}
              <div className="p-3 space-y-2 min-h-[120px]">
                {phaseTasks.map((task) => {
                  const alert = getPersonInChargeAlert(task.champion_target);

                  return (
                    <div key={task.id} className="border border-gray-200 rounded-lg p-3 group">
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{task.name}</span>
                        <button onClick={() => removeTask(task.id!)} className="text-gray-300 hover:text-danger-500 opacity-0 group-hover:opacity-100">
                          <Trash2 size={12} />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2">
                        <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                        {task.champion_name && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-primary-50 text-primary-600">
                            In charge: {task.champion_name}
                          </span>
                        )}
                      </div>

                      {/* Status toggle */}
                      <div className="flex gap-1 mb-2">
                        {(['Not Started', 'In Progress', 'Done'] as TaskStatus[]).map((s) => (
                          <button
                            key={s}
                            onClick={() => updateTaskStatus(task.id!, s)}
                            className={`px-1.5 py-0.5 text-[10px] font-medium rounded transition-colors ${
                              task.status === s ? statusColors[s] : 'bg-gray-50 text-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>

                      {/* Champion alert */}
                      {alert && task.champion_target && (
                        <div className={`p-2 rounded text-[11px] leading-relaxed ${
                          alert.type === 'danger' ? 'bg-danger-50 text-danger-700' : 'bg-accent-50 text-accent-700'
                        }`}>
                          {alert.type === 'danger' ? <AlertTriangle size={12} className="inline mr-1" /> : <CheckCircle size={12} className="inline mr-1" />}
                          {alert.message}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add task form */}
                {showTaskForm === phase.phase ? (
                  <div className="border-2 border-dashed border-primary-200 rounded-lg p-3 space-y-2">
                    <input
                      type="text"
                      value={taskForm.name}
                      onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })}
                      placeholder="Task name"
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded outline-none focus:ring-1 focus:ring-primary-500"
                      autoFocus
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={taskForm.champion_name}
                        onChange={(e) => setTaskForm({ ...taskForm, champion_name: e.target.value })}
                        placeholder="Person in charge"
                        className="px-2 py-1.5 text-xs border border-gray-300 rounded outline-none"
                      />
                      <select
                        value={taskForm.champion_target}
                        onChange={(e) => setTaskForm({ ...taskForm, champion_target: e.target.value as SolutionTarget })}
                        className="px-2 py-1.5 text-xs border border-gray-300 rounded outline-none"
                      >
                        <option value="Students">Students</option>
                        <option value="Professors">Professors</option>
                        <option value="Administration">Administration</option>
                      </select>
                    </div>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as Priority })}
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded outline-none"
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Priority</option>
                    </select>
                    <div className="flex gap-1">
                      <button onClick={() => addTask(phase.phase as PlanPhase)} disabled={!taskForm.name.trim()} className="px-3 py-1 bg-primary-600 text-white text-xs rounded hover:bg-primary-700 disabled:opacity-50">
                        Add
                      </button>
                      <button onClick={() => setShowTaskForm(null)} className="px-3 py-1 text-gray-500 text-xs rounded hover:bg-gray-100">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowTaskForm(phase.phase)}
                    className="w-full py-2 border border-dashed border-gray-300 text-gray-400 text-xs rounded-lg hover:border-primary-400 hover:text-primary-600 transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus size={12} /> Add Task
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* KPIs Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target size={18} className="text-primary-600" />
          <h3 className="font-bold text-gray-900">Key Performance Indicators</h3>
          <span className="text-xs text-gray-400">— Align with your morning Change Dashboard</span>
        </div>

        {kpis.length > 0 && (
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">KPI</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Type</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Target (90d)</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Data Source</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Owner</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Phase</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {kpis.map((kpi) => (
                  <tr key={kpi.id} className="border-b border-gray-100 group">
                    <td className="py-2 px-3 font-medium text-gray-900">{kpi.name}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 text-xs rounded ${kpi.type === 'Leading' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'}`}>
                        {kpi.type}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-600">{kpi.target}</td>
                    <td className="py-2 px-3 text-gray-500 text-xs">{kpi.data_source}</td>
                    <td className="py-2 px-3 text-gray-600">{kpi.responsible}</td>
                    <td className="py-2 px-3 text-gray-500">Phase {kpi.phase}</td>
                    <td className="py-2 px-1">
                      <button onClick={() => removeKpi(kpi.id!)} className="text-gray-300 hover:text-danger-500 opacity-0 group-hover:opacity-100">
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showKpiForm ? (
          <div className="border-2 border-dashed border-primary-200 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">KPI Name</label>
                <input type="text" value={kpiForm.name} onChange={(e) => setKpiForm({ ...kpiForm, name: e.target.value })} placeholder="e.g., % courses using AI assessment" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                <select value={kpiForm.type} onChange={(e) => setKpiForm({ ...kpiForm, type: e.target.value as KPIType })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none">
                  <option value="Leading">Leading</option>
                  <option value="Lagging">Lagging</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Target (90 days)</label>
                <input type="text" value={kpiForm.target} onChange={(e) => setKpiForm({ ...kpiForm, target: e.target.value })} placeholder="e.g., 25% of courses" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Data Source</label>
                <input type="text" value={kpiForm.data_source} onChange={(e) => setKpiForm({ ...kpiForm, data_source: e.target.value })} placeholder="e.g., LMS usage logs" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Responsible</label>
                <input type="text" value={kpiForm.responsible} onChange={(e) => setKpiForm({ ...kpiForm, responsible: e.target.value })} placeholder="e.g., VP Academic Affairs" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Phase</label>
                <select value={kpiForm.phase} onChange={(e) => setKpiForm({ ...kpiForm, phase: Number(e.target.value) as PlanPhase })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none">
                  <option value={1}>Phase 1 (Days 1-30)</option>
                  <option value={2}>Phase 2 (Days 31-60)</option>
                  <option value={3}>Phase 3 (Days 61-90)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={addKpi} disabled={!kpiForm.name.trim()} className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-50">Add KPI</button>
              <button onClick={() => setShowKpiForm(false)} className="px-4 py-2 text-gray-600 text-sm rounded-lg hover:bg-gray-100">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowKpiForm(true)} className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 text-gray-500 text-sm rounded-lg hover:border-primary-400 hover:text-primary-600 transition-colors">
            <Plus size={14} /> Add KPI
          </button>
        )}
      </div>
    </div>
  );
}
