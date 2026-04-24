-- 1. Schema additions ------------------------------------------------------

ALTER TABLE public.events         ADD COLUMN IF NOT EXISTS notification_sent_at timestamptz;
ALTER TABLE public.schools        ADD COLUMN IF NOT EXISTS notification_sent_at timestamptz;
ALTER TABLE public.reading_lists  ADD COLUMN IF NOT EXISTS notification_sent_at timestamptz;
ALTER TABLE public.reading_lists  ADD COLUMN IF NOT EXISTS rejection_note       text;
ALTER TABLE public.profiles       ADD COLUMN IF NOT EXISTS suspension_reason    text;

-- Add 'suspended' to account_status check constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_account_status_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_account_status_check
  CHECK (account_status = ANY (ARRAY[
    'pending_setup'::text,
    'pending_parental_consent'::text,
    'active'::text,
    'blocked_underage'::text,
    'suspended'::text
  ]));

-- 2. role_requests table ---------------------------------------------------

CREATE TABLE IF NOT EXISTS public.role_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_role text NOT NULL CHECK (requested_role IN ('teacher','entity','school_admin')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  school_id uuid REFERENCES public.schools(id) ON DELETE SET NULL,
  entity_name text,
  entity_type text,
  message text,
  review_note text,
  reviewed_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  notification_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_role_requests_status ON public.role_requests(status);
CREATE INDEX IF NOT EXISTS idx_role_requests_requester ON public.role_requests(requester_user_id);

ALTER TABLE public.role_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users create own role requests"
  ON public.role_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_user_id);

CREATE POLICY "Users view own role requests"
  ON public.role_requests FOR SELECT TO authenticated
  USING (auth.uid() = requester_user_id);

CREATE POLICY "Admins view all role requests"
  ON public.role_requests FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins update role requests"
  ON public.role_requests FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins delete role requests"
  ON public.role_requests FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER role_requests_updated_at
  BEFORE UPDATE ON public.role_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Notification helper ---------------------------------------------------
-- Calls send-notification-email Edge Function via pg_net using the
-- service-role key stored in Vault (created by setup_email_infra).

CREATE OR REPLACE FUNCTION public.send_notification_email(
  _to text,
  _subject text,
  _body_html text,
  _action_label text,
  _action_url text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, vault
AS $$
DECLARE
  _service_key text;
  _project_url text;
  _function_url text;
BEGIN
  IF _to IS NULL OR _to = '' THEN RETURN; END IF;

  SELECT decrypted_secret INTO _service_key
  FROM vault.decrypted_secrets
  WHERE name = 'email_queue_service_role_key'
  LIMIT 1;

  IF _service_key IS NULL THEN
    RAISE WARNING 'send_notification_email: service role key not in vault';
    RETURN;
  END IF;

  -- Hardcoded project URL (matches SUPABASE_URL env var)
  _project_url := 'https://qgyxpvhdpqmtlmrrzuxr.supabase.co';
  _function_url := _project_url || '/functions/v1/send-notification-email';

  PERFORM net.http_post(
    url := _function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || _service_key
    ),
    body := jsonb_build_object(
      'to', _to,
      'subject', _subject,
      'body_html', _body_html,
      'action_label', _action_label,
      'action_url', _action_url
    )
  );
END;
$$;

-- 4. Trigger functions -----------------------------------------------------

-- Helper: format Lisbon date
CREATE OR REPLACE FUNCTION public._fmt_dt(_ts timestamptz) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT to_char(_ts AT TIME ZONE 'Europe/Lisbon', 'DD/MM/YYYY HH24:MI');
$$;

-- ROLE REQUEST: new (teacher / entity / school_admin) ---------------------
CREATE OR REPLACE FUNCTION public.trg_role_request_new() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _username text;
  _school_name text;
  _district text;
  _subject text;
  _body text;
  _label text := 'Novo pedido';
