import { useCallback } from 'react';
import { supabase } from './supabase';
import type { Stakeholder, PainPoint } from '../types';

export function useM2Consensus(groupId: string | undefined) {
  const saveConsensus = useCallback(
    async (stakeholders: Stakeholder[]) => {
      if (!groupId) return;
      const { error } = await supabase.functions.invoke('group-data', {
        body: {
          action: 'save_m2_consensus',
          group_id: groupId,
          stakeholders,
        },
      });
      if (error) console.error('save_m2_consensus error:', error);
    },
    [groupId]
  );

  const validateConsensus = useCallback(
    async (participantId: string) => {
      if (!groupId) return;
      const { error } = await supabase.functions.invoke('group-data', {
        body: {
          action: 'validate_m2_consensus',
          group_id: groupId,
          participant_id: participantId,
        },
      });
      if (error) console.error('validate_m2_consensus error:', error);
    },
    [groupId]
  );

  const requestReopen = useCallback(
    async (participantId: string) => {
      if (!groupId) return;
      const { error } = await supabase.functions.invoke('group-data', {
        body: {
          action: 'request_m2_reopen',
          group_id: groupId,
          participant_id: participantId,
        },
      });
      if (error) console.error('request_m2_reopen error:', error);
    },
    [groupId]
  );

  const savePainPoints = useCallback(
    async (painPoints: PainPoint[]) => {
      if (!groupId) return;
      const { error } = await supabase.functions.invoke('group-data', {
        body: {
          action: 'save_pain_points',
          group_id: groupId,
          pain_points: painPoints,
        },
      });
      if (error) console.error('save_pain_points error:', error);
    },
    [groupId]
  );

  return { saveConsensus, validateConsensus, requestReopen, savePainPoints };
}
