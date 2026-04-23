CREATE TYPE public.event_type AS ENUM (
  'reading_group', 'author_talk', 'writing_comp', 'reading_comp', 'poetry_slam', 'book_club',
  'symposium', 'workshop', 'book_fair', 'interschool', 'library_visit', 'reading_week',
  'storytelling', 'news', 'award', 'pnl_update'
);

CREATE TYPE public.event_scope AS ENUM ('school', 'district', 'regional', 'national');
CREATE TYPE public.event_status AS ENUM ('draft', 'published', 'archived', 'cancelled');
CREATE TYPE public.event_approval_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.event_media_type AS ENUM ('banner', 'image', 'attachment');
CREATE TYPE public.event_registration_status AS ENUM ('confirmed', 'waitlisted', 'cancelled');

CREATE TABLE public.entities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  role_label TEXT,
  logo_url TEXT,
  district_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by_user_id UUID NOT NULL,
  entity_id UUID REFERENCES public.entities(id) ON DELETE SET NULL,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  district_id UUID REFERENCES public.districts(id) ON DELETE SET NULL,
  type public.event_type NOT NULL,
  scope public.event_scope NOT NULL,
  title TEXT NOT NULL,
  introduction TEXT NOT NULL,
  body TEXT NOT NULL,
  status public.event_status NOT NULL DEFAULT 'draft',
  is_official BOOLEAN NOT NULL DEFAULT false,
  approval_status public.event_approval_status NOT NULL DEFAULT 'pending',
  rejection_note TEXT,
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  registration_opens_at TIMESTAMP WITH TIME ZONE,
  registration_closes_at TIMESTAMP WITH TIME ZONE,
  registration_limit INTEGER,
  location TEXT,
  online_link TEXT,
  linked_book_isbn TEXT,
  linked_reading_list_id UUID REFERENCES public.reading_lists(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT events_introduction_length CHECK (char_length(introduction) <= 300),
  CONSTRAINT events_title_length CHECK (char_length(title) <= 100),
  CONSTRAINT events_registration_limit_positive CHECK (registration_limit IS NULL OR registration_limit > 0)
);

CREATE TABLE public.event_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  type public.event_media_type NOT NULL,
  url TEXT NOT NULL,
  filename TEXT,
  mime_type TEXT,
  file_size INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status public.event_registration_status NOT NULL DEFAULT 'confirmed',
  UNIQUE (event_id, user_id)
);

CREATE INDEX idx_events_scope_status ON public.events(status, scope, district_id, school_id);
CREATE INDEX idx_events_starts_at ON public.events(starts_at);
CREATE INDEX idx_event_media_event_id ON public.event_media(event_id);
CREATE INDEX idx_event_registrations_event_id ON public.event_registrations(event_id);
CREATE INDEX idx_event_registrations_user_id ON public.event_registrations(user_id);
CREATE INDEX idx_entities_user_id ON public.entities(user_id);

ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Entities are readable by authenticated users"
ON public.entities FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authorized users can create their entity"
ON public.entities FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() AND (public.has_role(auth.uid(), 'entity'::public.app_role) OR public.has_role(auth.uid(), 'global_admin'::public.app_role) OR public.is_admin(auth.uid())));

CREATE POLICY "Entity owners and global admins can update entities"
ON public.entities FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'global_admin'::public.app_role) OR public.is_admin(auth.uid()))
WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'global_admin'::public.app_role) OR public.is_admin(auth.uid()));

CREATE POLICY "Entity owners and global admins can delete entities"
ON public.entities FOR DELETE TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'global_admin'::public.app_role) OR public.is_admin(auth.uid()));

