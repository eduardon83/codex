
ALTER TABLE public.profiles
ADD COLUMN age_group text NOT NULL DEFAULT 'under_18',
ADD COLUMN theme text NOT NULL DEFAULT 'claro';
