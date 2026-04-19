-- App content CMS table
CREATE TABLE public.app_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'general',
  value_pt text,
  value_en text,
  value_fr text,
  value_es text,
  updated_by_admin_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_app_content_category ON public.app_content (category);

ALTER TABLE public.app_content ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read
CREATE POLICY "Authenticated users can read app content"
  ON public.app_content FOR SELECT
  TO authenticated
  USING (true);

-- Admins can write
CREATE POLICY "Admins can insert app content"
  ON public.app_content FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update app content"
  ON public.app_content FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete app content"
  ON public.app_content FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Updated_at trigger
CREATE TRIGGER update_app_content_updated_at
  BEFORE UPDATE ON public.app_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();