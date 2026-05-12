import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, Loader2, MapPin, ExternalLink, Heart, BookmarkPlus, ArrowLeft, Library as LibraryIcon, Users } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import HelpButton from '@/components/tutorial/HelpButton';
import OwlLoader from '@/components/OwlLoader';
import { resolveAvatarSrc } from '@/lib/avatars';
import { toast } from 'sonner';
import LoanRequestSheet, { LoanRequestBook } from '@/components/loans/LoanRequestSheet';

type ProcurarTab = 'books' | 'libraries' | 'listsPlans' | 'publicLibraries';
type ListsPlansFilter = 'lists' | 'plans';

interface AvailRow {
  id: string;
  book_id: string;
  owner_user_id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  isbn: string | null;
}
interface OwnerInfo { username: string | null; first_name: string | null; avatar_url: string | null; }
interface PublicLibraryRow { id: string; name: string; user_id: string; book_count: number; owner_username: string | null; }
interface PublishedItem {
  kind: 'list' | 'plan';
  id: string;
  name: string;
  user_id: string;
  creator_username: string | null;
  creator_role: string | null; // 'bookstore' | 'author' | 'influencer' | other
  item_count: number;
  subscriber_count: number;
  subscribed: boolean;
}
interface OSMLibrary { id: number; name: string; address: string | null; distance: number; openingHours: string | null; website: string | null; }

interface Props {
  onGoToProfile?: () => void;
  onOpenLibrary?: (lib: { libraryId: string; libraryName: string; ownerUserId: string; ownerUsername: string | null }) => void;
  onGoToLists?: (sub?: 'planos' | 'listas') => void;
}

