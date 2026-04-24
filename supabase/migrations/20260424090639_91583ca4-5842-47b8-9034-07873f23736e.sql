-- Re-pin search_path on the helper + trigger functions added in the previous migration.
ALTER FUNCTION public._fmt_dt(timestamptz) SET search_path = public;
ALTER FUNCTION public.trg_role_request_new() SET search_path = public;
ALTER FUNCTION public.trg_role_request_decision() SET search_path = public, auth;
ALTER FUNCTION public.trg_event_new_pending() SET search_path = public;
ALTER FUNCTION public.trg_event_decision() SET search_path = public, auth;
ALTER FUNCTION public.trg_school_new() SET search_path = public;
ALTER FUNCTION public.trg_reading_list_new() SET search_path = public;
ALTER FUNCTION public.trg_reading_list_decision() SET search_path = public, auth;
ALTER FUNCTION public.trg_profile_suspended() SET search_path = public, auth;