BEGIN
  IF NEW.status <> 'pending' THEN RETURN NEW; END IF;
  IF NEW.notification_sent_at IS NOT NULL THEN RETURN NEW; END IF;

  SELECT p.username INTO _username FROM public.profiles p WHERE p.user_id = NEW.requester_user_id;

  IF NEW.school_id IS NOT NULL THEN
    SELECT s.name, d.name INTO _school_name, _district
    FROM public.schools s LEFT JOIN public.districts d ON d.id = s.district_id
    WHERE s.id = NEW.school_id;
  END IF;

  IF NEW.requested_role = 'teacher' THEN
    _subject := '[Folium] Novo pedido de professor — ' || COALESCE(_username, 'utilizador');
    _label := 'Rever pedido';
    _body := COALESCE(_username,'(sem username)') || ' pediu acesso como professor na ' ||
             COALESCE(_school_name,'(escola não indicada)') || ' (' || COALESCE(_district,'—') || '). Submetido em ' ||
             public._fmt_dt(NEW.created_at) || '.';
  ELSIF NEW.requested_role = 'entity' THEN
    _subject := '[Folium] Novo pedido de entidade — ' || COALESCE(NEW.entity_name, 'sem nome');
    _label := 'Rever pedido';
    _body := COALESCE(_username,'(sem username)') || ' pediu conta institucional para ' ||
             COALESCE(NEW.entity_name,'(sem nome)') || ' (' || COALESCE(NEW.entity_type,'—') || '). Submetido em ' ||
             public._fmt_dt(NEW.created_at) || '.';
  ELSIF NEW.requested_role = 'school_admin' THEN
    _subject := '[Folium] Novo pedido de admin de escola — ' || COALESCE(_username,'utilizador');
    _label := 'Rever pedido';
    _body := COALESCE(_username,'(sem username)') || ' pediu acesso como administrador da ' ||
             COALESCE(_school_name,'(escola não indicada)') || ' (' || COALESCE(_district,'—') || '). Submetido em ' ||
             public._fmt_dt(NEW.created_at) || '.';
  ELSE
    RETURN NEW;
  END IF;

  PERFORM public.send_notification_email(
    'folium@kendirstudios.pt', _subject, _body, _label,
    'https://folium.kendirstudios.pt/admin/role-requests'
  );
  UPDATE public.role_requests SET notification_sent_at = now() WHERE id = NEW.id;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_role_request_new_email
  AFTER INSERT ON public.role_requests
  FOR EACH ROW EXECUTE FUNCTION public.trg_role_request_new();

-- ROLE REQUEST: approved / rejected ---------------------------------------
CREATE OR REPLACE FUNCTION public.trg_role_request_decision() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _email text;
  _subject text;
  _body text;
BEGIN
  IF NEW.status NOT IN ('approved','rejected') THEN RETURN NEW; END IF;
  IF NEW.status = OLD.status THEN RETURN NEW; END IF;

  SELECT u.email INTO _email FROM auth.users u WHERE u.id = NEW.requester_user_id;
  IF _email IS NULL THEN RETURN NEW; END IF;

  IF NEW.status = 'approved' THEN
    _subject := '[Folium] O teu pedido foi aprovado';
    _body := 'O teu pedido para ' || NEW.requested_role || ' no Folium foi aprovado. Já podes usar as novas funcionalidades.';
  ELSE
    _subject := '[Folium] O teu pedido não foi aprovado';
    _body := 'O teu pedido para ' || NEW.requested_role || ' não foi aprovado.';
    IF NEW.review_note IS NOT NULL AND NEW.review_note <> '' THEN
      _body := _body || ' Motivo: ' || NEW.review_note || '.';
    END IF;
  END IF;

  PERFORM public.send_notification_email(_email, _subject, _body, 'Abrir Folium', 'https://folium.kendirstudios.pt');
  RETURN NEW;
END $$;

CREATE TRIGGER trg_role_request_decision_email
  AFTER UPDATE OF status ON public.role_requests
  FOR EACH ROW EXECUTE FUNCTION public.trg_role_request_decision();

-- EVENTS: new pending ------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_event_new_pending() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _creator text;
  _role text;
  _subject text;
  _body text;
