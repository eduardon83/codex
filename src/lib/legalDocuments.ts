import { supabase } from '@/integrations/supabase/client';

export type LegalDocumentType = 'terms' | 'privacy';

export interface LegalDocumentRecord {
  content: string;
  version: string;
  title: string | null;
}

export async function fetchCurrentLegalDocument(
  type: LegalDocumentType,
  language: string,
): Promise<LegalDocumentRecord | null> {
  const lang = ['pt', 'en', 'fr', 'es'].includes(language) ? language : 'pt';
  const select = 'content, version, title';

  const { data } = await supabase
    .from('legal_documents' as any)
    .select(select)
    .eq('type', type)
    .eq('language', lang)
    .eq('is_current', true)
    .limit(1)
    .maybeSingle();

  if (data) return data as unknown as LegalDocumentRecord;

  const { data: fallback } = await supabase
    .from('legal_documents' as any)
    .select(select)
    .eq('type', type)
    .eq('language', 'pt')
    .eq('is_current', true)
    .limit(1)
    .maybeSingle();

  return (fallback as unknown as LegalDocumentRecord | null) || null;
}