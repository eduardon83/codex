
ALTER TABLE public.loan_requests
  ADD COLUMN IF NOT EXISTS requester_email TEXT,
  ADD COLUMN IF NOT EXISTS requested_duration_days INTEGER,
  ADD COLUMN IF NOT EXISTS requester_seen_response BOOLEAN NOT NULL DEFAULT false;

-- Allow requesters to update their own requests (for marking response as seen, etc.)
DROP POLICY IF EXISTS "Requesters can update own requests" ON public.loan_requests;
CREATE POLICY "Requesters can update own requests"
ON public.loan_requests FOR UPDATE TO authenticated
USING (auth.uid() = requester_user_id)
WITH CHECK (auth.uid() = requester_user_id);
