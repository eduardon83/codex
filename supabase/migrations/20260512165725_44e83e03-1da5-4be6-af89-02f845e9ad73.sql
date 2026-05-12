
-- 1) Hide sensitive parental consent token from end users (column-level privilege)
REVOKE SELECT (parent_consent_token) ON public.profiles FROM anon, authenticated;

-- 2) Make library-card-photos bucket private and restrict access to owner/admin
UPDATE storage.buckets SET public = false WHERE id = 'library-card-photos';

DROP POLICY IF EXISTS "Library card photos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view library card photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view library card photos" ON storage.objects;

CREATE POLICY "Owners can view own library card photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'library-card-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can view all library card photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'library-card-photos' AND public.is_admin(auth.uid()));

-- 3) Add explicit search_path to SECURITY DEFINER functions missing it
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public;
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public;

-- 4) Revoke EXECUTE on admin-only / privileged SECURITY DEFINER functions from public roles
REVOKE EXECUTE ON FUNCTION public.admin_export_users() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.admin_export_books() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.admin_get_users() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.admin_get_stats() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.send_notification_email(text, text, text, text, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM anon, authenticated, public;

-- Trigger-only helper functions: not meant to be called directly
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_profile_completed() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_book_to_reading_history() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_book_update_reading_history() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_book_delete_reading_history() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.trg_role_request_new() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.trg_role_request_decision() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.trg_event_new_pending() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.trg_event_decision() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.trg_school_new() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.trg_reading_list_new() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.trg_reading_list_decision() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.trg_profile_suspended() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.confirm_parental_consent(text) FROM anon, authenticated, public;
