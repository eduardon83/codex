
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pro_entity_name text,
  ADD COLUMN IF NOT EXISTS pro_city text,
  ADD COLUMN IF NOT EXISTS pro_website text,
  ADD COLUMN IF NOT EXISTS pro_platform_url text,
  ADD COLUMN IF NOT EXISTS pro_verified boolean NOT NULL DEFAULT false;

DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
WITH (security_invoker = true)
AS
SELECT
  p.user_id,
  p.username,
  p.first_name,
  p.last_name,
  p.avatar_url,
  p.location,
  p.pro_entity_name,
  p.pro_city,
  p.pro_website,
  p.pro_platform_url,
  p.pro_verified,
  (
    SELECT array_agg(ur.role::text)
    FROM public.user_roles ur
    WHERE ur.user_id = p.user_id
      AND ur.role::text IN ('bookstore','author','influencer')
  ) AS pro_roles
FROM public.profiles p;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

ALTER TABLE public.reading_plans
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

DROP POLICY IF EXISTS "Anyone can view public personal plans" ON public.reading_plans;
CREATE POLICY "Anyone can view public personal plans"
ON public.reading_plans
FOR SELECT
TO authenticated
USING (is_public = true AND is_template = false);
