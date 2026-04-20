-- ============================================================
-- book_availability
-- ============================================================
CREATE TABLE public.book_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL UNIQUE REFERENCES public.books(id) ON DELETE CASCADE,
  owner_user_id UUID NOT NULL,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  district_id UUID REFERENCES public.districts(id) ON DELETE SET NULL,
  isbn TEXT,
  title TEXT NOT NULL,
  author TEXT,
  cover_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT false,
  loan_duration_days INTEGER NOT NULL DEFAULT 14 CHECK (loan_duration_days IN (7, 14, 21, 30)),
  auto_accept BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_book_availability_district_available
  ON public.book_availability(district_id, is_available);
CREATE INDEX idx_book_availability_isbn ON public.book_availability(isbn);
CREATE INDEX idx_book_availability_owner ON public.book_availability(owner_user_id);

ALTER TABLE public.book_availability ENABLE ROW LEVEL SECURITY;

-- Owners full access to their own rows
CREATE POLICY "Owners manage their availability"
  ON public.book_availability
  FOR ALL
  TO authenticated
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

-- District-scoped read for everyone else
CREATE POLICY "Same-district users can read available books"
  ON public.book_availability
  FOR SELECT
  TO authenticated
  USING (
    is_available = true
    AND district_id IS NOT NULL
    AND district_id = (SELECT district_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE TRIGGER update_book_availability_updated_at
  BEFORE UPDATE ON public.book_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- loan_requests: extend with lifecycle columns
-- ============================================================
ALTER TABLE public.loan_requests
  ADD COLUMN IF NOT EXISTS requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS returned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS borrower_confirmed_return BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS lender_confirmed_return BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS message TEXT,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS reminder_3day_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reminder_confirm_sent_at TIMESTAMPTZ;

-- Constrain status values
ALTER TABLE public.loan_requests
  DROP CONSTRAINT IF EXISTS loan_requests_status_check;

ALTER TABLE public.loan_requests
  ADD CONSTRAINT loan_requests_status_check
  CHECK (status IN ('pending', 'accepted', 'rejected', 'in_progress', 'returned', 'overdue'));

CREATE INDEX IF NOT EXISTS idx_loan_requests_owner_status ON public.loan_requests(owner_user_id, status);
CREATE INDEX IF NOT EXISTS idx_loan_requests_requester_status ON public.loan_requests(requester_user_id, status);
CREATE INDEX IF NOT EXISTS idx_loan_requests_due_date ON public.loan_requests(due_date) WHERE status IN ('accepted', 'in_progress');