BEGIN
  IF NEW.approval_status <> 'pending' OR NEW.scope = 'school' THEN RETURN NEW; END IF;
  IF NEW.notification_sent_at IS NOT NULL THEN RETURN NEW; END IF;

  SELECT COALESCE(NULLIF(p.first_name||' '||COALESCE(p.last_name,''),' '), p.username, '(utilizador)')
    INTO _creator
  FROM public.profiles p WHERE p.user_id = NEW.created_by_user_id;

  SELECT string_agg(role::text, ', ') INTO _role
  FROM public.user_roles WHERE user_id = NEW.created_by_user_id;

  _subject := '[Folium] Evento aguarda aprovação — ' || NEW.title;
  _body := COALESCE(_creator,'(utilizador)') || ' (' || COALESCE(_role,'sem papel') || ') submeteu o evento "' ||
           NEW.title || '" com âmbito ' || NEW.scope::text || '. Submetido em ' || public._fmt_dt(NEW.created_at) || '.';

  PERFORM public.send_notification_email(
    'folium@kendirstudios.pt', _subject, _body, 'Rever evento',
    'https://folium.kendirstudios.pt/admin/events'
  );
  UPDATE public.events SET notification_sent_at = now() WHERE id = NEW.id;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_event_new_pending_email
  AFTER INSERT ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.trg_event_new_pending();

-- EVENTS: approved / rejected ---------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_event_decision() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _email text;
  _subject text;
  _body text;
  _label text := 'Abrir Folium';
BEGIN
  IF NEW.approval_status = OLD.approval_status THEN RETURN NEW; END IF;

  SELECT u.email INTO _email FROM auth.users u WHERE u.id = NEW.created_by_user_id;
  IF _email IS NULL THEN RETURN NEW; END IF;

  IF NEW.approval_status = 'approved' THEN
    _subject := '[Folium] O teu evento está publicado';
    _body := 'O evento "' || NEW.title || '" foi aprovado e está agora visível para os alunos do ' || NEW.scope::text || '.';
    _label := 'Ver evento';
  ELSIF NEW.approval_status = 'rejected' THEN
    _subject := '[Folium] O teu evento não foi aprovado';
    _body := 'O evento "' || NEW.title || '" não foi aprovado.';
    IF NEW.rejection_note IS NOT NULL AND NEW.rejection_note <> '' THEN
      _body := _body || ' Motivo: ' || NEW.rejection_note || '.';
    END IF;
  ELSE
    RETURN NEW;
  END IF;

  PERFORM public.send_notification_email(_email, _subject, _body, _label, 'https://folium.kendirstudios.pt');
  RETURN NEW;
END $$;

CREATE TRIGGER trg_event_decision_email
  AFTER UPDATE OF approval_status ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.trg_event_decision();

-- SCHOOLS: new submission --------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_school_new() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _username text;
  _district text;
  _subject text;
  _body text;
BEGIN
  IF NEW.is_verified = true THEN RETURN NEW; END IF;
  IF NEW.notification_sent_at IS NOT NULL THEN RETURN NEW; END IF;

  IF NEW.submitted_by_user_id IS NOT NULL THEN
    SELECT p.username INTO _username FROM public.profiles p WHERE p.user_id = NEW.submitted_by_user_id;
  END IF;
  SELECT d.name INTO _district FROM public.districts d WHERE d.id = NEW.district_id;

  _subject := '[Folium] Nova escola submetida — ' || NEW.name;
  _body := COALESCE(_username,'(sistema)') || ' submeteu "' || NEW.name || '" em ' ||
           COALESCE(NEW.concelho,'—') || ', ' || COALESCE(_district,'—') ||
           '. Submetido em ' || public._fmt_dt(NEW.created_at) || '.';

  PERFORM public.send_notification_email(
    'folium@kendirstudios.pt', _subject, _body, 'Rever escola',
    'https://folium.kendirstudios.pt/admin/schools'
  );
  UPDATE public.schools SET notification_sent_at = now() WHERE id = NEW.id;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_school_new_email
  AFTER INSERT ON public.schools
  FOR EACH ROW EXECUTE FUNCTION public.trg_school_new();

