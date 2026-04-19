
-- Create update_updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  username TEXT UNIQUE,
  location TEXT,
  bio TEXT,
  profile_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Libraries table
CREATE TABLE public.libraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'My Library',
  is_public BOOLEAN NOT NULL DEFAULT false,
  share_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.libraries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own libraries" ON public.libraries FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can insert own libraries" ON public.libraries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own libraries" ON public.libraries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own libraries" ON public.libraries FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_libraries_updated_at BEFORE UPDATE ON public.libraries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Books table
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id UUID REFERENCES public.libraries(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  isbn TEXT,
  publisher TEXT,
  publish_date TEXT,
  format TEXT DEFAULT 'Softcover',
  cover_url TEXT,
  series_name TEXT,
  volume_number INTEGER,
  language TEXT,
  page_count INTEGER,
  genre TEXT,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  reading_status TEXT NOT NULL DEFAULT 'Unread',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_wishlist BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own books" ON public.books FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM public.libraries WHERE id = library_id AND is_public = true)
);
CREATE POLICY "Users can insert own books" ON public.books FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own books" ON public.books FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own books" ON public.books FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON public.books
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Loans table
CREATE TABLE public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  lender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  borrower_name TEXT,
  borrower_user_id UUID REFERENCES auth.users(id),
  loan_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  return_date TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lenders can manage their loans" ON public.loans FOR ALL USING (auth.uid() = lender_id);
CREATE POLICY "Borrowers can view their loans" ON public.loans FOR SELECT USING (auth.uid() = borrower_user_id);

CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON public.loans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Saved libraries table
CREATE TABLE public.saved_libraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  library_id UUID REFERENCES public.libraries(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, library_id)
);

ALTER TABLE public.saved_libraries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved" ON public.saved_libraries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert saved" ON public.saved_libraries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete saved" ON public.saved_libraries FOR DELETE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create default library on profile completion
CREATE OR REPLACE FUNCTION public.handle_profile_completed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.profile_completed = true AND OLD.profile_completed = false THEN
    INSERT INTO public.libraries (user_id, name)
    VALUES (NEW.user_id, 'My Library');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_profile_completed
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_profile_completed();
