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
      NULLIF(concat_ws(', ', c.name, d.name, p.country_code), '') AS location,
      p.avatar_url,
      p.bio,
      p.profile_completed,
      p.suspended,
      p.created_at,
      p.updated_at,
      EXISTS(SELECT 1 FROM public.admin_users a WHERE a.user_id = p.user_id) AS is_admin,
      (SELECT count(*)::int FROM public.books b WHERE b.user_id = p.user_id AND b.is_wishlist = false) AS book_count,
      (SELECT count(*)::int FROM public.libraries l WHERE l.user_id = p.user_id) AS library_count,
      u.last_sign_in_at
    FROM public.profiles p
    JOIN auth.users u ON u.id = p.user_id
    LEFT JOIN public.cities c ON c.id = p.city_id
    LEFT JOIN public.districts d ON d.id = p.district_id
  ) t;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_users() TO authenticated;