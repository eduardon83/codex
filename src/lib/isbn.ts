import { supabase } from '@/integrations/supabase/client';

export interface BookData {
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  publish_date: string;
  cover_url: string;
  page_count: number | null;
  language: string;
  genre: string;
  source?: string; // which source provided the data
}

/** Returns true if this ISBN belongs to a Portuguese publisher (978-989 or 978-972) */
export function isPortugueseISBN(isbn: string): boolean {
  const clean = isbn.replace(/[-\s]/g, '');
  return clean.startsWith('978989') || clean.startsWith('978972');
}

// ─── Source 1: Open Library ISBN endpoint ───
async function tryOpenLibraryDirect(isbn: string): Promise<BookData | null> {
  try {
    const res = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
    if (!res.ok) return null;
    const data = await res.json();
    let authorName = '';
    if (data.authors?.length > 0) {
      try {
        const authorRes = await fetch(`https://openlibrary.org${data.authors[0].key}.json`);
        if (authorRes.ok) {
          const authorData = await authorRes.json();
          authorName = authorData.name || '';
        }
      } catch { /* skip */ }
    }
    const coverId = data.covers?.[0];
    const coverUrl = coverId
      ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
      : `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
    return {
      title: data.title || '',
      author: authorName,
      isbn,
      publisher: Array.isArray(data.publishers) ? data.publishers[0] || '' : '',
      publish_date: data.publish_date || '',
      cover_url: coverUrl,
      page_count: data.number_of_pages || null,
      language: Array.isArray(data.languages) ? data.languages[0]?.key?.replace('/languages/', '') || '' : '',
      genre: Array.isArray(data.subjects) ? data.subjects[0] || '' : '',
      source: 'Open Library',
    };
  } catch {
    return null;
  }
}

// ─── Source 2: Open Library Search endpoint ───
async function tryOpenLibrarySearch(isbn: string): Promise<BookData | null> {
  try {
    const res = await fetch(`https://openlibrary.org/search.json?isbn=${isbn}&limit=1`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.docs?.length) return null;
    const doc = data.docs[0];
    const coverId = doc.cover_i;
    return {
      title: doc.title || '',
      author: doc.author_name?.join(', ') || '',
      isbn,
      publisher: doc.publisher?.[0] || '',
      publish_date: doc.first_publish_year?.toString() || '',
      cover_url: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : '',
      page_count: doc.number_of_pages_median || null,
      language: doc.language?.[0] || '',
      genre: doc.subject?.[0] || '',
      source: 'Open Library',
    };
  } catch {
    return null;
  }
}

// ─── Source 3: Google Books API ───
async function tryGoogleBooks(isbn: string): Promise<BookData | null> {
  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.totalItems || !data.items?.length) return null;
    const vol = data.items[0].volumeInfo;
    return {
      title: vol.title || '',
      author: vol.authors?.join(', ') || '',
      isbn,
      publisher: vol.publisher || '',
      publish_date: vol.publishedDate || '',
      cover_url: vol.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
      page_count: vol.pageCount || null,
      language: vol.language || '',
      genre: vol.categories?.[0] || '',
      source: 'Google Books',
    };
  } catch {
    return null;
  }
}

// ─── Source 4: Bibliotheca Community Cache ───
async function tryCommunityCache(isbn: string): Promise<BookData | null> {
  try {
    const clean = isbn.replace(/[-\s]/g, '');
    const { data } = await supabase
      .from('book_cache')
      .select('*')
      .or(`isbn.eq.${isbn},isbn.eq.${clean}`)
      .limit(1)
      .maybeSingle();
    if (!data) return null;
    return {
      title: data.title,
      author: data.author || '',
      isbn,
      publisher: data.publisher || '',
      publish_date: data.year || '',
      cover_url: data.cover_url || '',
      page_count: data.pages || null,
      language: data.language || '',
      genre: data.genre || '',
      source: 'community',
    };
  } catch {
    return null;
  }
}

// ─── Helper: strip HTML tags + decode common entities ───
function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

async function tryServerScrape(isbn: string, source: 'isbnsearch' | 'isbndb' | 'bookfinder'): Promise<BookData | null> {
  try {
    const { data, error } = await supabase.functions.invoke('lookup-isbn-metadata', {
      body: { isbn, source },
    });
    if (error) return null;
    return (data?.book as BookData | null) || null;
  } catch {
    return null;
  }
}

