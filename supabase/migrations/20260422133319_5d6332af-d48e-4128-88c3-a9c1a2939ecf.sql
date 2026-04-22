ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS parent_consent_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS parent_consent_granted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS pending_email_confirmation_after_parental_consent BOOLEAN NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.get_parental_consent_request(_token TEXT)
RETURNS TABLE(
  first_name TEXT,
  age INTEGER,
  language TEXT,
  terms_version TEXT,
  terms_accepted_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _token IS NULL OR length(_token) < 16 THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    p.first_name,
    CASE
      WHEN p.date_of_birth IS NULL THEN NULL::INTEGER
      ELSE date_part('year', age(current_date, p.date_of_birth))::INTEGER
    END AS age,
    p.language,
    p.terms_version,
    p.terms_accepted_at
  FROM public.profiles p
  WHERE p.parent_consent_token = _token
    AND p.parent_consent_expires_at > now()
    AND p.parent_consent_granted_at IS NULL
    AND p.account_status = 'pending_parental_consent'
  LIMIT 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.grant_parental_consent(_token TEXT)
RETURNS TABLE(first_name TEXT, activated BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _profile RECORD;
  _email_confirmed BOOLEAN := true;
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

  UPDATE public.profiles
  SET parent_consent_granted_at = now(),
      parent_consent_confirmed_at = now(),
      parent_consent_token = NULL,
      pending_email_confirmation_after_parental_consent = NOT _email_confirmed,
      account_status = CASE WHEN _email_confirmed THEN 'active' ELSE account_status END
  WHERE user_id = _profile.user_id;

  RETURN QUERY SELECT _profile.first_name::TEXT, _email_confirmed;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_parental_consent_request(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grant_parental_consent(TEXT) TO anon, authenticated;