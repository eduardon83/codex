
-- Create book_cache table for community ISBN data
CREATE TABLE public.book_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  isbn TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  author TEXT,
  publisher TEXT,
  year TEXT,
  language TEXT,
  pages INTEGER,
  cover_url TEXT,
  genre TEXT,
  format TEXT,
  contributed_by_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.book_cache ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can read
CREATE POLICY "Anyone can read book cache"
  ON public.book_cache FOR SELECT
  TO authenticated
  USING (true);

-- Anyone authenticated can insert
CREATE POLICY "Anyone can insert book cache"
  ON public.book_cache FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = contributed_by_user_id);

-- Contributors can update their own entries
CREATE POLICY "Contributors can update own cache entries"
  ON public.book_cache FOR UPDATE
  TO authenticated
  USING (auth.uid() = contributed_by_user_id);

-- Index for fast ISBN lookups
CREATE INDEX idx_book_cache_isbn ON public.book_cache (isbn);
