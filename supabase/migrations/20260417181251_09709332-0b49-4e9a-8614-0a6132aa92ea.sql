-- Favourite books table
CREATE TABLE public.user_favourites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  source_book_id UUID,
  book_isbn TEXT,
  book_title TEXT NOT NULL,
  book_author TEXT,
  book_cover_url TEXT,
  book_genre TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_favourites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favourites" ON public.user_favourites
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favourites" ON public.user_favourites
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own favourites" ON public.user_favourites
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own favourites" ON public.user_favourites
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_user_favourites_user ON public.user_favourites(user_id);

-- Library cards table
CREATE TABLE public.library_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  card_number TEXT,
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.library_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own library cards" ON public.library_cards
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own library cards" ON public.library_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own library cards" ON public.library_cards
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own library cards" ON public.library_cards
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_library_cards_updated_at
  BEFORE UPDATE ON public.library_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_library_cards_user ON public.library_cards(user_id);