// ─── Source 5: ISBNsearch.org scrape via backend ───
const tryISBNSearch = (isbn: string) => tryServerScrape(isbn, 'isbnsearch');

// ─── Source 6: ISBNdb.com scrape via backend ───
const tryISBNdb = (isbn: string) => tryServerScrape(isbn, 'isbndb');

// ─── Source 7: BookFinder.com scrape via backend ───
const tryBookFinder = (isbn: string) => tryServerScrape(isbn, 'bookfinder');

/**
 * Multi-source ISBN lookup with Portuguese ISBN optimization and community cache.
 * Returns book data and the source name, or null if not found anywhere.
 */
export async function fetchBookByISBN(isbn: string): Promise<BookData | null> {
  const portugueseISBN = isPortugueseISBN(isbn);

  if (portugueseISBN) {
    // Portuguese ISBNs: skip international APIs, go straight to cache then scrape
    console.log('[ISBN] Portuguese ISBN detected — skipping international APIs');
    const cached = await tryCommunityCache(isbn);
    if (cached) return cached;

    const scraped = await tryISBNSearch(isbn);
    if (scraped) return scraped;

    const isbndb = await tryISBNdb(isbn);
    if (isbndb) return isbndb;

    const bf = await tryBookFinder(isbn);
    if (bf) return bf;

    // As a last resort, try Open Library search (sometimes has Portuguese editions)
    const olSearch = await tryOpenLibrarySearch(isbn);
    if (olSearch) return olSearch;

    return null;
  }

  // Standard fallback chain for non-Portuguese ISBNs
  const ol = await tryOpenLibraryDirect(isbn);
  if (ol) return ol;

  const olSearch = await tryOpenLibrarySearch(isbn);
  if (olSearch) return olSearch;

  const google = await tryGoogleBooks(isbn);
  if (google) return google;

  const cached = await tryCommunityCache(isbn);
  if (cached) return cached;

  const scraped = await tryISBNSearch(isbn);
  if (scraped) return scraped;

  const isbndb = await tryISBNdb(isbn);
  if (isbndb) return isbndb;

  const bf = await tryBookFinder(isbn);
  if (bf) return bf;

  return null;
}

/**
 * Save book data to community cache so future users can find it.
 */
export async function saveToBookCache(
  isbn: string,
  data: {
    title: string;
    author?: string;
    publisher?: string;
    year?: string;
    language?: string;
    pages?: number | null;
    cover_url?: string;
    genre?: string;
    format?: string;
  },
  userId: string
): Promise<void> {
  if (!isbn.trim()) return;
  const clean = isbn.replace(/[-\s]/g, '');
  try {
    await supabase.from('book_cache').upsert(
      {
        isbn: clean,
        title: data.title,
        author: data.author || null,
        publisher: data.publisher || null,
        year: data.year || null,
        language: data.language || null,
        pages: data.pages || null,
        cover_url: data.cover_url || null,
        genre: data.genre || null,
        format: data.format || null,
        contributed_by_user_id: userId,
      },
      { onConflict: 'isbn' }
    );
  } catch (e) {
    console.warn('Failed to save to book cache', e);
  }
}

// ─────────────────────────────────────────────────────────────
// Multi-source title/author search
// ─────────────────────────────────────────────────────────────

export interface BookResult {
  title: string;
  author: string;
  isbn: string; // mandatory
  cover_url: string | null;
  year: string | null;
  publisher: string | null;
  language: string | null;
  source?: 'openlibrary' | 'googlebooks' | 'community';
}

function pickIsbn(arr: any): string | null {
  if (!Array.isArray(arr)) return null;
  // Prefer 13-digit ISBN
  const thirteen = arr.find((s: any) => typeof s === 'string' && s.replace(/[-\s]/g, '').length === 13);
  if (thirteen) return String(thirteen).replace(/[-\s]/g, '');
  const ten = arr.find((s: any) => typeof s === 'string' && s.replace(/[-\s]/g, '').length === 10);
  if (ten) return String(ten).replace(/[-\s]/g, '');
  return null;
}

