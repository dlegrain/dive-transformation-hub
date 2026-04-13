import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import type { GroupStakeholderData } from '../types';

export function useGroupStakeholders(groupId: string | undefined) {
  const [data, setData] = useState<GroupStakeholderData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!groupId) { setData(null); setLoading(false); return; }
    const { data: result, error } = await supabase.functions.invoke('group-data', {
      body: { action: 'get_group_stakeholders', group_id: groupId },
    });
    if (error) { console.error('get_group_stakeholders error:', error); return; }
    setData(result);
    setLoading(false);
  }, [groupId]);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, [fetch]);

  return { data, loading, refetch: fetch };
}