-- READING LISTS: new official pending -------------------------------------
CREATE OR REPLACE FUNCTION public.trg_reading_list_new() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _subject text;
  _body text;
BEGIN
  IF NEW.approval_status <> 'draft' OR NEW.is_official <> true THEN RETURN NEW; END IF;
  IF NEW.notification_sent_at IS NOT NULL THEN RETURN NEW; END IF;

  _subject := '[Folium] Lista oficial aguarda aprovação — ' || NEW.name;
  _body := COALESCE(NEW.creator_name,'(autor)') || ' submeteu a lista "' || NEW.name ||
           '" com âmbito ' || NEW.scope || '. Submetido em ' || public._fmt_dt(NEW.created_at) || '.';

  PERFORM public.send_notification_email(
    'folium@kendirstudios.pt', _subject, _body, 'Rever lista',
    'https://folium.kendirstudios.pt/admin/reading-lists'
  );
  UPDATE public.reading_lists SET notification_sent_at = now() WHERE id = NEW.id;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_reading_list_new_email
  AFTER INSERT ON public.reading_lists
  FOR EACH ROW EXECUTE FUNCTION public.trg_reading_list_new();

-- READING LISTS: published / rejected -------------------------------------
CREATE OR REPLACE FUNCTION public.trg_reading_list_decision() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _email text;
  _subject text;
  _body text;
BEGIN
  IF NEW.is_official <> true THEN RETURN NEW; END IF;
  IF NEW.approval_status = OLD.approval_status THEN RETURN NEW; END IF;

  SELECT u.email INTO _email FROM auth.users u WHERE u.id = NEW.user_id;
  IF _email IS NULL THEN RETURN NEW; END IF;

  IF NEW.approval_status = 'published' AND OLD.approval_status <> 'published' THEN
    _subject := '[Folium] A tua lista está publicada';
    _body := 'A lista "' || NEW.name || '" foi aprovada e está agora disponível para os alunos.';
  ELSIF NEW.approval_status = 'archived' AND OLD.approval_status = 'draft' THEN
    _subject := '[Folium] A tua lista não foi aprovada';
    _body := 'A lista "' || NEW.name || '" não foi aprovada para publicação.';
    IF NEW.rejection_note IS NOT NULL AND NEW.rejection_note <> '' THEN
      _body := _body || ' Motivo: ' || NEW.rejection_note || '.';
    END IF;
  ELSE
    RETURN NEW;
  END IF;

  PERFORM public.send_notification_email(_email, _subject, _body, 'Abrir Folium', 'https://folium.kendirstudios.pt');
  RETURN NEW;
END $$;

CREATE TRIGGER trg_reading_list_decision_email
  AFTER UPDATE OF approval_status ON public.reading_lists
  FOR EACH ROW EXECUTE FUNCTION public.trg_reading_list_decision();

-- PROFILES: account suspended --------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_profile_suspended() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _email text;
  _body text;
BEGIN
  IF NEW.account_status <> 'suspended' OR OLD.account_status = 'suspended' THEN RETURN NEW; END IF;

  SELECT u.email INTO _email FROM auth.users u WHERE u.id = NEW.user_id;
  IF _email IS NULL THEN RETURN NEW; END IF;

  _body := 'A tua conta no Folium foi suspensa.';
  IF NEW.suspension_reason IS NOT NULL AND NEW.suspension_reason <> '' THEN
    _body := _body || ' Motivo: ' || NEW.suspension_reason || '.';
  END IF;
  _body := _body || ' Se acreditas que isto foi um erro, contacta-nos em folium@kendirstudios.pt.';

  PERFORM public.send_notification_email(
    _email, '[Folium] A tua conta foi suspensa', _body,
    'Contactar suporte', 'mailto:folium@kendirstudios.pt'
  );
  RETURN NEW;
END $$;

CREATE TRIGGER trg_profile_suspended_email
  AFTER UPDATE OF account_status ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.trg_profile_suspended();
