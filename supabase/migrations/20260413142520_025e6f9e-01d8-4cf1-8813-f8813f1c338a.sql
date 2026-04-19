
-- 1. Fix profiles: restrict SELECT to owner only
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Create a safe public view for cross-user profile lookups (no GPS, no age_group)
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = on) AS
  SELECT user_id, username, first_name, last_name, avatar_url, location
  FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- 3. Create a security definer function for username -> user_id lookup
CREATE OR REPLACE FUNCTION public.lookup_user_id_by_username(_username text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id FROM public.profiles WHERE username = _username LIMIT 1;
$$;

-- 4. Fix libraries: create a view that excludes share_code for public browsing
CREATE OR REPLACE VIEW public.public_libraries
WITH (security_invoker = on) AS
  SELECT id, name, is_public, user_id, created_at, updated_at
  FROM public.libraries
  WHERE is_public = true;

GRANT SELECT ON public.public_libraries TO anon, authenticated;
