
-- 1. Create admin_users table first (referenced by is_admin function)
CREATE TABLE public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 2. Create is_admin security definer function
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = _user_id);
$$;

-- 3. RLS policies for admin_users
CREATE POLICY "Admins can view admin users" ON public.admin_users
FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert admin users" ON public.admin_users
FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete admin users" ON public.admin_users
FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- 4. Seed admin for edmnns@gmail.com
INSERT INTO public.admin_users (user_id)
SELECT id FROM auth.users WHERE email = 'edmnns@gmail.com'
ON CONFLICT DO NOTHING;

-- 5. Add suspended column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended boolean NOT NULL DEFAULT false;

-- 6. Admin audit log table
CREATE TABLE public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  action text NOT NULL,
  affected_user_id uuid,
  affected_record_id text,
  ip_address text,
  details text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log" ON public.admin_audit_log
FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert audit log" ON public.admin_audit_log
FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

-- 7. Admin RLS policies on existing tables
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles" ON public.profiles
FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all books" ON public.books
FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all libraries" ON public.libraries
FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all loans" ON public.loans
FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all reading history" ON public.reading_history
FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

-- 8. Admin stats RPC
CREATE OR REPLACE FUNCTION public.admin_get_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT json_build_object(
    'total_users', (SELECT count(*)::int FROM public.profiles),
    'total_books', (SELECT count(*)::int FROM public.books WHERE is_wishlist = false),
    'total_libraries', (SELECT count(*)::int FROM public.libraries),
    'active_loans', (SELECT count(*)::int FROM public.loans WHERE is_active = true),
    'wishlist_entries', (SELECT count(*)::int FROM public.books WHERE is_wishlist = true),
    'new_users_today', (SELECT count(*)::int FROM public.profiles WHERE created_at >= CURRENT_DATE),
    'new_users_week', (SELECT count(*)::int FROM public.profiles WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
    'new_users_month', (SELECT count(*)::int FROM public.profiles WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'),
    'users_trend_30d', (
      SELECT COALESCE(json_agg(json_build_object('date', d::date, 'count', COALESCE(sub.c, 0)) ORDER BY d), '[]'::json)
      FROM generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, '1 day') AS d
      LEFT JOIN (
        SELECT DATE(created_at) as dt, count(*)::int as c
        FROM public.profiles
        WHERE created_at >= CURRENT_DATE - INTERVAL '29 days'
        GROUP BY DATE(created_at)
      ) sub ON sub.dt = d::date
    ),
    'top_books', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) FROM (
        SELECT isbn, MAX(title) as title, MAX(author) as author, count(*)::int as add_count
        FROM public.books
        WHERE isbn IS NOT NULL AND is_wishlist = false
        GROUP BY isbn
        ORDER BY count(*) DESC
        LIMIT 10
      ) t
    ),
    'top_genres', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) FROM (
        SELECT genre, count(*)::int as count
        FROM public.books
        WHERE genre IS NOT NULL AND is_wishlist = false
        GROUP BY genre
        ORDER BY count(*) DESC
        LIMIT 10
      ) t
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- 9. Admin get users RPC (includes email from auth.users)
CREATE OR REPLACE FUNCTION public.admin_get_users()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT COALESCE(json_agg(row_to_json(t) ORDER BY t.created_at DESC), '[]'::json)
  INTO result
  FROM (
    SELECT
      p.user_id,
      u.email,
      p.first_name,
      p.last_name,
      p.username,
      p.location,
      p.avatar_url,
      p.bio,
      p.profile_completed,
      p.suspended,
      p.created_at,
      p.updated_at,
      EXISTS(SELECT 1 FROM public.admin_users a WHERE a.user_id = p.user_id) as is_admin,
      (SELECT count(*)::int FROM public.books b WHERE b.user_id = p.user_id AND b.is_wishlist = false) as book_count,
      (SELECT count(*)::int FROM public.libraries l WHERE l.user_id = p.user_id) as library_count,
      u.last_sign_in_at
    FROM public.profiles p
    JOIN auth.users u ON u.id = p.user_id
  ) t;

  RETURN result;
END;
$$;

-- 10. Admin export books RPC
CREATE OR REPLACE FUNCTION public.admin_export_books()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
  INTO result
  FROM (
    SELECT
      b.id, b.title, b.author, b.isbn, b.publisher, b.publish_date,
      b.cover_url, b.format, b.genre, b.language, b.page_count,
      b.series_name, b.volume_number, b.tags, b.notes, b.reading_status,
      b.rating, b.is_wishlist, b.is_borrowed, b.borrowed_from,
      b.created_at, b.updated_at,
      p.username as owner_username
    FROM public.books b
    LEFT JOIN public.profiles p ON p.user_id = b.user_id
  ) t;

  RETURN result;
END;
$$;

-- 11. Admin export users RPC
CREATE OR REPLACE FUNCTION public.admin_export_users()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
  INTO result
  FROM (
    SELECT
      p.user_id, u.email, p.first_name, p.last_name, p.username,
      p.location, p.bio, p.age_group, p.language, p.theme,
      p.profile_completed, p.suspended, p.created_at, u.last_sign_in_at
    FROM public.profiles p
    JOIN auth.users u ON u.id = p.user_id
  ) t;

  RETURN result;
END;
$$;
