
-- Create reading_lists table
CREATE TABLE public.reading_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Reading List',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reading_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reading lists"
  ON public.reading_lists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reading lists"
  ON public.reading_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reading lists"
  ON public.reading_lists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reading lists"
  ON public.reading_lists FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_reading_lists_updated_at
  BEFORE UPDATE ON public.reading_lists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create reading_list_books table
CREATE TABLE public.reading_list_books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reading_list_id UUID NOT NULL REFERENCES public.reading_lists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT,
  isbn TEXT,
  publisher TEXT,
  publish_date TEXT,
  cover_url TEXT,
  genre TEXT,
  page_count INTEGER,
  language TEXT,
  has_warning BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reading_list_books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reading list books"
  ON public.reading_list_books FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.reading_lists
    WHERE reading_lists.id = reading_list_books.reading_list_id
    AND reading_lists.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own reading list books"
  ON public.reading_list_books FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.reading_lists
    WHERE reading_lists.id = reading_list_books.reading_list_id
    AND reading_lists.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own reading list books"
  ON public.reading_list_books FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.reading_lists
    WHERE reading_lists.id = reading_list_books.reading_list_id
    AND reading_lists.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own reading list books"
  ON public.reading_list_books FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.reading_lists
    WHERE reading_lists.id = reading_list_books.reading_list_id
    AND reading_lists.user_id = auth.uid()
  ));
