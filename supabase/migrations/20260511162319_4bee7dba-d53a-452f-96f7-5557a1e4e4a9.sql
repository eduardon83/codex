
ALTER TABLE public.reading_plans
  ADD COLUMN IF NOT EXISTS source_template_id uuid REFERENCES public.reading_plans(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_reading_plans_source_template
  ON public.reading_plans (source_template_id)
  WHERE source_template_id IS NOT NULL;
