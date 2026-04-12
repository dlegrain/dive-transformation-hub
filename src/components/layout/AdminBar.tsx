import { Zap, RotateCcw, Shield } from 'lucide-react';
import { useStore } from '../../lib/store';

export default function AdminBar() {
  const { fillSampleData, resetAll } = useStore();

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-4">
      <div className="flex items-center gap-1.5 text-amber-700 text-xs font-medium">
        <Shield size={14} />
        Admin
      </div>
      <div className="flex gap-2">
        <button
          onClick={fillSampleData}
          className="flex items-center gap-1.5 px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded transition-colors"
        >
          <Zap size={12} />
          Fill All Modules
        </button>
        <button
          onClick={() => {
            if (confirm('Reset all data? This cannot be undone.')) {
              resetAll();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors"
        >
          <RotateCcw size={12} />
          Reset All
        </button>
      </div>
    </div>
  );
}
