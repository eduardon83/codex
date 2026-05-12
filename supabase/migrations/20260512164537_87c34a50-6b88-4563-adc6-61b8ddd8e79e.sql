
ALTER TABLE public.reading_lists
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS share_code text DEFAULT encode(extensions.gen_random_bytes(6), 'hex');

CREATE POLICY "Anonymous can view public reading lists"
  ON public.reading_lists FOR SELECT TO anon
  USING (is_public = true);

CREATE POLICY "Authenticated can view public reading lists"
  ON public.reading_lists FOR SELECT TO authenticated
  USING (is_public = true);

CREATE POLICY "Anonymous can view books of public reading lists"
  ON public.reading_list_books FOR SELECT TO anon
  USING (EXISTS (
    SELECT 1 FROM public.reading_lists rl
    WHERE rl.id = reading_list_books.reading_list_id AND rl.is_public = true
  ));

CREATE POLICY "Authenticated can view books of public reading lists"
  ON public.reading_list_books FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.reading_lists rl
    WHERE rl.id = reading_list_books.reading_list_id AND rl.is_public = true
  ));
