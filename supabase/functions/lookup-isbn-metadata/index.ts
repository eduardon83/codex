import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://esm.sh/zod@3.25.76'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BodySchema = z.object({
  isbn: z.string().min(6).max(32),
  source: z.enum(['isbnsearch', 'isbndb', 'bookfinder']).optional(),
})

interface BookData {
  title: string
  author: string
  isbn: string
  publisher: string
  publish_date: string
  cover_url: string
  page_count: number | null
  language: string
  genre: string
  source: string
}

function stripHtml(s: string): string {
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&rsquo;/gi, '’')
    .replace(/&ldquo;/gi, '“')
    .replace(/&rdquo;/gi, '”')
    .replace(/\s+/g, ' ')
    .trim()
}

async function fetchHtml(url: string): Promise<string | null> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; FoliumLibrary/1.0; +https://folium.kendirstudios.pt)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,pt;q=0.8',
    },
  })
  if (!response.ok) return null
  return await response.text()
}

function fieldFromStrong(html: string, label: string): string {
  const re = new RegExp(`<strong>\\s*${label}\\s*:?\\s*<\\/strong>\\s*([\\s\\S]*?)(?:<\\/p>|<br\\s*\\/?>|<\\/div>)`, 'i')
  const match = html.match(re)
  return match ? stripHtml(match[1]) : ''
}

async function tryISBNSearch(isbn: string): Promise<BookData | null> {
  const clean = isbn.replace(/[-\s]/g, '')
  const html = await fetchHtml(`https://isbnsearch.org/isbn/${encodeURIComponent(clean)}`)
  if (!html) return null

  const titleMatch = html.match(/<div[^>]+class=["']bookinfo["'][\s\S]*?<h1[^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  const title = titleMatch ? stripHtml(titleMatch[1]) : ''
  if (!title || /not found/i.test(title)) return null

  const coverMatch = html.match(/<div[^>]+class=["']image["'][\s\S]*?<img[^>]+src=["']([^"']+)["']/i)
  const pagesRaw = fieldFromStrong(html, 'Pages')
  const pages = pagesRaw ? parseInt(pagesRaw.replace(/[^0-9]/g, ''), 10) || null : null

  return {
    title,
    author: fieldFromStrong(html, 'Author') || fieldFromStrong(html, 'Authors'),
    isbn,
    publisher: fieldFromStrong(html, 'Publisher'),
    publish_date: fieldFromStrong(html, 'Published') || fieldFromStrong(html, 'Publication Date'),
    cover_url: coverMatch?.[1] || '',
    page_count: pages,
    language: fieldFromStrong(html, 'Language'),
    genre: fieldFromStrong(html, 'Subjects') || fieldFromStrong(html, 'Subject'),
    source: 'ISBNsearch.org',
  }
}

async function tryISBNdb(isbn: string): Promise<BookData | null> {
  const clean = isbn.replace(/[-\s]/g, '')
  const html = await fetchHtml(`https://isbndb.com/book/${encodeURIComponent(clean)}`)
  if (!html) return null

  const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  const title = titleMatch ? stripHtml(titleMatch[1]) : ''
  if (!title) return null

  const field = (label: string): string => {
    const patterns = [
      new RegExp(`<dt[^>]*>\\s*${label}\\s*:?\\s*<\\/dt>\\s*<dd[^>]*>([\\s\\S]*?)<\\/dd>`, 'i'),
      new RegExp(`<(?:th|td|strong|b)[^>]*>\\s*${label}\\s*:?\\s*<\\/(?:th|td|strong|b)>\\s*<(?:td|dd|span|div)[^>]*>([\\s\\S]*?)<\\/(?:td|dd|span|div)>`, 'i'),
      new RegExp(`<strong>\\s*${label}\\s*:?\\s*<\\/strong>\\s*([\\s\\S]*?)(?:<br|<\\/p>|<\\/div>)`, 'i'),
    ]
    for (const re of patterns) {
      const match = html.match(re)
      if (match) return stripHtml(match[1])
    }
    return ''
  }

  const coverMatch = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*(?:alt=["'][^"']*(?:cover|book)[^"']*["'])?/i)
  const pagesRaw = field('Pages')
  const pages = pagesRaw ? parseInt(pagesRaw.replace(/[^0-9]/g, ''), 10) || null : null

  return {
    title,
    author: field('Author') || field('Authors'),
    isbn,
    publisher: field('Publisher'),
    publish_date: field('Published') || field('Publish Date') || field('Date Published'),
    cover_url: coverMatch?.[1] || '',
    page_count: pages,
    language: field('Language'),
    genre: field('Subjects') || field('Subject'),
    source: 'ISBNdb',
  }
}

async function tryBookFinder(isbn: string): Promise<BookData | null> {
  const clean = isbn.replace(/[-\s]/g, '')
  const html = await fetchHtml(`https://www.bookfinder.com/search/?keywords=${encodeURIComponent(clean)}&currency=USD&destination=us&mode=basic&il=en&classic=off&lang=en&st=sh&ac=qr&submit=`)
  if (!html) return null

  const field = (label: string): string => {
    const re = new RegExp(`<(?:td|th|strong|b|span)[^>]*>\\s*${label}\\s*:?\\s*<\\/(?:td|th|strong|b|span)>\\s*<(?:td|span|div)[^>]*>([\\s\\S]*?)<\\/(?:td|span|div)>`, 'i')
    const match = html.match(re)
    return match ? stripHtml(match[1]) : ''
  }

  let title = field('Title')
  if (!title) {
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
    title = h1 ? stripHtml(h1[1]) : ''
  }
  if (!title) return null

  return {
    title,
    author: field('Author') || field('Author(s)') || field('Authors'),
    isbn,
    publisher: field('Publisher'),
    publish_date: field('Published') || field('Publication date') || field('Year'),
    cover_url: '',
    page_count: null,
    language: '',
    genre: '',
    source: 'BookFinder',
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const parsed = BodySchema.safeParse(await req.json())
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } })
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { isbn, source } = parsed.data
    const lookupSources = source ? [source] : ['isbnsearch', 'isbndb', 'bookfinder'] as const
    for (const lookupSource of lookupSources) {
      const result = lookupSource === 'isbnsearch'
        ? await tryISBNSearch(isbn)
        : lookupSource === 'isbndb'
          ? await tryISBNdb(isbn)
          : await tryBookFinder(isbn)
      if (result) {
        return new Response(JSON.stringify({ book: result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    return new Response(JSON.stringify({ book: null }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('lookup-isbn-metadata error', error)
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
