
CREATE TABLE public.loan_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_user_id UUID NOT NULL,
  owner_user_id UUID NOT NULL,
  book_id UUID NOT NULL,
  book_title TEXT NOT NULL,
  book_author TEXT,
  book_cover_url TEXT,
  book_isbn TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.loan_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Requesters can view own requests"
ON public.loan_requests FOR SELECT
USING (auth.uid() = requester_user_id);

CREATE POLICY "Owners can view requests for their books"
ON public.loan_requests FOR SELECT
USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can create loan requests"
ON public.loan_requests FOR INSERT
WITH CHECK (auth.uid() = requester_user_id);

CREATE POLICY "Owners can update requests"
ON public.loan_requests FOR UPDATE
USING (auth.uid() = owner_user_id);

CREATE POLICY "Owners can delete requests"
ON public.loan_requests FOR DELETE
USING (auth.uid() = owner_user_id);

CREATE POLICY "Requesters can delete own requests"
ON public.loan_requests FOR DELETE
USING (auth.uid() = requester_user_id);

CREATE TRIGGER update_loan_requests_updated_at
BEFORE UPDATE ON public.loan_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
