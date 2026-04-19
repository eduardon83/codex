ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_lat double precision;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_lng double precision;