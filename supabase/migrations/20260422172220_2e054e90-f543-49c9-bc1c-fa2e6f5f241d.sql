DO $$ BEGIN
  CREATE TYPE public.reading_plan_status AS ENUM ('active', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.reading_plan_scope AS ENUM ('personal', 'school_district', 'regional', 'national');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.reading_plan_item_status AS ENUM ('planned', 'reading', 'done', 'skipped');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.reading_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NULL,
  created_by_user_id UUID NULL,
  name TEXT NOT NULL,
  description TEXT NULL,
  status public.reading_plan_status NOT NULL DEFAULT 'active',
  is_template BOOLEAN NOT NULL DEFAULT false,
  scope public.reading_plan_scope NULL,
  district_id UUID NULL,
  started_at DATE NULL,
  ends_at DATE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT reading_plans_template_user_check CHECK ((is_template = true AND user_id IS NULL) OR (is_template = false AND user_id IS NOT NULL)),
  CONSTRAINT reading_plans_template_scope_check CHECK ((is_template = true AND scope IS NOT NULL) OR (is_template = false AND scope IS NULL))
);

CREATE UNIQUE INDEX IF NOT EXISTS reading_plans_one_active_personal_idx
ON public.reading_plans (user_id)
WHERE status = 'active' AND is_template = false;

CREATE INDEX IF NOT EXISTS reading_plans_user_status_idx ON public.reading_plans (user_id, status);
CREATE INDEX IF NOT EXISTS reading_plans_template_scope_idx ON public.reading_plans (scope, district_id) WHERE is_template = true;

CREATE TABLE IF NOT EXISTS public.reading_plan_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.reading_plans(id) ON DELETE CASCADE,
  book_id UUID NULL REFERENCES public.books(id) ON DELETE SET NULL,
  isbn TEXT NULL,
  title TEXT NOT NULL,
  author TEXT NULL,
  cover_url TEXT NULL,
  target_month TEXT NULL,
  priority INTEGER NOT NULL DEFAULT 0,
  status public.reading_plan_item_status NOT NULL DEFAULT 'planned',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT reading_plan_items_target_month_format CHECK (target_month IS NULL OR target_month ~ '^\d{4}-\d{2}$')
);

CREATE INDEX IF NOT EXISTS reading_plan_items_plan_month_priority_idx ON public.reading_plan_items (plan_id, target_month, priority);
CREATE INDEX IF NOT EXISTS reading_plan_items_book_id_idx ON public.reading_plan_items (book_id);

ALTER TABLE public.reading_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_plan_items ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_reading_plans_updated_at ON public.reading_plans;
CREATE TRIGGER update_reading_plans_updated_at
BEFORE UPDATE ON public.reading_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_reading_plan_items_updated_at ON public.reading_plan_items;
CREATE TRIGGER update_reading_plan_items_updated_at
BEFORE UPDATE ON public.reading_plan_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'entity', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

DROP POLICY IF EXISTS "Admins can view user roles" ON public.user_roles;
CREATE POLICY "Admins can view user roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.is_admin(auth.uid()))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can view own personal reading plans" ON public.reading_plans;
CREATE POLICY "Users can view own personal reading plans"
ON public.reading_plans
FOR SELECT
TO authenticated
USING (is_template = false AND user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create own personal reading plans" ON public.reading_plans;
CREATE POLICY "Users can create own personal reading plans"
ON public.reading_plans
FOR INSERT
TO authenticated
WITH CHECK (is_template = false AND user_id = auth.uid() AND COALESCE(created_by_user_id, auth.uid()) = auth.uid());

DROP POLICY IF EXISTS "Users can update own personal reading plans" ON public.reading_plans;
CREATE POLICY "Users can update own personal reading plans"
ON public.reading_plans
FOR UPDATE
TO authenticated
USING (is_template = false AND user_id = auth.uid())
WITH CHECK (is_template = false AND user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own personal reading plans" ON public.reading_plans;
CREATE POLICY "Users can delete own personal reading plans"
ON public.reading_plans
FOR DELETE
TO authenticated
USING (is_template = false AND user_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can view matching reading plan templates" ON public.reading_plans;
CREATE POLICY "Authenticated users can view matching reading plan templates"
ON public.reading_plans
FOR SELECT
TO authenticated
USING (
  is_template = true
  AND (
    scope = 'national'
    OR (scope IN ('school_district', 'regional') AND district_id = (SELECT p.district_id FROM public.profiles p WHERE p.user_id = auth.uid()))
  )
);

DROP POLICY IF EXISTS "Authorized users can create reading plan templates" ON public.reading_plans;
CREATE POLICY "Authorized users can create reading plan templates"
ON public.reading_plans
FOR INSERT
TO authenticated
WITH CHECK (
  is_template = true
  AND user_id IS NULL
  AND created_by_user_id = auth.uid()
  AND (
    public.has_role(auth.uid(), 'teacher')
    OR public.has_role(auth.uid(), 'entity')
    OR public.has_role(auth.uid(), 'admin')
    OR public.is_admin(auth.uid())
  )
);

DROP POLICY IF EXISTS "Authorized users can update own reading plan templates" ON public.reading_plans;
CREATE POLICY "Authorized users can update own reading plan templates"
ON public.reading_plans
FOR UPDATE
TO authenticated
USING (is_template = true AND created_by_user_id = auth.uid())
WITH CHECK (is_template = true AND created_by_user_id = auth.uid());

DROP POLICY IF EXISTS "Authorized users can delete own reading plan templates" ON public.reading_plans;
CREATE POLICY "Authorized users can delete own reading plan templates"
ON public.reading_plans
FOR DELETE
TO authenticated
USING (is_template = true AND created_by_user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view readable plan items" ON public.reading_plan_items;
CREATE POLICY "Users can view readable plan items"
ON public.reading_plan_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.reading_plans rp
    WHERE rp.id = reading_plan_items.plan_id
      AND (
        (rp.is_template = false AND rp.user_id = auth.uid())
        OR (
          rp.is_template = true
          AND (
            rp.scope = 'national'
            OR (rp.scope IN ('school_district', 'regional') AND rp.district_id = (SELECT p.district_id FROM public.profiles p WHERE p.user_id = auth.uid()))
          )
        )
      )
  )
);

DROP POLICY IF EXISTS "Users can create items on own plans" ON public.reading_plan_items;
CREATE POLICY "Users can create items on own plans"
ON public.reading_plan_items
FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.reading_plans rp WHERE rp.id = plan_id AND rp.is_template = false AND rp.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update items on own plans" ON public.reading_plan_items;
CREATE POLICY "Users can update items on own plans"
ON public.reading_plan_items
FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.reading_plans rp WHERE rp.id = plan_id AND rp.is_template = false AND rp.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.reading_plans rp WHERE rp.id = plan_id AND rp.is_template = false AND rp.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete items on own plans" ON public.reading_plan_items;
CREATE POLICY "Users can delete items on own plans"
ON public.reading_plan_items
FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.reading_plans rp WHERE rp.id = plan_id AND rp.is_template = false AND rp.user_id = auth.uid()));