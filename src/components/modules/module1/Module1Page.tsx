import { useState } from 'react';
import DimensionForm from './DimensionForm';
import RadarChart from './RadarChart';
import type { DimensionKey, DimensionAssessment } from '../../../types';

const defaultDimensions: Record<DimensionKey, DimensionAssessment> = {
  socioCultural: { tools: 1, data: 1, culture: 1 },
  teachingLearning: { tools: 1, data: 1, culture: 1 },
  academicManagement: { tools: 1, data: 1, culture: 1 },
  administrativeManagement: { tools: 1, data: 1, culture: 1 },
  researchInnovation: { tools: 1, data: 1, culture: 1 },
  digitalGovernance: { tools: 1, data: 1, culture: 1 },
  institutionalImage: { tools: 1, data: 1, culture: 1 },
  universityExtension: { tools: 1, data: 1, culture: 1 },
};

export default function Module1Page() {
  const [dimensions, setDimensions] = useState(defaultDimensions);
  const [institutionName, setInstitutionName] = useState('');
  const [assessorName, setAssessorName] = useState('');

  const handleChange = (
    key: DimensionKey,
    sub: 'tools' | 'data' | 'culture',
    value: 1 | 2 | 3
  ) => {
    setDimensions((prev) => ({
      ...prev,
      [key]: { ...prev[key], [sub]: value },
    }));
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-primary-600 font-medium mb-1">
          <span className="bg-primary-100 px-2 py-0.5 rounded">Day 1</span>
          Module 1
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Maturity Diagnostic
        </h2>
        <p className="text-gray-500 mt-1">
          Rate your institution across 8 dimensions to identify strengths and gaps.
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

      {/* Main content: form + radar side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
            Assessment
          </h3>
          <DimensionForm dimensions={dimensions} onChange={handleChange} />
        </div>
        <div className="lg:sticky lg:top-6 lg:self-start">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
            Radar View
          </h3>
          <RadarChart dimensions={dimensions} />

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
    </div>
  );
}
