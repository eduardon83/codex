import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';

/**
 * In-memory CMS cache for app_content rows.
 * Layered on top of i18next for the tutorial / help / empty_states / notifications / about namespaces.
 *
 * useContent('library.emptyTitle') returns the value for the active language from app_content
 * if a row exists, otherwise falls back to i18next's t().
 */

type ContentRow = {
  key: string;
  category: string;
  value_pt: string | null;
  value_en: string | null;
  value_fr: string | null;
  value_es: string | null;
};

type LangCol = 'value_pt' | 'value_en' | 'value_fr' | 'value_es';

const cache = new Map<string, ContentRow>();
const subscribers = new Set<() => void>();
let allLoaded = false;
let loadingPromise: Promise<void> | null = null;

function langColumn(lng: string): LangCol {
  switch ((lng || 'en').slice(0, 2)) {
    case 'pt': return 'value_pt';
    case 'fr': return 'value_fr';
    case 'es': return 'value_es';
    default: return 'value_en';
  }
}

async function loadAll(): Promise<void> {
  if (allLoaded) return;
  if (loadingPromise) return loadingPromise;
  loadingPromise = (async () => {
    const { data, error } = await supabase
      .from('app_content')
      .select('key, category, value_pt, value_en, value_fr, value_es');
    if (!error && data) {
      cache.clear();
      for (const row of data as ContentRow[]) cache.set(row.key, row);
      allLoaded = true;
      subscribers.forEach((fn) => fn());
    }
  })();
  try {
    await loadingPromise;
  } finally {
    loadingPromise = null;
  }
}

/** Invalidate the in-memory cache. Call after admin edits. */
export function invalidateContentCache(): void {
  cache.clear();
  allLoaded = false;
  subscribers.forEach((fn) => fn());
}

/** Apply {{var}} interpolation matching i18next behaviour. */
function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, name) =>
    vars[name] != null ? String(vars[name]) : '',
  );
}

/**
 * Fetches a CMS-managed string by key. Falls back to i18next's translation
 * when no row exists for the key. Supports the same {{var}} interpolation as i18next.
 */
export function useContent(
  key: string,
  vars?: Record<string, string | number>,
): string {
  const { t, i18n } = useTranslation();
  const [, force] = useState(0);

  useEffect(() => {
    const fn = () => force((n) => n + 1);
    subscribers.add(fn);
    void loadAll();
    return () => {
      subscribers.delete(fn);
    };
  }, []);

  const row = cache.get(key);
  if (row) {
    const col = langColumn(i18n.language);
    const val = row[col] ?? row.value_en ?? row.value_pt;
    if (val) return interpolate(val, vars);
  }
  return t(key, vars as never) as unknown as string;
}
