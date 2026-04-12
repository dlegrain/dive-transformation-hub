import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import DimensionForm from './DimensionForm';
import CustomDimensionForm from './CustomDimensionForm';
import RadarChart from './RadarChart';
import { useStore } from '../../../lib/store';

export default function Module1Page() {
  const { dimensions, setDimension, customDimension, setCustomDimension, institutionName, setInstitutionName, assessorName, setAssessorName } = useStore();
  const [showCustomForm, setShowCustomForm] = useState(false);

  const handleAddCustom = () => {
    setCustomDimension({
      label: '',
      description: '',
      assessment: { tools: 1, data: 1, culture: 1 },
    });
    setShowCustomForm(true);
  };

  const handleRemoveCustom = () => {
    setCustomDimension(null);
    setShowCustomForm(false);
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
          <DimensionForm dimensions={dimensions} onChange={setDimension} />

          {/* Custom dimension */}
          {customDimension ? (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-primary-700 uppercase tracking-wider">
                  Your Custom Dimension
                </h3>
                <button
                  onClick={handleRemoveCustom}
                  className="text-gray-400 hover:text-danger-500 p-1"
                  title="Remove custom dimension"
                >
                  <X size={16} />
                </button>
              </div>
              <CustomDimensionForm
                customDimension={customDimension}
                onChange={setCustomDimension}
              />
            </div>
          ) : (
            <button
              onClick={handleAddCustom}
              className="mt-6 flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 text-gray-500 text-sm font-medium rounded-lg hover:border-primary-400 hover:text-primary-600 transition-colors w-full justify-center"
            >
              <Plus size={16} />
              Add a Custom Dimension
            </button>
          )}
        </div>
        <div className="lg:sticky lg:top-6 lg:self-start">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
            Radar View
          </h3>
          <RadarChart dimensions={dimensions} customDimension={customDimension} />

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
