-- Add columns to reading_list_books to support linking to user's books or storing external book metadata
ALTER TABLE public.reading_list_books
  ADD COLUMN IF NOT EXISTS book_id uuid REFERENCES public.books(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS external_title text,
  ADD COLUMN IF NOT EXISTS external_author text,
  ADD COLUMN IF NOT EXISTS external_cover_url text;

CREATE INDEX IF NOT EXISTS idx_reading_list_books_book_id ON public.reading_list_books(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_list_books_reading_list_id ON public.reading_list_books(reading_list_id);