const TAB_STORAGE_KEY = 'codex_procurar_tab';

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function ProcurarLivroScreen({ onGoToProfile, onOpenLibrary, onGoToLists }: Props) {
  const { t } = useTranslation();
  const { user, profile } = useAuth();

  const [tab, setTab] = useState<ProcurarTab>(() => {
    const saved = localStorage.getItem(TAB_STORAGE_KEY) as ProcurarTab | null;
    return saved === 'books' || saved === 'libraries' || saved === 'listsPlans' || saved === 'publicLibraries' ? saved : 'books';
  });

  useEffect(() => { localStorage.setItem(TAB_STORAGE_KEY, tab); }, [tab]);

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-foreground" style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: '1.75rem' }}>{t('search.title')}</h1>
        <HelpButton screen="discover" />
      </div>

      <Tabs value={tab} onValueChange={(value) => setTab(value as ProcurarTab)}>
        <TabsList data-tutorial="procurar-tabs" className="w-full rounded-full grid grid-cols-4 h-auto">
          <TabsTrigger value="books" className="rounded-full text-xs px-2">{t('search.tabs.books')}</TabsTrigger>
          <TabsTrigger value="libraries" className="rounded-full text-xs px-2">{t('search.tabs.libraries')}</TabsTrigger>
          <TabsTrigger value="listsPlans" className="rounded-full text-xs px-2">{t('search.tabs.listsPlans')}</TabsTrigger>
          <TabsTrigger value="publicLibraries" className="rounded-full text-xs px-2">{t('search.tabs.publicLibraries')}</TabsTrigger>
        </TabsList>

        <TabsContent value="books" className="space-y-4 mt-4">
          <BooksTab userId={user?.id ?? null} />
        </TabsContent>

        <TabsContent value="libraries" className="space-y-4 mt-4">
          <PublicUserLibrariesTab userId={user?.id ?? null} onOpenLibrary={onOpenLibrary} />
        </TabsContent>

        <TabsContent value="listsPlans" className="space-y-4 mt-4">
          <ListsAndPlansTab userId={user?.id ?? null} onGoToLists={onGoToLists} />
        </TabsContent>

        <TabsContent value="publicLibraries" className="mt-4">
          <PublicLibrariesTab profile={profile} onGoToProfile={onGoToProfile} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------------- Tab 1: Books available for loan (national) ---------------- */

function BooksTab({ userId }: { userId: string | null }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AvailRow[]>([]);
  const [owners, setOwners] = useState<Record<string, OwnerInfo>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const timer = setTimeout(async () => {
      let q = supabase
        .from('book_availability' as any)
        .select('id, book_id, owner_user_id, title, author, cover_url, isbn')
        .eq('is_available', true)
        .limit(60);
      if (userId) q = q.neq('owner_user_id', userId);
      const term = query.trim();
      if (term) q = q.or(`title.ilike.%${term}%,author.ilike.%${term}%,isbn.ilike.%${term}%`);

      const { data } = await q;
      if (!active) return;
      const rows = ((data || []) as unknown) as AvailRow[];
      setResults(rows);

      const ownerIds = Array.from(new Set(rows.map(r => r.owner_user_id)));
      if (ownerIds.length) {
        const { data: profs } = await supabase.from('public_profiles').select('user_id, username, first_name, avatar_url').in('user_id', ownerIds);
        const map: Record<string, OwnerInfo> = {};
        (profs || []).forEach((p: any) => { if (p.user_id) map[p.user_id] = { username: p.username, first_name: p.first_name, avatar_url: p.avatar_url }; });
        setOwners(map);
      } else {
        setOwners({});
      }
      setLoading(false);
    }, 200);
    return () => { active = false; clearTimeout(timer); };
  }, [userId, query]);

  const [loanBook, setLoanBook] = useState<LoanRequestBook | null>(null);
  const requestLoan = (book: AvailRow) => {
    setLoanBook({
      book_id: book.book_id,
      owner_user_id: book.owner_user_id,
      title: book.title,
      author: book.author,
      cover_url: book.cover_url,
      isbn: book.isbn,
    });
  };

  return (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search.books.placeholder')}
          aria-label={t('search.books.ariaLabel')}
          className="pl-9"
        />
      </div>
      {loading ? <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        : results.length === 0 ? <p className="text-sm text-muted-foreground text-center py-10">{t('search.books.empty')}</p>
        : (
          <div className="space-y-3">
            {results.map((r) => {
              const owner = owners[r.owner_user_id];
              const ownerLabel = owner?.username || owner?.first_name || t('search.books.userFallback');
              return (
                <div key={r.id} className="flex gap-3 p-3 border border-border rounded-md bg-card">
                  {r.cover_url
                    ? <img src={r.cover_url} alt={r.title} style={{ width: 52, height: 72 }} className="object-cover rounded shrink-0" />
                    : <div style={{ width: 52, height: 72 }} className="bg-secondary rounded flex items-center justify-center shrink-0"><BookOpen size={18} className="text-muted-foreground" /></div>}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-2">{r.title}</p>
                    {r.author && <p className="text-xs text-muted-foreground line-clamp-1">{r.author}</p>}
                    <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                      <img src={resolveAvatarSrc(owner?.avatar_url)} alt="" className="h-4 w-4 rounded-full border border-border object-cover" /> @{ownerLabel}
                    </p>
                    <Button size="sm" variant="outline" className="h-7 text-xs mt-2" onClick={() => requestLoan(r)}>
                      {t('search.books.requestLoan')}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </>
  );
}

/* ---------------- Tab 2: Other users' public libraries ---------------- */

function PublicUserLibrariesTab({ userId, onOpenLibrary }: { userId: string | null; onOpenLibrary?: (lib: { libraryId: string; libraryName: string; ownerUserId: string; ownerUsername: string | null }) => void }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [libs, setLibs] = useState<PublicLibraryRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const timer = setTimeout(async () => {
      let q = supabase
        .from('libraries')
        .select('id, name, user_id')
        .eq('is_public', true)
        .limit(60);
      if (userId) q = q.neq('user_id', userId);
      const term = query.trim();
      if (term) q = q.ilike('name', `%${term}%`);
      const { data } = await q;
      if (!active) return;
      const rows = (data || []) as { id: string; name: string; user_id: string }[];

      const ownerIds = Array.from(new Set(rows.map(r => r.user_id)));
      const profs = ownerIds.length
        ? (await supabase.from('public_profiles').select('user_id, username').in('user_id', ownerIds)).data ?? []
        : [];
      const usernameMap = new Map<string, string | null>();
      (profs as any[]).forEach((p) => usernameMap.set(p.user_id, p.username ?? null));

      const enriched = await Promise.all(rows.map(async (r) => {
        const { count } = await supabase.from('books').select('id', { count: 'exact', head: true }).eq('library_id', r.id);
        return { id: r.id, name: r.name, user_id: r.user_id, book_count: count || 0, owner_username: usernameMap.get(r.user_id) ?? null };
      }));
      setLibs(enriched);
      setLoading(false);
    }, 200);
    return () => { active = false; clearTimeout(timer); };
  }, [userId, query]);

  return (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search.libraries.placeholder')}
          aria-label={t('search.libraries.ariaLabel')}
          className="pl-9"
        />
      </div>
      {loading ? <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        : libs.length === 0 ? <p className="text-sm text-muted-foreground text-center py-10">{t('search.libraries.empty')}</p>
        : (
          <div className="space-y-3">
            {libs.map((lib) => (
              <div key={lib.id} className="p-3 border border-border rounded-md bg-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground line-clamp-2 flex items-center gap-2">
                      <LibraryIcon size={14} className="text-muted-foreground shrink-0" />{lib.name}
                    </p>
                    {lib.owner_username && <p className="text-xs text-muted-foreground mt-1">@{lib.owner_username}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{t('search.libraries.bookCount', { count: lib.book_count })}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs mt-3"
                  onClick={() => onOpenLibrary?.({ libraryId: lib.id, libraryName: lib.name, ownerUserId: lib.user_id, ownerUsername: lib.owner_username })}
                >
                  {t('search.libraries.viewLibrary')}
                </Button>
              </div>
            ))}
          </div>
        )}
    </>
  );
}

/* ---------------- Tab 3: Lists & Plans (special profiles) ---------------- */

const SPECIAL_ROLES = ['bookstore', 'author', 'influencer'] as const;
type SpecialRole = typeof SPECIAL_ROLES[number];

function roleBadgeLabel(role: string | null, t: (k: string) => string): string | null {
  if (!role) return null;
  if (role === 'bookstore') return t('search.listsPlans.role.bookstore');
  if (role === 'author') return t('search.listsPlans.role.author');
  if (role === 'influencer') return t('search.listsPlans.role.influencer');
  return null;
}

function ListsAndPlansTab({ userId, onGoToLists }: { userId: string | null; onGoToLists?: (sub?: 'planos' | 'listas') => void }) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<ListsPlansFilter>('lists');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<PublishedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<PublishedItem | null>(null);
  const [selectedBooks, setSelectedBooks] = useState<{ id: string; title: string; author: string | null; cover_url: string | null }[]>([]);
  const [unsubscribeTarget, setUnsubscribeTarget] = useState<PublishedItem | null>(null);
  const [planReplaceTarget, setPlanReplaceTarget] = useState<{ item: PublishedItem; activePlan: { id: string; name: string } } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);

    // Find users with special roles
    const { data: specialUserRows } = await supabase
      .from('user_roles' as any)
      .select('user_id, role')
      .in('role', SPECIAL_ROLES as unknown as string[]);
    const roleByUser = new Map<string, SpecialRole>();
    ((specialUserRows || []) as any[]).forEach((r) => {
      if (!roleByUser.has(r.user_id)) roleByUser.set(r.user_id, r.role);
    });
    const specialUserIds = Array.from(roleByUser.keys());

    if (specialUserIds.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    // Usernames
    const { data: profs } = await supabase
      .from('public_profiles')
      .select('user_id, username')
      .in('user_id', specialUserIds);
    const usernameByUser = new Map<string, string | null>();
    ((profs || []) as any[]).forEach((p) => usernameByUser.set(p.user_id, p.username ?? null));

    let collected: PublishedItem[] = [];

    if (filter === 'lists') {
      let q = supabase
        .from('reading_lists' as any)
        .select('id, name, user_id, scope, approval_status')
        .eq('approval_status', 'published')
        .in('scope', ['regional', 'national', 'district'])
        .in('user_id', specialUserIds)
        .order('created_at', { ascending: false })
        .limit(80);
      const term = query.trim();
      if (term) q = q.ilike('name', `%${term}%`);
      const { data } = await q;
      const rows = (data || []) as any[];

      // Subscriptions
      const subSet = new Set<string>();
      if (userId && rows.length) {
        const { data: subs } = await supabase
          .from('reading_list_subscriptions' as any)
          .select('reading_list_id')
          .eq('user_id', userId)
          .in('reading_list_id', rows.map(r => r.id));
        ((subs || []) as any[]).forEach((s) => subSet.add(s.reading_list_id));
      }

      collected = await Promise.all(rows.map(async (row) => {
        const [{ count: bookCount }, { count: subCount }] = await Promise.all([
          supabase.from('reading_list_books').select('id', { count: 'exact', head: true }).eq('reading_list_id', row.id),
          supabase.from('reading_list_subscriptions' as any).select('id', { count: 'exact', head: true }).eq('reading_list_id', row.id),
        ]);
        return {
          kind: 'list' as const,
          id: row.id,
          name: row.name,
          user_id: row.user_id,
          creator_username: usernameByUser.get(row.user_id) ?? null,
          creator_role: roleByUser.get(row.user_id) ?? null,
          item_count: bookCount || 0,
          subscriber_count: subCount || 0,
          subscribed: subSet.has(row.id),
        };
      }));
    } else {
      let q = supabase
        .from('reading_plans' as any)
        .select('id, name, created_by_user_id, scope, is_template')
        .eq('is_template', true)
        .in('scope', ['regional', 'national'])
        .in('created_by_user_id', specialUserIds)
        .order('created_at', { ascending: false })
        .limit(80);
      const term = query.trim();
      if (term) q = q.ilike('name', `%${term}%`);
      const { data } = await q;
      const rows = (data || []) as any[];

      collected = await Promise.all(rows.map(async (row) => {
        const [{ count: itemCount }, { count: subCount }] = await Promise.all([
          supabase.from('reading_plan_items' as any).select('id', { count: 'exact', head: true }).eq('plan_id', row.id),
          supabase.from('reading_plans' as any).select('id', { count: 'exact', head: true }).eq('source_template_id', row.id),
        ]);
        return {
          kind: 'plan' as const,
          id: row.id,
          name: row.name,
          user_id: row.created_by_user_id,
          creator_username: usernameByUser.get(row.created_by_user_id) ?? null,
          creator_role: roleByUser.get(row.created_by_user_id) ?? null,
          item_count: itemCount || 0,
          subscriber_count: subCount || 0,
          subscribed: false,
        };
      }));
    }

    setItems(collected);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter, query, userId]);

  useEffect(() => {
    if (!selected || selected.kind !== 'list') { setSelectedBooks([]); return; }
    supabase
      .from('reading_list_books')
      .select('id, title, author, cover_url')
      .eq('reading_list_id', selected.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => setSelectedBooks((data || []) as any));
  }, [selected]);

  const subscribeList = async (item: PublishedItem) => {
    if (!userId) return;
    const { error } = await supabase
      .from('reading_list_subscriptions' as any)
      .upsert({ user_id: userId, reading_list_id: item.id }, { onConflict: 'user_id,reading_list_id' });
    if (error) { toast.error(t('search.listsPlans.subscribeError')); return; }
    toast.success(t('search.listsPlans.subscribed'));
    load();
  };

  const unsubscribeList = async (item: PublishedItem) => {
    if (!userId) return;
    const { error } = await supabase
      .from('reading_list_subscriptions' as any)
      .delete()
      .eq('user_id', userId)
      .eq('reading_list_id', item.id);
    if (error) { toast.error(t('search.listsPlans.subscribeError')); return; }
    toast.success(t('search.listsPlans.unsubscribed'));
    setUnsubscribeTarget(null);
    load();
  };

  const importPlanFromTemplate = async (item: PublishedItem) => {
    if (!userId) return;
    setBusy(true);
    const { data: planRow, error: planErr } = await supabase
      .from('reading_plans' as any)
      .insert({ name: item.name, user_id: userId, created_by_user_id: userId, is_template: false, status: 'active', source_template_id: item.id })
      .select('id')
      .single();
    if (planErr || !planRow) { setBusy(false); toast.error(t('search.listsPlans.subscribeError')); return; }
    const { data: srcItems } = await supabase
      .from('reading_plan_items' as any)
      .select('title, author, isbn, cover_url, target_month, priority')
      .eq('plan_id', item.id);
    const toInsert = ((srcItems || []) as any[]).map((it) => ({ ...it, plan_id: (planRow as any).id, status: 'planned' }));
    if (toInsert.length) await supabase.from('reading_plan_items' as any).insert(toInsert);
    setBusy(false);
    toast.success(t('search.listsPlans.planAdded'));
    load();
    onGoToLists?.('planos');
  };

  const subscribePlan = async (item: PublishedItem) => {
    if (!userId) return;
    const { data: active } = await supabase
      .from('reading_plans' as any)
      .select('id, name')
      .eq('user_id', userId)
      .eq('is_template', false)
      .eq('status', 'active')
      .maybeSingle();
    if (active) {
      setPlanReplaceTarget({ item, activePlan: active as any });
      return;
    }
    await importPlanFromTemplate(item);
  };

  const replaceActivePlanAndImport = async () => {
    if (!planReplaceTarget || !userId) return;
    setBusy(true);
    await supabase.from('reading_plans' as any).update({ status: 'archived' }).eq('id', planReplaceTarget.activePlan.id);
    const target = planReplaceTarget.item;
    setPlanReplaceTarget(null);
    await importPlanFromTemplate(target);
    setBusy(false);
  };

  if (selected && selected.kind === 'list') {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" className="gap-2 px-0" onClick={() => setSelected(null)}><ArrowLeft size={14} />{t('bookDetail.back')}</Button>
        <div>
          <h3 className="font-serif text-xl text-foreground">{selected.name}</h3>
          {selected.creator_username && <p className="text-xs text-muted-foreground mt-1">@{selected.creator_username}{selected.creator_role ? ` · ${roleBadgeLabel(selected.creator_role, t)}` : ''}</p>}
        </div>
        {selectedBooks.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">{t('readingLists.emptyList')}</p> : (
          <div className="space-y-3">
            {selectedBooks.map((book) => (
              <div key={book.id} className="flex gap-3 py-3 border-b border-border">
                {book.cover_url ? <img src={book.cover_url} alt={book.title} className="w-11 h-16 object-cover rounded shrink-0" /> : <div className="w-11 h-16 bg-secondary rounded flex items-center justify-center shrink-0"><BookOpen size={16} className="text-muted-foreground" /></div>}
                <div className="min-w-0"><p className="text-sm text-foreground line-clamp-2">{book.title}</p>{book.author && <p className="text-xs text-muted-foreground line-clamp-1">{book.author}</p>}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search.listsPlans.placeholder')}
          aria-label={t('search.listsPlans.ariaLabel')}
          className="pl-9"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setFilter('lists')}
          className={`px-3 py-1 text-xs rounded-full border transition-colors ${filter === 'lists' ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:text-foreground'}`}
        >
          {t('search.listsPlans.filter.lists')}
        </button>
        <button
          onClick={() => setFilter('plans')}
          className={`px-3 py-1 text-xs rounded-full border transition-colors ${filter === 'plans' ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:text-foreground'}`}
        >
          {t('search.listsPlans.filter.plans')}
        </button>
      </div>

      {loading ? <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        : items.length === 0 ? <p className="text-sm text-muted-foreground text-center py-10">{t('search.listsPlans.empty')}</p>
        : (
          <div className="space-y-3">
            {items.map((item) => {
              const roleLabel = roleBadgeLabel(item.creator_role, t);
              return (
                <div key={`${item.kind}-${item.id}`} className="p-3 border border-border rounded-md bg-card space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-medium text-foreground line-clamp-2">{item.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                        {item.creator_username ? `@${item.creator_username}` : ''}
                        {roleLabel && <Badge variant="outline" className="text-[10px] py-0 h-5">{roleLabel}</Badge>}
                      </p>
                    </div>
                    <div className="text-right space-y-0.5 whitespace-nowrap">
                      <p className="text-xs text-muted-foreground">
                        {item.kind === 'list' ? t('search.listsPlans.bookCount', { count: item.item_count }) : t('search.listsPlans.itemCount', { count: item.item_count })}
                      </p>
                      <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1 justify-end">
                        <Users size={11} /> {t('search.listsPlans.subscriberCount', { count: item.subscriber_count })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {item.kind === 'list' && (
                      <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setSelected(item)}>{t('search.listsPlans.view')}</Button>
                    )}
                    <Button
                      variant={item.subscribed ? 'secondary' : 'default'}
                      size="sm"
                      className="h-8 text-xs gap-1"
                      onClick={() => {
                        if (item.kind === 'list') {
                          if (item.subscribed) setUnsubscribeTarget(item);
                          else subscribeList(item);
                        } else {
                          subscribePlan(item);
                        }
                      }}
                      disabled={busy}
                    >
                      {item.subscribed ? <Heart size={13} /> : <BookmarkPlus size={13} />}
                      {item.subscribed ? t('search.listsPlans.subscribed') : t('search.listsPlans.subscribe')}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      <AlertDialog open={!!unsubscribeTarget} onOpenChange={(o) => !o && setUnsubscribeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('search.listsPlans.unsubscribeTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('search.listsPlans.unsubscribeBody', { name: unsubscribeTarget?.name ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'Cancelar')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => unsubscribeTarget && unsubscribeList(unsubscribeTarget)}>
              {t('search.listsPlans.unsubscribeConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!planReplaceTarget} onOpenChange={(o) => !o && setPlanReplaceTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('search.listsPlans.planReplaceTitle', { name: planReplaceTarget?.activePlan.name ?? '' })}
            </AlertDialogTitle>
            <AlertDialogDescription>{t('search.listsPlans.planReplaceBody')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'Cancelar')}</AlertDialogCancel>
            <AlertDialogAction onClick={replaceActivePlanAndImport} disabled={busy}>
              {t('search.listsPlans.planReplaceConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/* ---------------- Tab 4: Physical public libraries (Overpass API) ---------------- */

function PublicLibrariesTab({ profile, onGoToProfile }: { profile: unknown; onGoToProfile?: () => void }) {
  const { t } = useTranslation();
  const [osmLibraries, setOsmLibraries] = useState<OSMLibrary[]>([]);
  const [osmLoading, setOsmLoading] = useState(false);
  const [osmError, setOsmError] = useState<'no_location' | 'empty' | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState(50);
  const radiusOptions = [5, 15, 50];

  useEffect(() => {
    if (!userCoords && !osmLoading) resolveLocation();
  }, []);

  useEffect(() => {
    if (userCoords) queryOverpass(userCoords.lat, userCoords.lon, radiusKm);
  }, [userCoords, radiusKm]);

  const resolveLocation = () => {
    const profileData = profile as any;
    if (profileData?.location_lat && profileData?.location_lng) {
      setUserCoords({ lat: profileData.location_lat, lon: profileData.location_lng });
      setLocationLabel(profileData.location || null);
      return;
    }
    if (navigator.geolocation) {
      setOsmLoading(true);
      setOsmError(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          setLocationLabel(null);
        },
        () => {
          setOsmLoading(false);
          setOsmError('no_location');
        }
      );
      return;
    }
    setOsmError('no_location');
  };

  const queryOverpass = async (lat: number, lon: number, radius: number) => {
    setOsmLoading(true);
    setOsmError(null);
    const radiusM = radius * 1000;
    const query = `[out:json][timeout:25];(node["amenity"="library"](around:${radiusM},${lat},${lon});way["amenity"="library"](around:${radiusM},${lat},${lon}););out center;`;
    const endpoints = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];
    let data: any = null;
    let lastErr: unknown = null;
    for (const url of endpoints) {
      try {
        const res = await fetch(url, { method: 'POST', body: `data=${encodeURIComponent(query)}`, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        if (!res.ok) throw new Error(`Overpass ${url} returned ${res.status}`);
        data = await res.json();
        break;
      } catch (err) {
        lastErr = err;
        console.warn('[Overpass] endpoint failed, trying next:', url, err);
      }
    }
    try {
      if (!data) throw lastErr ?? new Error('All Overpass endpoints failed');
      const results: OSMLibrary[] = (data.elements || []).map((el: any) => {
        const elLat = el.lat ?? el.center?.lat;
        const elLon = el.lon ?? el.center?.lon;
        const tags = el.tags || {};
        const parts = [tags['addr:street'], tags['addr:housenumber'], tags['addr:city']].filter(Boolean);
        return { id: el.id, name: tags.name || t('search.libraries.libraryFallback'), address: parts.length > 0 ? parts.join(', ') : null, distance: haversineKm(lat, lon, elLat, elLon), openingHours: tags.opening_hours || null, website: tags.website || tags['contact:website'] || null };
      });
      results.sort((a, b) => a.distance - b.distance);
      setOsmLibraries(results);
      if (results.length === 0) setOsmError('empty');
    } catch (e) {
      console.error('Overpass error:', e);
      setOsmError('empty');
    }
    setOsmLoading(false);
  };

  return (
    <div>
      <div className="flex gap-1 mb-2 bg-secondary rounded-lg p-1">
        {radiusOptions.map((radius) => (
          <button key={radius} onClick={() => setRadiusKm(radius)} className={`flex-1 py-1.5 text-xs rounded-md transition-colors ${radiusKm === radius ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{radius} km</button>
        ))}
      </div>
      {locationLabel && userCoords && !osmLoading && <p className="text-xs text-muted-foreground mb-4">{t('findLibraries.nearLocation', { location: locationLabel })}</p>}
      {osmLoading && <div className="text-center py-16"><OwlLoader /></div>}
      {osmError === 'no_location' && !osmLoading && (
        <div className="text-center py-16">
          <MapPin size={32} className="mx-auto text-muted-foreground mb-3" strokeWidth={1} />
          <p className="text-muted-foreground text-sm">{t('findLibraries.setLocationHint')}</p>
          {onGoToProfile && <button onClick={onGoToProfile} className="mt-4 text-sm text-accent hover:text-foreground transition-colors">{t('findLibraries.goToProfile')}</button>}
        </div>
      )}
      {osmError === 'empty' && !osmLoading && <div className="text-center py-16"><MapPin size={32} className="mx-auto text-muted-foreground mb-3" strokeWidth={1} /><p className="text-muted-foreground text-sm">{t('findLibraries.noResults')}</p></div>}
      {!osmLoading && !osmError && osmLibraries.length > 0 && (
        <div>
          {osmLibraries.map((lib) => (
            <div key={lib.id} className="py-3 border-b border-border">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground font-medium">{lib.name}</p>
                  {lib.address && <p className="text-xs text-muted-foreground mt-0.5">{lib.address}</p>}
                  {lib.openingHours && <p className="text-xs text-muted-foreground mt-0.5">{lib.openingHours}</p>}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap mt-0.5">{lib.distance.toFixed(1)} km</span>
              </div>
              {lib.website && <a href={lib.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:text-foreground transition-colors mt-1.5">{t('findLibraries.viewWebsite')} <ExternalLink size={10} /></a>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
