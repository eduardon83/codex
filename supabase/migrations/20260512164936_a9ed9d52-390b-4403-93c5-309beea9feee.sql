
CREATE POLICY "Authenticated can view books of published reading lists"
  ON public.reading_list_books FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.reading_lists rl
    WHERE rl.id = reading_list_books.reading_list_id
      AND rl.approval_status = 'published'
      AND (
        rl.scope = 'national'
        OR (rl.scope = 'district' AND rl.district_id = (SELECT p.district_id FROM public.profiles p WHERE p.user_id = auth.uid()))
        OR (rl.scope = 'school' AND rl.school_id = (SELECT p.school_id FROM public.profiles p WHERE p.user_id = auth.uid()))
      )
  ));
