
-- Lock down parent_consent_token on profiles
REVOKE SELECT (parent_consent_token) ON public.profiles FROM anon, authenticated, PUBLIC;

-- Lock down share_code on libraries (anon should never see it; owners read via SECURITY DEFINER-free RLS but only for themselves)
REVOKE SELECT (share_code) ON public.libraries FROM anon, PUBLIC;
