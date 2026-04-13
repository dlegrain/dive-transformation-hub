import { useState, useEffect, useCallback } from 'react';
import { X, Check, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ReopenRequest {
  group_id: string;
  group_name: string;
  institution_name: string;
  module: string;
  approve_action: string;
  deny_action: string;
  requester_name: string | null;
  requested_at: string | null;
}

interface Props {
  onClose: () => void;
}

export default function ReopenRequestsPanel({ onClose }: Props) {
  const [requests, setRequests] = useState<ReopenRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('group-data', {
        body: { action: 'get_reopen_requests' },
      });
      if (error) {
        console.error('fetch reopen requests error:', error);
        return;
      }
      setRequests(data?.requests || []);
    } catch (err) {
      console.error('fetch reopen requests failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 10000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  const handleApprove = async (groupId: string, action: string) => {
    await supabase.functions.invoke('group-data', {
      body: { action, group_id: groupId },
    });
    fetchRequests();
  };

  const handleDeny = async (groupId: string, action: string) => {
    await supabase.functions.invoke('group-data', {
      body: { action, group_id: groupId },
    });
    fetchRequests();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 text-sm">Consensus Reopen Requests</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 max-h-80 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-6">Loading...</p>
          ) : requests.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No pending requests.</p>
          ) : (
            <div className="space-y-3">
              {requests.map((req, i) => (
                <div
                  key={`${req.group_id}-${req.module}-${i}`}
                  className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {req.institution_name || req.group_name}
                      <span className="ml-2 text-[10px] text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded font-semibold">
                        {req.module}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Requested by {req.requester_name || 'Unknown'}
                      {req.requested_at && (
                        <> at {new Date(req.requested_at).toLocaleTimeString()}</>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleApprove(req.group_id, req.approve_action)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors"
                    >
                      <Check size={12} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleDeny(req.group_id, req.deny_action)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium rounded transition-colors"
                    >
                      <XCircle size={12} />
                      Deny
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
