ALTER TABLE public.library_cards
  ADD COLUMN IF NOT EXISTS library_name text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS member_since date,
  ADD COLUMN IF NOT EXISTS photo_url text;

-- Backfill library_name from existing name field
UPDATE public.library_cards SET library_name = name WHERE library_name IS NULL AND name IS NOT NULL;