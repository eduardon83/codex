
-- Add birth_year column for analytics (store only)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_year integer;

-- Add 'reader' role to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'reader';

-- Private bucket for role-request supporting documents (bookstore proof, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('role-request-documents', 'role-request-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: requesters can upload + read their own files; admins can read all
CREATE POLICY "Requesters can upload own role docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'role-request-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Requesters can read own role docs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'role-request-documents'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.is_admin(auth.uid())
  )
);

CREATE POLICY "Requesters can delete own role docs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'role-request-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
