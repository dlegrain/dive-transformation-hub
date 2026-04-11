import { useRef, useState, useCallback } from 'react';
import { FileDown, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { useStore } from '../../lib/store';
import { DIMENSIONS, RESISTANCE_BEHAVIORS, ANXIETY_TYPES, MISSING_LEVERS, PLAN_PHASES, REFERENCES } from '../../lib/constants';
import { generateCounterMeasure } from '../../lib/counter-measures';
import { detectAlerts } from '../../lib/ai-advisor';
import type { DimensionKey, DimensionAssessment } from '../../types';

// ============================================================
// Helpers
// ============================================================

function dimAvg(d: DimensionAssessment): number {
  const known = [d.tools, d.data, d.culture].filter((v) => v > 0) as number[];
  if (known.length === 0) return 0;
  return Math.round((known.reduce((a, b) => a + b, 0) / known.length) * 10) / 10;
}

function overallScore(dimensions: Record<DimensionKey, DimensionAssessment>): number {
  const sum = DIMENSIONS.reduce((acc, dim) => acc + dimAvg(dimensions[dim.key]), 0);
  return Math.round((sum / DIMENSIONS.length) * 10) / 10;
}

function scoreColor(score: number): string {
  if (score < 1.5) return '#ef4444';
  if (score < 2.5) return '#f59e0b';
  return '#22c55e';
}

function generateRecommendations(store: ReturnType<typeof useStore>): string[] {
  const recs: string[] = [];
  const dims = store.dimensions;
  const weakDims = DIMENSIONS.filter((d) => dimAvg(dims[d.key]) < 1.5);
  const overall = overallScore(dims);

  // Weak dimensions
  if (weakDims.length > 0) {
    recs.push(
      `Priority: your weakest dimensions (${weakDims.map((d) => d.label).join(', ')}) score below 1.5/3. Focus Phase 1 resources here. The #1 barrier is lack of personnel preparation, not technology (Bravo-Jaico et al., 2025).`
    );
  }

  // Overall low maturity
  if (overall < 2.0) {
    recs.push(
      `Your overall maturity score (${overall}/3) indicates an early-stage institution. Prioritize infrastructure and culture before deploying advanced AI tools. Use the 3-layer model: Activation → Implementation → Institutionalization (Nguyen & Hong, 2025).`
    );
  }

  // Displacement anxiety present
  const hasDisplacement = store.stakeholders.some((s) => s.anxiety === 'displacement');
  if (hasDisplacement) {
    recs.push(
      `Displacement anxiety detected among stakeholders. This is the hardest anxiety to address. Frame AI as augmentation, not replacement. Provide career orientation sessions and demonstrate how AI frees time for higher-value tasks (Cao et al., 2026).`
    );
  }

  // Subtle resistance
  const subtleCount = store.stakeholders.filter(
    (s) => s.behavior === 'subtle_undermining' || s.behavior === 'subtle_avoiding'
  ).length;
  if (subtleCount > 0) {
    recs.push(
      `${subtleCount} stakeholder(s) exhibit subtle resistance (undermining or avoiding). This is more dangerous than open opposition because it's invisible until too late. Monitor actual adoption metrics, not just stated attitudes (Deacon et al., 2025).`
    );
  }

  // Professor-specific
  const profStakeholders = store.stakeholders.filter((s) => s.role === 'Professors');
  if (profStakeholders.length > 0) {
    recs.push(
      `For professors: avoid public demonstrations and the "champion" model. Academics evaluate tools privately. Offer risk-free, individual experimentation with immediate time savings on their specific tasks (Singh & Strzelecki, 2026).`
    );
  }

  // No KPIs
  if (store.kpis.length === 0 && store.tasks.length > 0) {
    recs.push(
      `Your plan has ${store.tasks.length} tasks but no success metrics. Without KPIs, you won't know if the transformation is working. Define at least 3 leading indicators and 2 lagging indicators.`
    );
  }

  // Low-difficulty not in Phase 1
  const misplacedQuickWins = store.solutions.filter(
    (s) => s.difficulty === 'Low' && s.assigned_phase !== 1
  );
  if (misplacedQuickWins.length > 0) {
    recs.push(
      `${misplacedQuickWins.length} low-difficulty solution(s) are not assigned to Phase 1. Quick wins in the first 30 days build momentum and create visible proof of value (Nguyen & Hong, 2025).`
    );
  }

  // Fallback
  if (recs.length === 0) {
    recs.push(
      'Your strategic plan looks comprehensive. Continue to iterate — the 3-layer deployment model (Activation → Implementation → Institutionalization) provides a strong framework for sustained progress (Nguyen & Hong, 2025).'
    );
  }

  return recs;
}

// ============================================================
// Inline styles for PDF rendering (Tailwind won't carry over)
// ============================================================

const styles = {
  page: {
    fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    color: '#1f2937',
    fontSize: '11px',
    lineHeight: '1.5',
    maxWidth: '210mm',
    margin: '0 auto',
    background: '#fff',
  } as React.CSSProperties,
  pageBreak: {
    pageBreakBefore: 'always' as const,
    paddingTop: '20px',
  } as React.CSSProperties,
  cover: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '280mm',
    textAlign: 'center' as const,
    padding: '60px 40px',
  } as React.CSSProperties,
  coverTitle: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#1e3a5f',
    marginBottom: '8px',
    letterSpacing: '-0.5px',
  } as React.CSSProperties,
  coverSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '48px',
  } as React.CSSProperties,
  coverMeta: {
    fontSize: '13px',
    color: '#374151',
    marginBottom: '6px',
  } as React.CSSProperties,
  coverDate: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '24px',
  } as React.CSSProperties,
  section: {
    padding: '24px 32px',
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#1e3a5f',
    borderBottom: '2px solid #1e3a5f',
    paddingBottom: '6px',
    marginBottom: '16px',
  } as React.CSSProperties,
  sectionSubtitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '8px',
    marginTop: '16px',
  } as React.CSSProperties,
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '10px',
    marginBottom: '12px',
  } as React.CSSProperties,
  th: {
    background: '#f3f4f6',
    border: '1px solid #d1d5db',
    padding: '6px 8px',
    textAlign: 'left' as const,
    fontWeight: 600,
    color: '#374151',
    fontSize: '10px',
  } as React.CSSProperties,
  td: {
    border: '1px solid #e5e7eb',
    padding: '5px 8px',
    verticalAlign: 'top' as const,
    fontSize: '10px',
  } as React.CSSProperties,
  badge: (color: string) => ({
    fontSize: '10px',
    fontWeight: 700,
    color: color,
  }) as React.CSSProperties,
  alertBox: {
    background: '#fef3c7',
    border: '1px solid #fbbf24',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '10px',
    color: '#92400e',
    marginBottom: '8px',
  } as React.CSSProperties,
  criticalBox: {
    background: '#fee2e2',
    border: '1px solid #f87171',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '10px',
    color: '#991b1b',
    marginBottom: '8px',
  } as React.CSSProperties,
  recBox: {
    background: '#eff6ff',
    border: '1px solid #93c5fd',
    borderRadius: '6px',
    padding: '10px 14px',
    fontSize: '11px',
    color: '#1e3a5f',
    marginBottom: '10px',
    lineHeight: '1.6',
  } as React.CSSProperties,
  footer: {
    borderTop: '1px solid #d1d5db',
    padding: '16px 32px',
    fontSize: '8px',
    color: '#9ca3af',
    lineHeight: '1.6',
  } as React.CSSProperties,
  scoreCell: (score: number) => ({
    border: '1px solid #e5e7eb',
    padding: '5px 8px',
    fontWeight: 600,
    color: scoreColor(score),
    textAlign: 'center' as const,
    fontSize: '10px',
  }) as React.CSSProperties,
  phaseHeader: (color: string) => ({
    background: color,
    color: '#fff',
    padding: '6px 10px',
    fontWeight: 700,
    fontSize: '11px',
    borderRadius: '4px 4px 0 0',
    marginTop: '12px',
  }) as React.CSSProperties,
  counterMeasure: {
    fontSize: '9px',
    color: '#4b5563',
    lineHeight: '1.5',
    maxHeight: '80px',
    overflow: 'hidden',
  } as React.CSSProperties,
};

