ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS terms_version TEXT;

CREATE TABLE IF NOT EXISTS public.legal_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'pt',
  version TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT legal_documents_type_check CHECK (type IN ('terms', 'privacy')),
  CONSTRAINT legal_documents_language_check CHECK (language IN ('pt', 'en', 'fr', 'es')),
  CONSTRAINT legal_documents_unique_version UNIQUE (type, language, version)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_legal_documents_current_unique
ON public.legal_documents (type, language)
WHERE is_current = true;

CREATE INDEX IF NOT EXISTS idx_legal_documents_lookup
ON public.legal_documents (type, language, is_current);

ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view current legal documents"
ON public.legal_documents
FOR SELECT
TO authenticated
USING (is_current = true);

CREATE POLICY "Admins can view all legal documents"
ON public.legal_documents
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can create legal documents"
ON public.legal_documents
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update legal documents"
ON public.legal_documents
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete legal documents"
ON public.legal_documents
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

DROP TRIGGER IF EXISTS update_legal_documents_updated_at ON public.legal_documents;
CREATE TRIGGER update_legal_documents_updated_at
BEFORE UPDATE ON public.legal_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();