
ALTER TABLE public.books
ADD COLUMN is_borrowed boolean NOT NULL DEFAULT false,
ADD COLUMN borrowed_from text DEFAULT NULL,
ADD COLUMN return_by_date timestamp with time zone DEFAULT NULL,
ADD COLUMN borrow_notifications_enabled boolean NOT NULL DEFAULT false;
