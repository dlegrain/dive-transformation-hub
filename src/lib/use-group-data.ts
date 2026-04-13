import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import type { GroupAssessmentData } from '../types';

const POLL_INTERVAL_MS = 5000;

/**
 * Polls group assessment data (members, averages, consensus) at 5s intervals.
 * Returns null when groupId is not set or data hasn't loaded yet.
 */
export function useGroupData(groupId: string | undefined, enabled = true) {
  const [data, setData] = useState<GroupAssessmentData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!groupId || !enabled) return;
    try {
      setLoading(true);
      const { data: result, error } = await supabase.functions.invoke('group-data', {
        body: { action: 'get_group_assessments', group_id: groupId },
      });
      if (error) {
        console.error('group-data fetch error:', error);
        return;
      }
      setData(result as GroupAssessmentData);
    } catch (err) {
      console.error('group-data fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [groupId, enabled]);

  // Initial fetch + polling
  useEffect(() => {
    if (!groupId || !enabled) return;
    fetch();
    const interval = setInterval(fetch, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetch, groupId, enabled]);

  return { data, loading, refetch: fetch };
}