async function searchOpenLibrary(query: string): Promise<BookResult[]> {
  try {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=12&fields=title,author_name,isbn,cover_i,first_publish_year,publisher,language`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const docs: any[] = data.docs || [];
    return docs
      .map((d) => {
        const isbn = pickIsbn(d.isbn);
        if (!isbn) return null;
        const coverId = d.cover_i;
        return {
          title: d.title || '',
          author: Array.isArray(d.author_name) ? d.author_name.join(', ') : '',
          isbn,
          cover_url: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : null,
          year: d.first_publish_year ? String(d.first_publish_year) : null,
          publisher: Array.isArray(d.publisher) ? d.publisher[0] : null,
          language: Array.isArray(d.language) ? d.language[0] : null,
          source: 'openlibrary' as const,
        };
      })
      .filter((b) => b !== null) as BookResult[];
  } catch {
    return [];
  }
}

async function searchGoogleBooks(query: string): Promise<BookResult[]> {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=12&langRestrict=pt`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const items: any[] = data.items || [];
    return items
      .map((it) => {
        const v = it.volumeInfo || {};
        const ids: any[] = v.industryIdentifiers || [];
        const isbn13 = ids.find((i) => i.type === 'ISBN_13')?.identifier;
        const isbn10 = ids.find((i) => i.type === 'ISBN_10')?.identifier;
        const isbn = (isbn13 || isbn10 || '').replace(/[-\s]/g, '');
        if (!isbn) return null;
        return {
          title: v.title || '',
          author: Array.isArray(v.authors) ? v.authors.join(', ') : '',
          isbn,
          cover_url: v.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
          year: v.publishedDate ? v.publishedDate.split('-')[0] : null,
          publisher: v.publisher || null,
          language: v.language || null,
          source: 'googlebooks' as const,
        };
      })
      .filter((b) => b !== null) as BookResult[];
  } catch {
    return [];
  }
}

async function searchCommunityCache(query: string): Promise<BookResult[]> {
  try {
    const q = query.replace(/[%_]/g, '\\$&');
    const { data } = await supabase
      .from('book_cache')
      .select('*')
      .or(`title.ilike.%${q}%,author.ilike.%${q}%`)
      .limit(12);
    if (!data) return [];
    return data
      .filter((d: any) => !!d.isbn)
      .map((d: any) => ({
        title: d.title,
        author: d.author || '',
        isbn: String(d.isbn).replace(/[-\s]/g, ''),
        cover_url: d.cover_url || null,
        year: d.year || null,
        publisher: d.publisher || null,
        language: d.language || null,
        source: 'community' as const,
      }));
  } catch {
    return [];
  }
}

/**
 * Search books by free-text query (title or author) across multiple sources.
 * Results are deduplicated by ISBN. Books without an ISBN are discarded.
 */
export async function searchBooksByQuery(query: string): Promise<BookResult[]> {
  const q = query.trim();
  if (q.length < 3) return [];

  const [ol, gb, cache] = await Promise.all([
    searchOpenLibrary(q),
    searchGoogleBooks(q),
    searchCommunityCache(q),
  ]);

  // Merge with priority: community > openlibrary > googlebooks (community first so it wins on dedupe)
  // Spec: prefer Open Library; community badge for cached. We'll surface community separately but
  // dedupe by ISBN preferring openlibrary, then community, then googlebooks; fill missing fields.
  const byIsbn = new Map<string, BookResult>();

  const merge = (existing: BookResult, incoming: BookResult): BookResult => ({
    ...incoming,
    ...existing,
    title: existing.title || incoming.title,
    author: existing.author || incoming.author,
    cover_url: existing.cover_url || incoming.cover_url,
    year: existing.year || incoming.year,
    publisher: existing.publisher || incoming.publisher,
    language: existing.language || incoming.language,
    source: existing.source,
  });

  // Add OL first (highest priority for source label)
  for (const b of ol) {
    byIsbn.set(b.isbn, b);
  }
  // Then community (keeps OL data, but adds new books with community badge)
  for (const b of cache) {
    const existing = byIsbn.get(b.isbn);
    if (existing) byIsbn.set(b.isbn, merge(existing, b));
    else byIsbn.set(b.isbn, b);
  }
  // Then Google (fills gaps)
  for (const b of gb) {
    const existing = byIsbn.get(b.isbn);
    if (existing) byIsbn.set(b.isbn, merge(existing, b));
    else byIsbn.set(b.isbn, b);
  }

  return Array.from(byIsbn.values());
}

