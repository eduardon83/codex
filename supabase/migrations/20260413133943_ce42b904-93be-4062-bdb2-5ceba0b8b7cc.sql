
ALTER TABLE public.loans
ADD COLUMN loan_due_date timestamp with time zone DEFAULT NULL,
ADD COLUMN loan_notifications_enabled boolean NOT NULL DEFAULT false;
