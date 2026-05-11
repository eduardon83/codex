-- Relax book_availability SELECT to nationwide so the new "Livros" tab can show all available books
DROP POLICY IF EXISTS "Same-district users can read available books" ON public.book_availability;

CREATE POLICY "Authenticated users can read available books"
ON public.book_availability
FOR SELECT
TO authenticated
USING (is_available = true);