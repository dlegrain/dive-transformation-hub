import { useState, useEffect, useCallback } from 'react';
import { Zap, RotateCcw, Shield, BarChart3, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';
import ReopenRequestsPanel from '../admin/ReopenRequestsPanel';

export default function AdminBar() {
  const { fillSampleData, resetAll } = useStore();
  const navigate = useNavigate();
  const [showReopen, setShowReopen] = useState(false);
  const [reopenCount, setReopenCount] = useState(0);

  const fetchReopenCount = useCallback(async () => {
    try {
      const { data } = await supabase.functions.invoke('group-data', {
        body: { action: 'get_reopen_requests' },
      });
      setReopenCount(data?.requests?.length || 0);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchReopenCount();
    const interval = setInterval(fetchReopenCount, 10000);
    return () => clearInterval(interval);
  }, [fetchReopenCount]);

  return (
    <>
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-amber-700 text-xs font-medium">
          <Shield size={14} />
          Admin
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/plenary')}
            className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded transition-colors"
          >
            <BarChart3 size={12} />
            Plenary Dashboard
          </button>
          <button
            onClick={() => setShowReopen(true)}
            className="relative flex items-center gap-1.5 px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded transition-colors"
          >
            <Bell size={12} />
            Reopen Requests
            {reopenCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {reopenCount}
              </span>
            )}
          </button>
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
      {showReopen && (
        <ReopenRequestsPanel onClose={() => { setShowReopen(false); fetchReopenCount(); }} />
      )}
    </>
  );
}
