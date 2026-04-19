-- Enable required extensions for cron scheduling and HTTP calls
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create private backups bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('backups', 'backups', false)
ON CONFLICT (id) DO NOTHING;

-- Allow admins to list/read backup files via authenticated session (UI listing)
CREATE POLICY "Admins can list backup files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'backups' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete backup files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'backups' AND public.is_admin(auth.uid()));