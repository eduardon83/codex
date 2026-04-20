-- ============================================================
-- DISTRICTS
-- ============================================================
CREATE TABLE public.districts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT,
  country_code TEXT NOT NULL DEFAULT 'PT',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (country_code, name)
);

ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read districts"
  ON public.districts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert districts"
  ON public.districts FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update districts"
  ON public.districts FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete districts"
  ON public.districts FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ============================================================
-- SCHOOLS
-- ============================================================
CREATE TABLE public.schools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  me_code TEXT UNIQUE,
  name TEXT NOT NULL,
  district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE RESTRICT,
  concelho TEXT,
  address TEXT,
  school_type TEXT NOT NULL DEFAULT 'public' CHECK (school_type IN ('public', 'private')),
  education_levels TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  submitted_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_schools_district_id ON public.schools(district_id);
CREATE INDEX idx_schools_name ON public.schools(name);
CREATE INDEX idx_schools_is_verified ON public.schools(is_verified);

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read schools"
  ON public.schools FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can submit unverified schools (only if they set themselves as submitter and is_verified = false)
CREATE POLICY "Users can submit unverified schools"
  ON public.schools FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = submitted_by_user_id
    AND is_verified = false
  );

-- Admins can do everything
CREATE POLICY "Admins can insert schools"
  ON public.schools FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update schools"
  ON public.schools FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete schools"
  ON public.schools FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_schools_updated_at
  BEFORE UPDATE ON public.schools
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- PROFILES: add country_code, district_id, school_id
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN country_code TEXT NOT NULL DEFAULT 'PT',
  ADD COLUMN district_id UUID REFERENCES public.districts(id) ON DELETE SET NULL,
  ADD COLUMN school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.profiles.location IS 'DEPRECATED for Folium. Kept for Bibliotheca compatibility. Use district_id + school_id instead.';

-- ============================================================
-- SEED: Portuguese districts + autonomous regions
-- ============================================================
INSERT INTO public.districts (name, region, country_code) VALUES
  ('Aveiro', 'Centro', 'PT'),
  ('Beja', 'Alentejo', 'PT'),
  ('Braga', 'Norte', 'PT'),
  ('Bragança', 'Norte', 'PT'),
  ('Castelo Branco', 'Centro', 'PT'),
  ('Coimbra', 'Centro', 'PT'),
  ('Évora', 'Alentejo', 'PT'),
  ('Faro', 'Algarve', 'PT'),
  ('Guarda', 'Centro', 'PT'),
  ('Leiria', 'Centro', 'PT'),
  ('Lisboa', 'Lisboa', 'PT'),
  ('Portalegre', 'Alentejo', 'PT'),
  ('Porto', 'Norte', 'PT'),
  ('Santarém', 'Centro', 'PT'),
  ('Setúbal', 'Lisboa', 'PT'),
  ('Viana do Castelo', 'Norte', 'PT'),
  ('Vila Real', 'Norte', 'PT'),
  ('Viseu', 'Centro', 'PT'),
  ('Região Autónoma dos Açores', 'Açores', 'PT'),
  ('Região Autónoma da Madeira', 'Madeira', 'PT');