import { useEffect, useRef } from 'react';
import { useAuth } from './auth-context';
import { useStore } from './store';
import { supabase } from './supabase';

const DEBOUNCE_MS = 2000;

/**
 * Syncs store data to Supabase via the sync-data Edge Function.
 * Debounces calls so we don't spam the DB on every slider tick.
 */
export function useSyncToSupabase() {
  const { participant, group } = useAuth();
  const store = useStore();
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const participantId = participant?.id;
  const groupId = group?.id;

  // Helper to call the Edge Function (always via Supabase, no dev proxy needed)
  async function sync(module: string, data: Record<string, unknown>) {
    if (!participantId) return;

    try {
      const { error } = await supabase.functions.invoke('sync-data', {
        body: {
          participant_id: participantId,
          group_id: groupId || null,
          module,
          data,
        },
      });
      if (error) console.error(`sync-data error (${module}):`, error);
    } catch (err) {
      console.error(`sync-data failed (${module}):`, err);
    }
  }

  function debouncedSync(module: string, data: Record<string, unknown>) {
    if (timers.current[module]) clearTimeout(timers.current[module]);
    timers.current[module] = setTimeout(() => sync(module, data), DEBOUNCE_MS);
  }

  // Sync Module 1: assessments
  useEffect(() => {
    if (!participantId) return;
    debouncedSync('assessments', { dimensions: store.dimensions });
  }, [store.dimensions, participantId]);

  // Sync Module 2: stakeholders
  useEffect(() => {
    if (!participantId) return;
    debouncedSync('stakeholders', { stakeholders: store.stakeholders });
  }, [store.stakeholders, participantId]);

  // Sync Module 3: solutions
  useEffect(() => {
    if (!participantId) return;
    debouncedSync('solutions', { solutions: store.solutions });
  }, [store.solutions, participantId]);

  // Sync Module 4: tasks + kpis
  useEffect(() => {
    if (!participantId) return;
    debouncedSync('plan', { tasks: store.tasks, kpis: store.kpis });
  }, [store.tasks, store.kpis, participantId]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach(clearTimeout);
    };
  }, []);
}
