import { supabase } from '@/integrations/supabase/client';

export type SessionMode = 'timer' | 'chronometer';

export interface SelectedBookForSession {
  book_id?: string | null;
  title: string;
  author?: string | null;
  cover_url?: string | null;
}

export interface SaveSessionInput {
  userId: string;
  book: SelectedBookForSession;
  startedAt: Date;
  endedAt: Date;
  durationSeconds: number;
  mode: SessionMode;
  timerTargetSeconds?: number | null;
  completed: boolean;
}

export interface ReadingSessionRow {
  id: string;
  user_id: string;
  book_id: string | null;
  book_title: string;
  book_author: string | null;
  book_cover_url: string | null;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  mode: SessionMode | null;
  timer_target_seconds: number | null;
  completed: boolean;
  created_at: string;
}

export async function saveReadingSession(input: SaveSessionInput) {
  return supabase.from('reading_sessions' as any).insert({
    user_id: input.userId,
    book_id: input.book.book_id || null,
    book_title: input.book.title,
    book_author: input.book.author || null,
    book_cover_url: input.book.cover_url || null,
    started_at: input.startedAt.toISOString(),
    ended_at: input.endedAt.toISOString(),
    duration_seconds: input.durationSeconds,
    mode: input.mode,
    timer_target_seconds: input.timerTargetSeconds ?? null,
    completed: input.completed,
  });
}

/** "H:MM:SS" if >= 1h, else "MM:SS" */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

/** "12h 34min" / "45 min" / "30s" */
export function formatHumanDuration(totalSeconds: number, lang: string = 'pt'): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  if (s < 60) return `${s}s`;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const minLabel = lang.startsWith('fr') ? 'min' : 'min';
  if (h === 0) return `${m} ${minLabel}`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}${minLabel}`;
}
