import { supabase } from '@/integrations/supabase/client';

export interface LoanReputation {
  totalAsBorrower: number;
  completedAsBorrower: number;
  onTimeAsBorrower: number;
  onTimePercent: number | null; // null if not enough data
}

const MIN_LOANS_FOR_DISPLAY = 5;
const DISPLAY_THRESHOLD = 0.6;

export async function fetchLoanReputation(userId: string): Promise<LoanReputation> {
  const { data } = await supabase
    .from('loan_requests' as any)
    .select('status, due_date, returned_at')
    .eq('requester_user_id', userId)
    .eq('status', 'returned');

  const rows = (data as any[]) || [];
  const completed = rows.length;
  const onTime = rows.filter(r => {
    if (!r.due_date || !r.returned_at) return false;
    return new Date(r.returned_at).getTime() <= new Date(r.due_date).getTime();
  }).length;

  const onTimePercent = completed >= 3 ? Math.round((onTime / completed) * 100) : null;

  return {
    totalAsBorrower: completed,
    completedAsBorrower: completed,
    onTimeAsBorrower: onTime,
    onTimePercent,
  };
}

/**
 * Returns a percentage to publicly display (or null to hide).
 * Hides percentages below the threshold to avoid shaming.
 */
export function publicOnTimePercent(rep: { completed: number; onTime: number }): number | null {
  if (rep.completed < MIN_LOANS_FOR_DISPLAY) return null;
  const pct = rep.onTime / rep.completed;
  if (pct < DISPLAY_THRESHOLD) return null;
  return Math.round(pct * 100);
}

/**
 * Bulk fetch on-time reputation for many users (for discovery lists).
 * Returns map userId -> percentage (only those eligible to display).
 */
export async function fetchPublicReputations(userIds: string[]): Promise<Record<string, number>> {
  if (userIds.length === 0) return {};
  const { data } = await supabase
    .from('loan_requests' as any)
    .select('requester_user_id, due_date, returned_at')
    .in('requester_user_id', userIds)
    .eq('status', 'returned');

  const counts: Record<string, { completed: number; onTime: number }> = {};
  ((data as any[]) || []).forEach(r => {
    const uid = r.requester_user_id;
    if (!counts[uid]) counts[uid] = { completed: 0, onTime: 0 };
    counts[uid].completed += 1;
    if (r.due_date && r.returned_at && new Date(r.returned_at).getTime() <= new Date(r.due_date).getTime()) {
      counts[uid].onTime += 1;
    }
  });

  const result: Record<string, number> = {};
  for (const [uid, c] of Object.entries(counts)) {
    const pct = publicOnTimePercent(c);
    if (pct !== null) result[uid] = pct;
  }
  return result;
}
