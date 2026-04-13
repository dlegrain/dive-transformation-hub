import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

interface ValidatorState {
  validatorId: string | null;
  validatorName: string | null;
  loading: boolean;
}

export function useValidator(groupId: string | undefined, module: string) {
  const [state, setState] = useState<ValidatorState>({
    validatorId: null,
    validatorName: null,
    loading: true,
  });

  const fetch = useCallback(async () => {
    if (!groupId) { setState({ validatorId: null, validatorName: null, loading: false }); return; }
    const { data, error } = await supabase.functions.invoke('group-data', {
      body: { action: 'get_validator', group_id: groupId, module },
    });
    if (error) { console.error('get_validator error:', error); return; }
    setState({
      validatorId: data.validator_id,
      validatorName: data.validator_name,
      loading: false,
    });
  }, [groupId, module]);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, [fetch]);

  const claim = useCallback(async (participantId: string) => {
    if (!groupId) return false;
    const { data, error } = await supabase.functions.invoke('group-data', {
      body: { action: 'claim_validator', group_id: groupId, module, participant_id: participantId },
    });
    if (error) { console.error('claim_validator error:', error); return false; }
    if (data.ok) {
      await fetch();
      return true;
    }
    // Already claimed by someone else
    await fetch();
    return false;
  }, [groupId, module, fetch]);

  const release = useCallback(async () => {
    if (!groupId) return;
    const { error } = await supabase.functions.invoke('group-data', {
      body: { action: 'release_validator', group_id: groupId, module },
    });
    if (error) console.error('release_validator error:', error);
    await fetch();
  }, [groupId, module, fetch]);

  return { ...state, claim, release, refetch: fetch };
}
