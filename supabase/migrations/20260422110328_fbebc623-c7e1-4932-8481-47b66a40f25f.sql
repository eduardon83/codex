ALTER TABLE public.reading_lists
ADD COLUMN IF NOT EXISTS creator_name TEXT,
ADD COLUMN IF NOT EXISTS creator_role TEXT,
ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS scope TEXT NOT NULL DEFAULT 'private',
ADD COLUMN IF NOT EXISTS school_id UUID,
ADD COLUMN IF NOT EXISTS district_id UUID,
ADD COLUMN IF NOT EXISTS education_level TEXT,
ADD COLUMN IF NOT EXISTS subject TEXT,
ADD COLUMN IF NOT EXISTS is_official BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_reading_lists_published_scope
ON public.reading_lists (approval_status, scope, school_id, district_id);

CREATE TABLE IF NOT EXISTS public.reading_list_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reading_list_id UUID NOT NULL REFERENCES public.reading_lists(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, reading_list_id)
);

ALTER TABLE public.reading_list_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reading list subscriptions"
ON public.reading_list_subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can subscribe themselves to reading lists"
ON public.reading_list_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own reading list subscriptions"
ON public.reading_list_subscriptions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view reading list subscriptions"
ON public.reading_list_subscriptions
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view matching published reading lists"
ON public.reading_lists
FOR SELECT
TO authenticated
USING (
  approval_status = 'published'
  AND (
    scope = 'national'
    OR (scope = 'district' AND district_id = (SELECT p.district_id FROM public.profiles p WHERE p.user_id = auth.uid()))
    OR (scope = 'school' AND school_id = (SELECT p.school_id FROM public.profiles p WHERE p.user_id = auth.uid()))
  )
);