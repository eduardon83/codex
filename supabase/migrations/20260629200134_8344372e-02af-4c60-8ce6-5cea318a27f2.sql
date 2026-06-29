
-- 1) Function search_path
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq;
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;

-- 2) event_registrations: allow event creators to see registrations for their events
CREATE POLICY "Event creators can view registrations for their events"
ON public.event_registrations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_registrations.event_id
      AND e.created_by_user_id = auth.uid()
  )
);

-- Also let admins view all registrations
CREATE POLICY "Admins can view all event registrations"
ON public.event_registrations
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- 3) libraries.share_code must not be exposed to anonymous visitors
REVOKE SELECT (share_code) ON public.libraries FROM anon;
REVOKE SELECT (share_code) ON public.libraries FROM PUBLIC;

-- 4) profiles.parent_consent_token must not be readable by ordinary authenticated queries (incl. admins)
REVOKE SELECT (parent_consent_token) ON public.profiles FROM authenticated;
REVOKE SELECT (parent_consent_token) ON public.profiles FROM anon;
REVOKE SELECT (parent_consent_token) ON public.profiles FROM PUBLIC;
