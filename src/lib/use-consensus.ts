import { useCallback } from 'react';
import { supabase } from './supabase';
import type { DimensionKey, DimensionAssessment, CustomDimension } from '../types';

/**
 * Actions for managing group consensus: save, validate, request reopen.
 */
export function useConsensus(groupId: string | undefined) {
  const saveConsensus = useCallback(
    async (
      dimensions: Record<DimensionKey, DimensionAssessment>,
      customData?: { customDimensions: CustomDimension[]; hiddenDimensions: DimensionKey[] }
    ) => {
      if (!groupId) return;
      const { error } = await supabase.functions.invoke('group-data', {
        body: {
          action: 'save_consensus',
          group_id: groupId,
          dimensions,
          custom_data: customData || null,
        },
      });
      if (error) console.error('save_consensus error:', error);
    },
    [groupId]
  );

  const validateConsensus = useCallback(
    async (participantId: string) => {
      if (!groupId) return;
      const { error } = await supabase.functions.invoke('group-data', {
        body: {
          action: 'validate_consensus',
          group_id: groupId,
          participant_id: participantId,
        },
      });
      if (error) console.error('validate_consensus error:', error);
    },
    [groupId]
  );

  const requestReopen = useCallback(
    async (participantId: string) => {
      if (!groupId) return;
      const { error } = await supabase.functions.invoke('group-data', {
        body: {
          action: 'request_reopen',
          group_id: groupId,
          participant_id: participantId,
        },
      });
      if (error) console.error('request_reopen error:', error);
    },
    [groupId]
  );

  return { saveConsensus, validateConsensus, requestReopen };
}
