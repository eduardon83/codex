-- Allow authenticated users to view their own role assignments.
-- This is required so the frontend can detect bookstore/author/influencer/entity roles
-- and unlock the corresponding UI (badges, event creation, sharing toggles).
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow anonymous visitors to read public libraries via share links.
CREATE POLICY "Anonymous can view public libraries"
ON public.libraries
FOR SELECT
TO anon
USING (is_public = true);