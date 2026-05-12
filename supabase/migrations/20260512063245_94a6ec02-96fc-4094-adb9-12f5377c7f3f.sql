
-- Add 'other' to event_type enum if not exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'other' AND enumtypid = 'event_type'::regtype) THEN
    ALTER TYPE event_type ADD VALUE 'other';
  END IF;
END $$;

-- Relax events SELECT policy: all authenticated users can view published+approved events regardless of scope
DROP POLICY IF EXISTS "Authenticated users can view matching published events" ON public.events;
CREATE POLICY "Authenticated users can view published events"
ON public.events FOR SELECT TO authenticated
USING (status = 'published'::event_status AND approval_status = 'approved'::event_approval_status);

-- Update INSERT policy to include bookstore role
DROP POLICY IF EXISTS "Authorized users can create events" ON public.events;
CREATE POLICY "Authorized users can create events"
ON public.events FOR INSERT TO authenticated
WITH CHECK (
  created_by_user_id = auth.uid() AND (
    has_role(auth.uid(), 'bookstore'::app_role) OR
    has_role(auth.uid(), 'entity'::app_role) OR
    has_role(auth.uid(), 'global_admin'::app_role) OR
    has_role(auth.uid(), 'teacher'::app_role) OR
    has_role(auth.uid(), 'school_admin'::app_role) OR
    is_admin(auth.uid())
  )
);
