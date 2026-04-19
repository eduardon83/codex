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

// ─── Source 5: ISBNsearch.org scrape ───
async function tryISBNSearch(isbn: string): Promise<BookData | null> {
  try {
    const res = await fetch(`https://isbnsearch.org/isbn/${isbn}`);
    if (!res.ok) return null;
    const html = await res.text();

    const extract = (label: string): string => {
      const regex = new RegExp(`<strong>${label}:</strong>\\s*</p>\\s*<p>([^<]+)</p>`, 'i');
      const altRegex = new RegExp(`<strong>${label}:</strong>\\s*([^<]+)`, 'i');
      const match = html.match(regex) || html.match(altRegex);
      return match?.[1]?.trim() || '';
    };

    // Try extracting from bookinfo div
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
    const title = titleMatch?.[1]?.trim() || extract('Title');
    if (!title) return null;

    return {
      title,
      author: extract('Author') || extract('Authors'),
      isbn,
      publisher: extract('Publisher'),
      publish_date: extract('Published') || extract('Year'),
      cover_url: '',
      page_count: null,
      language: extract('Language'),
      genre: '',
      source: 'ISBNsearch.org',
    };
  } catch {
    return null;
  }
}

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
