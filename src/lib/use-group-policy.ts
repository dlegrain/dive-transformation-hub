import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

interface GroupPolicy {
  policy_draft: string | null;
  policy_answers: Record<string, unknown> | null;
}

export function useGroupPolicy(groupId: string | undefined) {
  const [policy, setPolicy] = useState<GroupPolicy>({ policy_draft: null, policy_answers: null });
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!groupId) { setLoading(false); return; }
    try {
      const { data } = await supabase.functions.invoke('group-data', {
        body: { action: 'get_m3_policy', group_id: groupId },
      });
      setPolicy({
        policy_draft: data?.policy_draft ?? null,
        policy_answers: data?.policy_answers ?? null,
      });
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 8000);
    return () => clearInterval(interval);
  }, [fetch]);

  return { policy, loading, refetch: fetch };
}
