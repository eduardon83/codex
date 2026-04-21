
-- Add age-gating and parental consent fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'pending_setup',
  ADD COLUMN IF NOT EXISTS parent_email TEXT,
  ADD COLUMN IF NOT EXISTS parent_consent_token TEXT,
  ADD COLUMN IF NOT EXISTS parent_consent_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS parent_consent_confirmed_at TIMESTAMPTZ;

-- Backfill account_status for existing profiles
UPDATE public.profiles
SET account_status = CASE
  WHEN profile_completed = true THEN 'active'
  ELSE 'pending_setup'
END
WHERE account_status = 'pending_setup' AND profile_completed = true;

-- Validation: account_status must be one of the allowed values
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_account_status_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_account_status_check
      CHECK (account_status IN ('pending_setup','pending_parental_consent','active','blocked_underage'));
  END IF;
END $$;

-- Public RPC to confirm parental consent via email token (no auth required)
CREATE OR REPLACE FUNCTION public.confirm_parental_consent(_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _profile_id UUID;
BEGIN
  IF _token IS NULL OR length(_token) < 16 THEN
    RETURN FALSE;
  END IF;

  UPDATE public.profiles
  SET account_status = 'active',
      parent_consent_confirmed_at = now(),
      parent_consent_token = NULL
  WHERE parent_consent_token = _token
    AND account_status = 'pending_parental_consent'
  RETURNING id INTO _profile_id;

  RETURN _profile_id IS NOT NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.confirm_parental_consent(TEXT) TO anon, authenticated;
