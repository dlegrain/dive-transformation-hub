import { supabase } from './supabase';
import type { Participant, Group, Session } from '../types';

export async function getActiveSession(): Promise<Session | null> {
  const { data } = await supabase
    .from('dive_sessions')
    .select('*')
    .eq('is_active', true)
    .limit(1)
    .single();

  if (data) return data;

  // No active session — create one automatically
  const { data: created, error } = await supabase
    .from('dive_sessions')
    .insert({ name: 'DIVE Seminar 2026 — Ho Chi Minh City', is_active: true })
    .select()
    .single();

  if (error) {
    console.error('Failed to create session:', error);
    return null;
  }
  return created;
}

export async function findOrCreateGroup(
  sessionId: string,
  institutionName: string
): Promise<Group | null> {
  // Try to find existing group for this institution in this session
  const { data: existing } = await supabase
    .from('dive_groups')
    .select('*')
    .eq('session_id', sessionId)
    .eq('institution_name', institutionName)
    .limit(1)
    .single();

  if (existing) return existing;

  // Create new group
  const { data, error } = await supabase
    .from('dive_groups')
    .insert({
      session_id: sessionId,
      name: institutionName,
      institution_name: institutionName,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create group:', error);
    return null;
  }
  return data;
}

export async function registerParticipant(input: {
  firstName: string;
  lastName: string;
  institution: string;
  email: string;
}): Promise<{ participant: Participant; group: Group; session: Session } | { error: string }> {
  const session = await getActiveSession();
  if (!session) return { error: 'No active seminar session found. Please contact the facilitator.' };

  // Check if email already exists
  const { data: existingParticipant } = await supabase
    .from('dive_participants')
    .select('*')
    .eq('email', input.email.toLowerCase().trim())
    .limit(1)
    .single();

  if (existingParticipant) {
    return { error: 'This email is already registered. Use "Already Registered" to sign in.' };
  }

  const group = await findOrCreateGroup(session.id, input.institution.trim());
  if (!group) return { error: 'Failed to create group. Please try again.' };

  const fullName = `${input.firstName.trim()} ${input.lastName.trim()}`;

  const { data: participant, error } = await supabase
    .from('dive_participants')
    .insert({
      group_id: group.id,
      name: fullName,
      email: input.email.toLowerCase().trim(),
      role: 'participant',
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to register participant:', error);
    return { error: 'Registration failed. Please try again.' };
  }

  return { participant, group, session };
}

export async function findParticipantByEmail(
  email: string
): Promise<{ participant: Participant; group: Group; session: Session } | { error: string }> {
  const { data: participant } = await supabase
    .from('dive_participants')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .limit(1)
    .single();

  if (!participant) {
    return { error: 'No participant found with this email. Try registering first.' };
  }

  const { data: group } = await supabase
    .from('dive_groups')
    .select('*')
    .eq('id', participant.group_id)
    .single();

  if (!group) return { error: 'Group not found. Please contact the facilitator.' };

  const session = await getActiveSession();
  if (!session) return { error: 'No active seminar session found.' };

  return { participant, group, session };
}
