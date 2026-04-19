
-- Create reading_history table
CREATE TABLE public.reading_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  book_isbn TEXT,
  book_title TEXT NOT NULL,
  book_author TEXT,
  book_cover_url TEXT,
  book_publisher TEXT,
  book_year TEXT,
  book_pages INTEGER,
  book_format TEXT,
  book_genre TEXT,
  book_series TEXT,
  book_language TEXT,
  status TEXT NOT NULL DEFAULT 'unread',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  date_added TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  date_started TIMESTAMP WITH TIME ZONE,
  date_finished TIMESTAMP WITH TIME ZONE,
  personal_notes TEXT,
  source_library_name TEXT,
  removed_from_library BOOLEAN NOT NULL DEFAULT false,
  source_book_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reading_history ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own reading history"
  ON public.reading_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reading history"
  ON public.reading_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reading history"
  ON public.reading_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reading history"
  ON public.reading_history FOR DELETE
  USING (auth.uid() = user_id);

-- Updated at trigger
CREATE TRIGGER update_reading_history_updated_at
  BEFORE UPDATE ON public.reading_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: auto-create reading_history entry when a book is inserted (non-wishlist)
CREATE OR REPLACE FUNCTION public.handle_book_to_reading_history()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  lib_name TEXT;
BEGIN
  -- Only track non-wishlist books
  IF NEW.is_wishlist = true THEN
    RETURN NEW;
  END IF;

  -- Get library name
  SELECT name INTO lib_name FROM public.libraries WHERE id = NEW.library_id;

  -- Upsert by source_book_id
  INSERT INTO public.reading_history (
    user_id, book_isbn, book_title, book_author, book_cover_url,
    book_publisher, book_year, book_pages, book_format, book_genre,
    book_series, book_language, status, rating, source_library_name,
    source_book_id, removed_from_library
  ) VALUES (
    NEW.user_id, NEW.isbn, NEW.title, NEW.author, NEW.cover_url,
    NEW.publisher, NEW.publish_date, NEW.page_count, NEW.format, NEW.genre,
    NEW.series_name, NEW.language, NEW.reading_status, NEW.rating, lib_name,
    NEW.id, false
  )
  ON CONFLICT (source_book_id) DO UPDATE SET
    book_isbn = EXCLUDED.book_isbn,
    book_title = EXCLUDED.book_title,
    book_author = EXCLUDED.book_author,
    book_cover_url = EXCLUDED.book_cover_url,
    book_publisher = EXCLUDED.book_publisher,
    book_year = EXCLUDED.book_year,
    book_pages = EXCLUDED.book_pages,
    book_format = EXCLUDED.book_format,
    book_genre = EXCLUDED.book_genre,
    book_series = EXCLUDED.book_series,
    book_language = EXCLUDED.book_language,
    status = EXCLUDED.status,
    rating = EXCLUDED.rating,
    source_library_name = EXCLUDED.source_library_name,
    removed_from_library = false;

  RETURN NEW;
END;
$$;

-- Add unique constraint for upsert
ALTER TABLE public.reading_history ADD CONSTRAINT reading_history_source_book_id_key UNIQUE (source_book_id);

CREATE TRIGGER on_book_insert_reading_history
  AFTER INSERT ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_book_to_reading_history();

-- Trigger: sync status/rating changes
CREATE OR REPLACE FUNCTION public.handle_book_update_reading_history()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.is_wishlist = true THEN
    RETURN NEW;
  END IF;

  UPDATE public.reading_history SET
    status = NEW.reading_status,
    rating = NEW.rating,
    book_title = NEW.title,
    book_author = NEW.author,
    book_cover_url = NEW.cover_url,
    book_genre = NEW.genre,
    book_isbn = NEW.isbn,
    book_publisher = NEW.publisher,
    book_year = NEW.publish_date,
    book_pages = NEW.page_count,
    book_format = NEW.format,
    book_series = NEW.series_name,
    book_language = NEW.language,
    date_started = CASE
      WHEN NEW.reading_status = 'Currently Reading' AND (OLD.reading_status != 'Currently Reading' OR date_started IS NULL)
      THEN now()
      ELSE date_started
    END,
    date_finished = CASE
      WHEN NEW.reading_status = 'Read' AND (OLD.reading_status != 'Read' OR date_finished IS NULL)
      THEN now()
      ELSE date_finished
    END
  WHERE source_book_id = NEW.id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_book_update_reading_history
  AFTER UPDATE ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_book_update_reading_history();

-- Trigger: flag removed when book is deleted
CREATE OR REPLACE FUNCTION public.handle_book_delete_reading_history()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.is_wishlist = true THEN
    RETURN OLD;
  END IF;

  UPDATE public.reading_history
  SET removed_from_library = true
  WHERE source_book_id = OLD.id;

  RETURN OLD;
END;
$$;

CREATE TRIGGER on_book_delete_reading_history
  AFTER DELETE ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_book_delete_reading_history();
