CREATE OR REPLACE FUNCTION public.grant_parental_consent(_token TEXT)
RETURNS TABLE(first_name TEXT, activated BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  _profile RECORD;
  _email_confirmed BOOLEAN := false;
BEGIN
  IF _token IS NULL OR length(_token) < 16 THEN
    RETURN;
  END IF;

  SELECT p.* INTO _profile
  FROM public.profiles p
  WHERE p.parent_consent_token = _token
    AND p.parent_consent_expires_at > now()
    AND p.parent_consent_granted_at IS NULL
    AND p.account_status = 'pending_parental_consent'
  LIMIT 1;

  IF _profile.user_id IS NULL THEN
    RETURN;
  END IF;

  SELECT (u.email_confirmed_at IS NOT NULL) INTO _email_confirmed
  FROM auth.users u
  WHERE u.id = _profile.user_id;

  UPDATE public.profiles
  SET parent_consent_granted_at = now(),
      parent_consent_confirmed_at = now(),
      parent_consent_token = NULL,
      pending_email_confirmation_after_parental_consent = NOT COALESCE(_email_confirmed, false),
      account_status = CASE WHEN COALESCE(_email_confirmed, false) THEN 'active' ELSE account_status END
  WHERE user_id = _profile.user_id;

  RETURN QUERY SELECT _profile.first_name::TEXT, COALESCE(_email_confirmed, false);
END;
$$;