// ============================================================
// Component
// ============================================================

export default function ExportPage() {
  const store = useStore();
  const exportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const navigate = useNavigate();

  const radarData = DIMENSIONS.map((dim) => ({
    dimension: dim.label,
    score: dimAvg(store.dimensions[dim.key]),
    fullMark: 3,
  }));

  const overall = overallScore(store.dimensions);
  const weakDims = DIMENSIONS.filter((d) => dimAvg(store.dimensions[d.key]) < 1.5);
  const alerts = detectAlerts(store.dimensions, store.stakeholders, store.solutions, store.tasks, store.kpis);
  const recommendations = generateRecommendations(store);

  const handleExport = useCallback(async () => {
    if (!exportRef.current) return;
    setIsExporting(true);

    try {
      // Dynamic import to avoid SSR issues
      const html2pdf = (await import('html2pdf.js')).default;

      const opt = {
        margin: [8, 8, 16, 8] as [number, number, number, number],
        filename: `DIVE-Strategic-Plan-${store.institutionName || 'Report'}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.95 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
        },
        jsPDF: {
          unit: 'mm' as const,
          format: 'a4' as const,
          orientation: 'portrait' as const,
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      };

      await html2pdf().set(opt).from(exportRef.current).save();
    } catch (err) {
      console.error('PDF export error:', err);
      alert('PDF export failed. Please try the browser print dialog (Ctrl+P / Cmd+P) as a fallback.');
    } finally {
      setIsExporting(false);
    }
  }, [store.institutionName]);

  const difficultyColor = (d: string) => {
    if (d === 'Low') return '#22c55e';
    if (d === 'Medium') return '#f59e0b';
    return '#ef4444';
  };

  const statusColor = (s: string) => {
    if (s === 'Tested') return '#22c55e';
    if (s === 'Prototyped') return '#3b82f6';
    return '#9ca3af';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Controls bar (not exported) */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to modules
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            Tip: you can also use Ctrl+P / Cmd+P for browser print
          </span>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {isExporting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileDown size={16} />
                Download PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Export content (this div gets rendered to PDF) */}
      <div ref={exportRef} style={styles.page}>

        {/* ========== COVER PAGE ========== */}
        <div style={styles.cover}>
          <div style={{ width: '60px', height: '4px', background: '#1e3a5f', marginBottom: '32px', borderRadius: '2px' }} />
          <div style={styles.coverTitle}>AI Adoption Strategic Plan</div>
          <div style={styles.coverSubtitle}>DIVE Transformation Hub — Executive Report</div>
          <div style={{ width: '40px', height: '1px', background: '#d1d5db', margin: '24px auto' }} />
          {store.institutionName && (
            <div style={{ ...styles.coverMeta, fontSize: '16px', fontWeight: 600 }}>
              {store.institutionName}
            </div>
          )}
          {store.assessorName && (
            <div style={styles.coverMeta}>Prepared by: {store.assessorName}</div>
          )}
          <div style={styles.coverDate}>
            Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div style={{ ...styles.coverDate, marginTop: '48px', fontSize: '10px' }}>
            DIVE Seminar — Ho Chi Minh City, April 2026
          </div>
        </div>

        {/* ========== MODULE 1: MATURITY DIAGNOSTIC ========== */}
        <div style={styles.pageBreak}>
          <div style={styles.section}>
            <div style={styles.sectionTitle}>1. Maturity Diagnostic</div>

            {/* Radar chart */}
            <div style={{ width: '100%', height: '320px', marginBottom: '16px' }}>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 9, fill: '#6b7280' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 3]} tickCount={4} tick={{ fontSize: 8, fill: '#9ca3af' }} />
                  <Radar name="Maturity" dataKey="score" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Overall score */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '24px', fontWeight: 700, color: scoreColor(overall) }}>
                {overall.toFixed(1)}
              </span>
              <span style={{ fontSize: '14px', color: '#9ca3af' }}> / 3.0 — Overall Maturity Score</span>
            </div>

            {/* Dimension table */}
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Dimension</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Tools</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Data</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Culture</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Average</th>
                </tr>
              </thead>
              <tbody>
                {DIMENSIONS.map((dim) => {
                  const d = store.dimensions[dim.key];
                  const avg = dimAvg(d);
                  return (
                    <tr key={dim.key}>
                      <td style={{ ...styles.td, fontWeight: 500 }}>{dim.label}</td>
                      <td style={styles.scoreCell(d.tools)}>{d.tools}</td>
                      <td style={styles.scoreCell(d.data)}>{d.data}</td>
                      <td style={styles.scoreCell(d.culture)}>{d.culture}</td>
                      <td style={styles.scoreCell(avg)}>{avg.toFixed(1)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Weakness alerts */}
            {weakDims.length > 0 && (
              <>
                <div style={styles.sectionSubtitle}>Key Weaknesses</div>
                {weakDims.map((dim) => (
                  <div key={dim.key} style={styles.alertBox}>
                    <strong>{dim.label}</strong> scores {dimAvg(store.dimensions[dim.key]).toFixed(1)}/3 — this dimension should be a priority in your 90-day plan.
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* ========== MODULE 2: RESISTANCE MAP ========== */}
        <div style={styles.pageBreak}>
          <div style={styles.section}>
            <div style={styles.sectionTitle}>2. Resistance Map</div>

            {store.stakeholders.length === 0 ? (
              <div style={{ color: '#9ca3af', fontStyle: 'italic', padding: '20px 0' }}>
                No stakeholders have been mapped yet.
              </div>
            ) : (
              <>
                {/* Summary stats */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ background: '#f3f4f6', borderRadius: '6px', padding: '8px 14px', flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#374151' }}>{store.stakeholders.length}</div>
                    <div style={{ fontSize: '9px', color: '#6b7280' }}>Total Stakeholders</div>
                  </div>
                  <div style={{ background: '#fef3c7', borderRadius: '6px', padding: '8px 14px', flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#92400e' }}>
                      {store.stakeholders.filter((s) => s.behavior === 'subtle_undermining' || s.behavior === 'subtle_avoiding').length}
                    </div>
                    <div style={{ fontSize: '9px', color: '#92400e' }}>Subtle Resistance</div>
                  </div>
                  <div style={{ background: '#dcfce7', borderRadius: '6px', padding: '8px 14px', flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#166534' }}>
                      {store.stakeholders.filter((s) => s.anxiety === 'ethical_engagement').length}
                    </div>
                    <div style={{ fontSize: '9px', color: '#166534' }}>Potential Allies</div>
                  </div>
                </div>

                {/* Stakeholder table */}
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Role</th>
                      <th style={styles.th}>Behavior</th>
                      <th style={styles.th}>Anxiety</th>
                      <th style={styles.th}>Missing Lever</th>
                    </tr>
                  </thead>
                  <tbody>
                    {store.stakeholders.map((s, i) => (
                      <tr key={i}>
                        <td style={{ ...styles.td, fontWeight: 500 }}>{s.name}</td>
                        <td style={styles.td}>
                          {s.role}{s.discipline ? ` (${s.discipline})` : ''}
                        </td>
                        <td style={styles.td}>
                          {RESISTANCE_BEHAVIORS.find((b) => b.value === s.behavior)?.label}
                        </td>
                        <td style={styles.td}>
                          {ANXIETY_TYPES.find((a) => a.value === s.anxiety)?.label}
                        </td>
                        <td style={styles.td}>
                          {MISSING_LEVERS.find((l) => l.value === s.missing_lever)?.label}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Counter-measures */}
                <div style={styles.sectionSubtitle}>Generated Counter-Measures</div>
                {store.stakeholders.map((s, i) => (
                  <div key={i} style={{ marginBottom: '10px', padding: '8px 12px', background: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                      {s.name} ({s.role})
                    </div>
                    <div style={styles.counterMeasure}>
                      {generateCounterMeasure({
                        role: s.role,
                        discipline: s.discipline,
                        behavior: s.behavior,
                        anxiety: s.anxiety,
                        missingLever: s.missing_lever,
                      })}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* ========== MODULE 3: SOLUTIONS ARSENAL ========== */}
        <div style={styles.pageBreak}>
          <div style={styles.section}>
            <div style={styles.sectionTitle}>3. AI Solutions Arsenal</div>

            {store.solutions.length === 0 ? (
              <div style={{ color: '#9ca3af', fontStyle: 'italic', padding: '20px 0' }}>
                No solutions have been created yet.
              </div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Solution</th>
                    <th style={styles.th}>Target</th>
                    <th style={styles.th}>Difficulty</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Phase</th>
                    <th style={styles.th}>Problem Solved</th>
                  </tr>
                </thead>
                <tbody>
                  {store.solutions.map((s, i) => (
                    <tr key={i}>
                      <td style={{ ...styles.td, fontWeight: 500 }}>{s.name}</td>
                      <td style={styles.td}>{s.target}</td>
                      <td style={styles.td}>
                        <span style={styles.badge(difficultyColor(s.difficulty))}>{s.difficulty}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.badge(statusColor(s.status))}>{s.status}</span>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>{s.assigned_phase || '—'}</td>
                      <td style={styles.td}>{s.problem_solved || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Vibe coding notes */}
            {store.solutions.filter((s) => s.vibe_coding_notes).length > 0 && (
              <>
                <div style={styles.sectionSubtitle}>Vibe Coding Notes</div>
                {store.solutions
                  .filter((s) => s.vibe_coding_notes)
                  .map((s, i) => (
                    <div key={i} style={{ marginBottom: '8px', padding: '6px 10px', background: '#f9fafb', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: '10px', fontWeight: 600, marginBottom: '2px' }}>{s.name}</div>
                      <div style={{ fontSize: '9px', color: '#4b5563' }}>{s.vibe_coding_notes}</div>
                    </div>
                  ))}
              </>
            )}
          </div>
        </div>

        {/* ========== MODULE 4: 90-DAY PLAN ========== */}
        <div style={styles.pageBreak}>
          <div style={styles.section}>
            <div style={styles.sectionTitle}>4. 90-Day Adoption Plan</div>

            {store.tasks.length === 0 ? (
              <div style={{ color: '#9ca3af', fontStyle: 'italic', padding: '20px 0' }}>
                No tasks have been planned yet.
              </div>
            ) : (
              PLAN_PHASES.map((phase) => {
                const phaseTasks = store.tasks.filter((t) => t.phase === phase.phase);
                if (phaseTasks.length === 0) return null;
                return (
                  <div key={phase.phase} style={{ marginBottom: '16px' }}>
                    <div style={styles.phaseHeader(phase.color)}>
                      Phase {phase.phase}: {phase.label} — {phase.period}
                    </div>
                    <table style={{ ...styles.table, marginBottom: 0 }}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Task</th>
                          <th style={styles.th}>Champion</th>
                          <th style={styles.th}>Priority</th>
                          <th style={styles.th}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {phaseTasks.map((t, i) => (
                          <tr key={i}>
                            <td style={{ ...styles.td, fontWeight: 500 }}>{t.name}</td>
                            <td style={styles.td}>
                              {t.champion_name ? `${t.champion_name} (${t.champion_target})` : '—'}
                            </td>
                            <td style={styles.td}>
                              <span style={styles.badge(
                                t.priority === 'High' ? '#ef4444' : t.priority === 'Medium' ? '#f59e0b' : '#22c55e'
                              )}>
                                {t.priority}
                              </span>
                            </td>
                            <td style={styles.td}>{t.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })
            )}

            {/* Cross-module alerts */}
            {alerts.length > 0 && (
              <>
                <div style={styles.sectionSubtitle}>Cross-Module Alerts</div>
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    style={alert.severity === 'critical' ? styles.criticalBox : styles.alertBox}
                  >
                    {alert.message}
                  </div>
                ))}
              </>
            )}

            {/* KPI table */}
            {store.kpis.length > 0 && (
              <>
                <div style={styles.sectionSubtitle}>Key Performance Indicators</div>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>KPI</th>
                      <th style={styles.th}>Type</th>
                      <th style={styles.th}>Target</th>
                      <th style={styles.th}>Data Source</th>
                      <th style={styles.th}>Responsible</th>
                    </tr>
                  </thead>
                  <tbody>
                    {store.kpis.map((k, i) => (
                      <tr key={i}>
                        <td style={{ ...styles.td, fontWeight: 500 }}>{k.name}</td>
                        <td style={styles.td}>
                          <span style={styles.badge(k.type === 'Leading' ? '#3b82f6' : '#8b5cf6')}>
                            {k.type}
                          </span>
                        </td>
                        <td style={styles.td}>{k.target || '—'}</td>
                        <td style={styles.td}>{k.data_source || '—'}</td>
                        <td style={styles.td}>{k.responsible || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>

        {/* ========== OPERATIONAL RECOMMENDATIONS ========== */}
        <div style={styles.pageBreak}>
          <div style={styles.section}>
            <div style={styles.sectionTitle}>5. Operational Recommendations</div>
            <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '16px' }}>
              Research-backed recommendations tailored to your institution's profile.
            </div>
            {recommendations.map((rec, i) => (
              <div key={i} style={styles.recBox}>
                <strong style={{ fontSize: '12px' }}>#{i + 1}</strong> — {rec}
              </div>
            ))}
          </div>
        </div>

        {/* ========== BIBLIOGRAPHY FOOTER ========== */}
        <div style={styles.footer}>
          <div style={{ fontWeight: 600, fontSize: '9px', color: '#374151', marginBottom: '6px' }}>
            Scientific References
          </div>
          {REFERENCES.map((ref, i) => (
            <div key={i} style={{ marginBottom: '2px' }}>
              [{i + 1}] {ref}
            </div>
          ))}
          <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '8px', color: '#d1d5db' }}>
            Generated by DIVE Transformation Hub — DIVE Seminar, Ho Chi Minh City, April 2026
          </div>
        </div>
      </div>
    </div>
  );
}
