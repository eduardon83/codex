import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, Check, Plus, Search, X, Loader2, Globe, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { searchBooksByQuery, type BookResult, fetchBookByISBN } from '@/lib/isbn';

const TEACHER_ROLES = new Set(['teacher', 'school_admin', 'entity', 'global_admin', 'admin']);

export interface ReadingListDetailRow {
  id: string;
  reading_list_id: string;
  title: string;
  author: string | null;
  isbn: string | null;
  cover_url: string | null;
  book_id?: string | null;
  external_title?: string | null;
  external_author?: string | null;
  external_cover_url?: string | null;
}

export interface ReadingListSummary {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  creator_name?: string | null;
  is_official?: boolean;
}

interface Props {
  list: ReadingListSummary;
  subscribed?: boolean;
  onBack: () => void;
  onCreatePlan?: () => void;
}

interface LibraryBook {
  id: string;
  title: string;
  author: string | null;
  isbn: string | null;
  cover_url: string | null;
  reading_status: string;
  library_id: string;
  library_name?: string;
}

export default function ReadingListDetail({ list, subscribed, onBack, onCreatePlan }: Props) {
  const { user } = useAuth();
  const { hasAnyProRole } = useUserRoles();
  const [books, setBooks] = useState<ReadingListDetailRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<string[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [subscriberPicker, setSubscriberPicker] = useState<ReadingListDetailRow | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [togglingPublic, setTogglingPublic] = useState(false);

  const isOwner = !!user && user.id === list.user_id;
  const isTeacher = useMemo(() => roles.some(r => TEACHER_ROLES.has(r)), [roles]);
  const canEdit = isOwner && !subscribed;
  const canShare = isOwner && hasAnyProRole;

  useEffect(() => {
    if (!list.id) return;
    supabase.from('reading_lists').select('is_public').eq('id', list.id).maybeSingle()
      .then(({ data }) => setIsPublic(!!(data as any)?.is_public));
  }, [list.id]);

  const togglePublic = async (next: boolean) => {
    setTogglingPublic(true);
    const { error } = await supabase.from('reading_lists').update({ is_public: next } as any).eq('id', list.id);
    setTogglingPublic(false);
    if (error) return toast.error(error.message);
    setIsPublic(next);
    toast.success(next ? 'Lista pública.' : 'Lista privada.');
  };

  const copyShareLink = async () => {
    const url = `${window.location.origin}/reading-list/${list.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copiado.');
    } catch {
      toast.error('Não foi possível copiar.');
    }
  };

  const loadBooks = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('reading_list_books')
      .select('*')
      .eq('reading_list_id', list.id)
      .order('created_at');
    setBooks((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { loadBooks(); }, [list.id]);

  useEffect(() => {
    if (!user) return;
    supabase.from('user_roles' as any).select('role').eq('user_id', user.id).then(({ data }) => {
      setRoles(((data as any[]) || []).map(r => r.role));
    });
  }, [user]);

  const removeBook = async () => {
    if (!removeId) return;
    const { error } = await supabase.from('reading_list_books').delete().eq('id', removeId);
    setRemoveId(null);
    if (error) return toast.error(error.message);
    toast.success('Livro removido da lista.');
    loadBooks();
  };

  const displayTitle = (b: ReadingListDetailRow) => b.title || b.external_title || 'Sem título';
  const displayAuthor = (b: ReadingListDetailRow) => b.author || b.external_author || '';
  const displayCover = (b: ReadingListDetailRow) => b.cover_url || b.external_cover_url || null;
  const isExternal = (b: ReadingListDetailRow) => !b.book_id && (!!b.external_title || (!!b.isbn && !b.cover_url));

  const addToWishlistFromExternal = async (b: ReadingListDetailRow) => {
    if (!user) return;
    const { data: lib } = await supabase.from('libraries').select('id').eq('user_id', user.id).limit(1).maybeSingle();
    if (!lib) return toast.error('Não tens uma biblioteca.');
    let payload: any = {
      library_id: lib.id,
      user_id: user.id,
      title: displayTitle(b),
      author: displayAuthor(b) || null,
      isbn: b.isbn,
      cover_url: displayCover(b),
      is_wishlist: true,
    };
    if (b.isbn) {
      const fetched = await fetchBookByISBN(b.isbn);
      if (fetched) {
        payload = {
          ...payload,
          title: fetched.title || payload.title,
          author: fetched.author || payload.author,
          cover_url: fetched.cover_url || payload.cover_url,
          publisher: fetched.publisher || null,
          publish_date: fetched.publish_date || null,
          page_count: fetched.page_count,
          language: fetched.language || null,
          genre: fetched.genre || null,
        };
      }
    }
    const { error } = await supabase.from('books').insert(payload);
    if (error) return toast.error(error.message);
    setSubscriberPicker(null);
    toast.success('Adicionado à wishlist.');
  };

  const addToPlanFromSubscribed = async () => {
    if (!user) return;
    const { data } = await supabase.from('reading_plans' as any).select('id').eq('user_id', user.id).eq('status', 'active').maybeSingle();
    setSubscriberPicker(null);
    if (!data) {
      toast('Não tens um plano de leitura activo.', {
        action: onCreatePlan ? { label: 'Criar plano', onClick: onCreatePlan } : undefined,
      });
      return;
    }
    toast.info('Abre a tua biblioteca para escolher o mês ao adicionar ao plano.');
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={15} /> Voltar
      </button>

      <header className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-serif text-2xl text-foreground" style={{ fontFamily: '"Cormorant Garamond", serif' }}>{list.name}</h1>
          {canShare && (
            <div className="flex items-center gap-2 shrink-0">
              <Globe size={14} className="text-muted-foreground" />
              <Switch checked={isPublic} disabled={togglingPublic} onCheckedChange={togglePublic} aria-label="Tornar lista pública" />
              {isPublic && (
                <button
                  onClick={copyShareLink}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label="Copiar link da lista"
                  title="Copiar link"
                >
                  <Link2 size={16} />
                </button>
              )}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {books.length} {books.length === 1 ? 'livro' : 'livros'} · criada {new Date(list.created_at).toLocaleDateString('pt-PT')}
        </p>
        {subscribed && (
          <p className="text-xs text-muted-foreground italic">
            Lista criada por {list.creator_name || 'outro utilizador'} · Só de leitura
          </p>
        )}
      </header>

      {loading ? (
        <div className="py-10 text-center text-sm text-muted-foreground"><Loader2 size={18} className="animate-spin inline mr-2" />A carregar…</div>
      ) : books.length === 0 ? (
        <div className="text-center py-12 border border-border rounded-md">
          <BookOpen size={32} strokeWidth={1} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground mb-4">Esta lista ainda não tem livros. Adiciona o primeiro!</p>
          {canEdit && (
            <Button onClick={() => setAddOpen(true)}><Plus size={14} className="mr-1" />Adicionar livro</Button>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {books.map(b => {
            const cover = displayCover(b);
            const ext = isExternal(b);
            return (
              <li key={b.id} className="flex items-center gap-3 py-3">
                {cover ? (
                  <img src={cover} alt="" className="w-10 h-14 object-cover rounded-sm flex-shrink-0" />
                ) : (
                  <div className="w-10 h-14 bg-secondary rounded-sm flex items-center justify-center flex-shrink-0">
                    <BookOpen size={16} strokeWidth={1} className="text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{displayTitle(b)}</p>
                  <p className="text-xs text-muted-foreground truncate">{displayAuthor(b)}</p>
                  {ext && <Badge variant="outline" className="mt-1 text-[10px] px-1.5 py-0 h-4">Livro externo</Badge>}
                </div>
                {subscribed ? (
                  <button
                    onClick={() => setSubscriberPicker(b)}
                    aria-label={`Adicionar ${displayTitle(b)} à minha biblioteca ou plano`}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    <Plus size={16} />
                  </button>
                ) : canEdit ? (
                  <button
                    onClick={() => setRemoveId(b.id)}
                    aria-label={`Remover ${displayTitle(b)} da lista`}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  >
                    <X size={16} />
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {canEdit && books.length > 0 && (
        <Button onClick={() => setAddOpen(true)} className="w-full" variant="outline">
          <Plus size={14} className="mr-1" />Adicionar livro
        </Button>
      )}

      {addOpen && canEdit && (
        <AddBookSheet
          open={addOpen}
          onOpenChange={setAddOpen}
          listId={list.id}
          isTeacher={isTeacher}
          existing={books}
          onAdded={loadBooks}
        />
      )}

      <AlertDialog open={!!removeId} onOpenChange={() => setRemoveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover livro?</AlertDialogTitle>
            <AlertDialogDescription>O livro será removido desta lista.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={removeBook}>Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {subscriberPicker && (
        <Sheet open={!!subscriberPicker} onOpenChange={() => setSubscriberPicker(null)}>
          <SheetContent side="bottom" className="rounded-t-2xl">
            <SheetHeader><SheetTitle className="font-serif">{displayTitle(subscriberPicker)}</SheetTitle></SheetHeader>
            <div className="mt-5 space-y-2">
              <Button className="w-full" onClick={() => addToWishlistFromExternal(subscriberPicker)}>
                Adicionar à wishlist
              </Button>
              <Button variant="outline" className="w-full" onClick={addToPlanFromSubscribed}>
                Adicionar ao plano
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}

// ─── Add book sheet ─────────────────────────────────────────

function AddBookSheet({
  open, onOpenChange, listId, isTeacher, existing, onAdded,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  listId: string;
  isTeacher: boolean;
  existing: ReadingListDetailRow[];
  onAdded: () => void;
}) {
  const { user } = useAuth();
  const [tab, setTab] = useState<'library' | 'external'>(isTeacher ? 'external' : 'library');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
        <SheetHeader className="flex-row items-center justify-between space-y-0">
          <SheetTitle className="font-serif">Adicionar livro</SheetTitle>
          <button onClick={() => onOpenChange(false)} className="text-sm text-muted-foreground hover:text-foreground" aria-label="Fechar">
            Fechar
          </button>
        </SheetHeader>

        {isTeacher ? (
          <Tabs value={tab} onValueChange={v => setTab(v as any)} className="mt-4">
            <TabsList className="w-full rounded-full">
              <TabsTrigger value="external" className="flex-1 rounded-full">Pesquisar livro</TabsTrigger>
              <TabsTrigger value="library" className="flex-1 rounded-full">Da minha biblioteca</TabsTrigger>
            </TabsList>
            <TabsContent value="external" className="mt-4">
              <ExternalSearchTab listId={listId} existing={existing} onAdded={onAdded} />
            </TabsContent>
            <TabsContent value="library" className="mt-4">
              <LibraryTab userId={user?.id || ''} listId={listId} existing={existing} onAdded={onAdded} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="mt-4">
            <LibraryTab userId={user?.id || ''} listId={listId} existing={existing} onAdded={onAdded} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ─── Tab A: User library ────────────────────────────────────

const STATUS_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'Currently Reading', label: 'A ler' },
  { value: 'Read', label: 'Lidos' },
  { value: 'Unread', label: 'Não lidos' },
];

function LibraryTab({ userId, listId, existing, onAdded }: {
  userId: string; listId: string; existing: ReadingListDetailRow[]; onAdded: () => void;
}) {
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    supabase
      .from('books')
      .select('id,title,author,isbn,cover_url,reading_status,library_id,libraries(name)')
      .eq('user_id', userId)
      .eq('is_wishlist', false)
      .order('title')
      .then(({ data }) => {
        const mapped: LibraryBook[] = ((data as any[]) || []).map(b => ({
          id: b.id,
          title: b.title,
          author: b.author,
          isbn: b.isbn,
          cover_url: b.cover_url,
          reading_status: b.reading_status || 'Unread',
          library_id: b.library_id,
          library_name: b.libraries?.name,
        }));
        setBooks(mapped);
        setLoading(false);
      });
    setAddedIds(new Set(existing.map(e => e.book_id).filter(Boolean) as string[]));
  }, [userId, existing]);

  const filtered = useMemo(() => {
    return books.filter(b => {
      if (statusFilter !== 'all' && b.reading_status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!b.title.toLowerCase().includes(q) && !(b.author?.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [books, search, statusFilter]);

  const addBook = async (b: LibraryBook) => {
    setAdding(b.id);
    const { error } = await supabase.from('reading_list_books').insert({
      reading_list_id: listId,
      book_id: b.id,
      title: b.title,
      author: b.author,
      isbn: b.isbn,
      cover_url: b.cover_url,
    } as any);
    setAdding(null);
    if (error) return toast.error(error.message);
    setAddedIds(prev => new Set(prev).add(b.id));
    onAdded();
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="Pesquisar nos meus livros"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Pesquisar nos meus livros"
          className="pl-9"
        />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs transition-colors ${
              statusFilter === f.value
                ? 'bg-foreground text-background border-foreground'
                : 'bg-background text-foreground border-border hover:border-foreground'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-muted-foreground"><Loader2 size={16} className="animate-spin inline mr-2" />A carregar livros…</div>
      ) : filtered.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          {books.length === 0 ? 'A tua biblioteca está vazia.' : 'Nenhum livro encontrado.'}
        </p>
      ) : (
        <ul className="divide-y divide-border max-h-96 overflow-y-auto">
          {filtered.map(b => {
            const already = addedIds.has(b.id);
            return (
              <li key={b.id} className="flex items-center gap-3 py-2.5">
                {b.cover_url ? (
                  <img src={b.cover_url} alt="" className="w-10 h-14 object-cover rounded-sm flex-shrink-0" />
                ) : (
                  <div className="w-10 h-14 bg-secondary rounded-sm flex items-center justify-center flex-shrink-0">
                    <BookOpen size={14} strokeWidth={1} className="text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{b.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{b.author}</p>
                  {b.library_name && (
                    <span className="inline-block mt-0.5 text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0">
                      {b.library_name}
                    </span>
                  )}
                </div>
                {already ? (
                  <span className="text-emerald-600 p-1" aria-label="Já na lista"><Check size={18} /></span>
                ) : (
                  <button
                    onClick={() => addBook(b)}
                    disabled={adding === b.id}
                    aria-label={`Adicionar ${b.title}`}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1 disabled:opacity-50"
                  >
                    {adding === b.id ? <Loader2 size={16} className="animate-spin" /> : <Plus size={18} />}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ─── Tab B: External search ─────────────────────────────────

function ExternalSearchTab({ listId, existing, onAdded }: {
  listId: string; existing: ReadingListDetailRow[]; onAdded: () => void;
}) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BookResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [addedIsbns, setAddedIsbns] = useState<Set<string>>(new Set(existing.map(e => e.isbn).filter(Boolean) as string[]));

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) { setResults([]); return; }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      const r = await searchBooksByQuery(q);
      if (!cancelled) { setResults(r); setLoading(false); }
    }, 350);
    return () => { cancelled = true; clearTimeout(t); setLoading(false); };
  }, [query]);

  const addExternal = async (r: BookResult) => {
    if (!user) return;
    setAdding(r.isbn);
    // Enrich book_cache so future users benefit
    try {
      await supabase.from('book_cache').upsert({
        isbn: r.isbn,
        title: r.title,
        author: r.author || null,
        publisher: r.publisher,
        year: r.year,
        cover_url: r.cover_url,
        language: r.language,
        contributed_by_user_id: user.id,
      }, { onConflict: 'isbn' });
    } catch { /* non-fatal */ }

    const { error } = await supabase.from('reading_list_books').insert({
      reading_list_id: listId,
      title: r.title,
      author: r.author,
      isbn: r.isbn,
      cover_url: r.cover_url,
      external_title: r.title,
      external_author: r.author,
      external_cover_url: r.cover_url,
      publisher: r.publisher,
      publish_date: r.year,
      language: r.language,
    } as any);
    setAdding(null);
    if (error) return toast.error(error.message);
    setAddedIsbns(prev => new Set(prev).add(r.isbn));
    onAdded();
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="Pesquisar livro por título, autor ou ISBN"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Título, autor ou ISBN"
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-muted-foreground"><Loader2 size={16} className="animate-spin inline mr-2" />A pesquisar…</div>
      ) : query.trim().length < 3 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">Escreve pelo menos 3 caracteres para pesquisar.</p>
      ) : results.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Nenhum resultado encontrado.</p>
      ) : (
        <ul className="divide-y divide-border max-h-96 overflow-y-auto">
          {results.map(r => {
            const already = addedIsbns.has(r.isbn);
            return (
              <li key={r.isbn} className="flex items-center gap-3 py-2.5">
                {r.cover_url ? (
                  <img src={r.cover_url} alt="" className="w-10 h-14 object-cover rounded-sm flex-shrink-0" />
                ) : (
                  <div className="w-10 h-14 bg-secondary rounded-sm flex items-center justify-center flex-shrink-0">
                    <BookOpen size={14} strokeWidth={1} className="text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{r.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {[r.author, r.year].filter(Boolean).join(' · ')}
                  </p>
                  <span className="inline-block mt-0.5 text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0">
                    ISBN {r.isbn}
                  </span>
                </div>
                {already ? (
                  <span className="text-emerald-600 p-1" aria-label="Já na lista"><Check size={18} /></span>
                ) : (
                  <button
                    onClick={() => addExternal(r)}
                    disabled={adding === r.isbn}
                    aria-label={`Adicionar ${r.title}`}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1 disabled:opacity-50"
                  >
                    {adding === r.isbn ? <Loader2 size={16} className="animate-spin" /> : <Plus size={18} />}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
