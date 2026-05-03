ALTER TABLE public.role_requests DROP CONSTRAINT IF EXISTS role_requests_requested_role_check;
ALTER TABLE public.role_requests ADD CONSTRAINT role_requests_requested_role_check CHECK (requested_role = ANY (ARRAY['teacher'::text, 'entity'::text, 'school_admin'::text, 'bookstore'::text, 'author'::text, 'influencer'::text]));
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'bookstore';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'author';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'influencer';