import { supabase } from '@/integrations/supabase/client';

export interface BookSnapshot {
  id: string;
  user_id: string;
  title: string;
  author: string | null;
  isbn: string | null;
  cover_url: string | null;
}

/**
 * Sync a book's availability for peer-to-peer lending.
 * Pulls the owner's school_id + district_id from their profile and
 * upserts (or deletes) a row in book_availability.
 */
export async function syncBookAvailability(
  book: BookSnapshot,
  options: { isAvailable: boolean; loanDurationDays?: number }
): Promise<{ error: string | null }> {
  const { isAvailable, loanDurationDays = 14 } = options;

  if (!isAvailable) {
    const { error } = await supabase
      .from('book_availability' as any)
      .delete()
      .eq('book_id', book.id);
    return { error: error?.message ?? null };
  }

  // Owner profile lookup for district / school
  const { data: profile, error: pErr } = await supabase
    .from('profiles')
    .select('district_id, school_id')
    .eq('user_id', book.user_id)
    .single();

  if (pErr || !profile) return { error: 'Profile not found' };
  if (!(profile as any).district_id) {
    return { error: 'Defina o seu distrito no perfil antes de partilhar livros.' };
  }

  const payload = {
    book_id: book.id,
    owner_user_id: book.user_id,
    school_id: (profile as any).school_id ?? null,
    district_id: (profile as any).district_id,
    isbn: book.isbn,
    title: book.title,
    author: book.author,
    cover_url: book.cover_url,
    is_available: true,
    loan_duration_days: loanDurationDays,
  };

  const { error } = await supabase
    .from('book_availability' as any)
    .upsert(payload, { onConflict: 'book_id' });

  return { error: error?.message ?? null };
}

export async function getBookAvailability(bookId: string) {
  const { data } = await supabase
    .from('book_availability' as any)
    .select('id, is_available, loan_duration_days')
    .eq('book_id', bookId)
    .maybeSingle();
  return data as { id: string; is_available: boolean; loan_duration_days: number } | null;
}