CREATE POLICY "Authenticated users can view matching published events"
ON public.events FOR SELECT TO authenticated
USING (
  status = 'published'::public.event_status
  AND approval_status = 'approved'::public.event_approval_status
  AND (
    scope = 'national'::public.event_scope
    OR (scope IN ('district'::public.event_scope, 'regional'::public.event_scope) AND district_id = (SELECT p.district_id FROM public.profiles p WHERE p.user_id = auth.uid()))
    OR (school_id = (SELECT p.school_id FROM public.profiles p WHERE p.user_id = auth.uid()))
  )
);

CREATE POLICY "Creators can view own events"
ON public.events FOR SELECT TO authenticated
USING (created_by_user_id = auth.uid() OR public.has_role(auth.uid(), 'global_admin'::public.app_role) OR public.is_admin(auth.uid()));

CREATE POLICY "Authorized users can create events"
ON public.events FOR INSERT TO authenticated
WITH CHECK (
  created_by_user_id = auth.uid()
  AND (public.has_role(auth.uid(), 'teacher'::public.app_role) OR public.has_role(auth.uid(), 'school_admin'::public.app_role) OR public.has_role(auth.uid(), 'entity'::public.app_role) OR public.has_role(auth.uid(), 'global_admin'::public.app_role) OR public.is_admin(auth.uid()))
);

CREATE POLICY "Creators and global admins can update events"
ON public.events FOR UPDATE TO authenticated
USING (created_by_user_id = auth.uid() OR public.has_role(auth.uid(), 'global_admin'::public.app_role) OR public.is_admin(auth.uid()))
WITH CHECK (created_by_user_id = auth.uid() OR public.has_role(auth.uid(), 'global_admin'::public.app_role) OR public.is_admin(auth.uid()));

CREATE POLICY "Creators and global admins can delete events"
ON public.events FOR DELETE TO authenticated
USING (created_by_user_id = auth.uid() OR public.has_role(auth.uid(), 'global_admin'::public.app_role) OR public.is_admin(auth.uid()));

CREATE POLICY "Authenticated users can view event media"
ON public.event_media FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_media.event_id));

CREATE POLICY "Creators can add event media"
ON public.event_media FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_media.event_id AND (e.created_by_user_id = auth.uid() OR public.has_role(auth.uid(), 'global_admin'::public.app_role) OR public.is_admin(auth.uid()))));

CREATE POLICY "Creators can update event media"
ON public.event_media FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_media.event_id AND (e.created_by_user_id = auth.uid() OR public.has_role(auth.uid(), 'global_admin'::public.app_role) OR public.is_admin(auth.uid()))))
WITH CHECK (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_media.event_id AND (e.created_by_user_id = auth.uid() OR public.has_role(auth.uid(), 'global_admin'::public.app_role) OR public.is_admin(auth.uid()))));

CREATE POLICY "Creators can delete event media"
ON public.event_media FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_media.event_id AND (e.created_by_user_id = auth.uid() OR public.has_role(auth.uid(), 'global_admin'::public.app_role) OR public.is_admin(auth.uid()))));

CREATE POLICY "Users can view own event registrations"
ON public.event_registrations FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can register themselves"
ON public.event_registrations FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can cancel own event registrations"
ON public.event_registrations FOR DELETE TO authenticated
USING (user_id = auth.uid());

INSERT INTO storage.buckets (id, name, public)
VALUES ('event-media', 'event-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Event media files are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-media');

CREATE POLICY "Authorized roles can upload event media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'event-media'
  AND (public.has_role(auth.uid(), 'teacher'::public.app_role) OR public.has_role(auth.uid(), 'school_admin'::public.app_role) OR public.has_role(auth.uid(), 'entity'::public.app_role) OR public.has_role(auth.uid(), 'global_admin'::public.app_role) OR public.is_admin(auth.uid()))
);

CREATE POLICY "Owners and global admins can delete event media"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'event-media'
  AND (owner = auth.uid() OR public.has_role(auth.uid(), 'global_admin'::public.app_role) OR public.is_admin(auth.uid()))
);

CREATE TRIGGER update_entities_updated_at
BEFORE UPDATE ON public.entities
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();