import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, Loader2, MapPin, ExternalLink, Heart, BookmarkPlus, ArrowLeft, MoreVertical } from 'lucide-react';
import LoanRequestModal, { RequestableBook } from '@/components/LoanRequestModal';
import HelpButton from '@/components/tutorial/HelpButton';
import OwlLoader from '@/components/OwlLoader';
import { fetchPublicReputations } from '@/lib/loanReputation';
import { resolveAvatarSrc } from '@/lib/avatars';
import AddToPlanSheet, { PlanBookPayload } from '@/components/AddToPlanSheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface AvailRow {
  id: string;
  book_id: string;
  owner_user_id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  isbn: string | null;
  district_id: string | null;
  school_id: string | null;
}

interface OwnerInfo { username: string | null; first_name: string | null; school_name: string | null; avatar_url: string | null; }
interface OSMLibrary { id: number; name: string; address: string | null; distance: number; openingHours: string | null; website: string | null; }
type ProcurarTab = 'books' | 'libraries' | 'readingLists';

interface PublishedReadingList {
  id: string;
  name: string;
  user_id: string;
  creator_name: string | null;
  creator_role: string | null;
  education_level: string | null;
  subject: string | null;
  is_official: boolean;
  book_count: number;
  subscribed: boolean;
}

interface PublishedListBook { id: string; title: string; author: string | null; cover_url: string | null; }

interface Props {
  onGoToProfile?: () => void;
  onOpenLibrary?: (lib: { libraryId: string; libraryName: string; ownerUserId: string; ownerUsername: string | null }) => void;
}

const TAB_STORAGE_KEY = 'folium_procurar_tab';

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function ProcurarLivroScreen({ onGoToProfile }: Props) {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const districtId = (profile as any)?.district_id ?? null;
  const schoolId = (profile as any)?.school_id ?? null;

  const [tab, setTab] = useState<ProcurarTab>(() => {
    const saved = localStorage.getItem(TAB_STORAGE_KEY) as ProcurarTab | null;
    return saved === 'books' || saved === 'libraries' || saved === 'readingLists' ? saved : 'books';
  });
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AvailRow[]>([]);
  const [owners, setOwners] = useState<Record<string, OwnerInfo>>({});
  const [reputations, setReputations] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [requestTarget, setRequestTarget] = useState<RequestableBook | null>(null);
  const [planBook, setPlanBook] = useState<PlanBookPayload | null>(null);
  const [showPlanSheet, setShowPlanSheet] = useState(false);

  useEffect(() => {
    localStorage.setItem(TAB_STORAGE_KEY, tab);
  }, [tab]);

  useEffect(() => {
    if (!user || !districtId || !schoolId) return;
    let active = true;
    setLoading(true);
    const timer = setTimeout(async () => {
      let q = supabase
        .from('book_availability' as any)
        .select('id, book_id, owner_user_id, title, author, cover_url, isbn, district_id, school_id')
        .eq('is_available', true)
        .eq('district_id', districtId)
        .neq('owner_user_id', user.id)
        .limit(50);

      const term = query.trim();
      if (term) q = q.or(`title.ilike.%${term}%,author.ilike.%${term}%,isbn.ilike.%${term}%`);

      const { data } = await q;
      if (!active) return;
      const rows = ((data || []) as unknown) as AvailRow[];
      setResults(rows);

      const ownerIds = Array.from(new Set(rows.map(r => r.owner_user_id)));
      const schoolIds = Array.from(new Set(rows.map(r => r.school_id).filter(Boolean) as string[]));
      const [profsRes, schoolsRes] = await Promise.all([
        ownerIds.length ? supabase.from('public_profiles').select('user_id, username, first_name, avatar_url').in('user_id', ownerIds) : Promise.resolve({ data: [] as any[] }),
        schoolIds.length ? supabase.from('schools').select('id, name').in('id', schoolIds) : Promise.resolve({ data: [] as any[] }),
      ]);

      const schoolMap = new Map<string, string>();
      (schoolsRes.data || []).forEach((s: any) => schoolMap.set(s.id, s.name));
      const profMap = new Map<string, { username: string | null; first_name: string | null; avatar_url: string | null }>();
      (profsRes.data || []).forEach((p: any) => p.user_id && profMap.set(p.user_id, p));

      const map: Record<string, OwnerInfo> = {};
      rows.forEach((r) => {
        const p = profMap.get(r.owner_user_id);
        map[r.owner_user_id] = { username: p?.username ?? null, first_name: p?.first_name ?? null, avatar_url: p?.avatar_url ?? null, school_name: r.school_id ? schoolMap.get(r.school_id) ?? null : null };
      });
      setOwners(map);
      const reps = await fetchPublicReputations(ownerIds);
      if (active) setReputations(reps);
      setLoading(false);
    }, 200);
    return () => { active = false; clearTimeout(timer); };
  }, [user, districtId, schoolId, query]);

  const needsSchool = !schoolId || !districtId;

  const openAddToPlan = (book: AvailRow) => {
    setPlanBook({ book_id: book.book_id, title: book.title, author: book.author, isbn: book.isbn, cover_url: book.cover_url });
    setShowPlanSheet(true);
  };

  const goCreatePlan = () => {
    localStorage.setItem('folium_listas_tab', 'planos');
    window.dispatchEvent(new Event('folium-open-planos'));
  };

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl text-foreground">{t('search.title')}</h2>
        <HelpButton screen="discover" />
      </div>

      <Tabs value={tab} onValueChange={(value) => setTab(value as ProcurarTab)}>
        <TabsList className="w-full rounded-full">
          <TabsTrigger value="books" className="flex-1 rounded-full">{t('search.tabs.books')}</TabsTrigger>
          <TabsTrigger value="libraries" className="flex-1 rounded-full">{t('search.tabs.libraries')}</TabsTrigger>
          <TabsTrigger value="readingLists" className="flex-1 rounded-full">{t('search.tabs.readingLists')}</TabsTrigger>
        </TabsList>

        <TabsContent value="books" className="space-y-4 mt-4">
          {needsSchool ? <SchoolPrompt onGoToProfile={onGoToProfile} /> : (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('search.books.placeholder')} className="pl-9" />
              </div>
              {loading ? <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div> : results.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">{t('search.books.empty')}</p>
              ) : (
                <div className="space-y-3">
                  {results.map((r) => {
                    const owner = owners[r.owner_user_id];
                    const ownerLabel = owner?.username || owner?.first_name || t('search.books.userFallback');
                    return (
                      <div key={r.id} className="flex gap-3 p-3 border border-border rounded-md bg-card">
                        {r.cover_url ? <img src={r.cover_url} alt={r.title} className="w-14 h-20 object-cover rounded shrink-0" /> : (
                          <div className="w-14 h-20 bg-secondary rounded flex items-center justify-center shrink-0"><BookOpen size={18} className="text-muted-foreground" /></div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-2">{r.title}</p>
                          {r.author && <p className="text-xs text-muted-foreground line-clamp-1">{r.author}</p>}
                          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                            <img src={resolveAvatarSrc(owner?.avatar_url)} alt="" className="h-4 w-4 rounded-full border border-border object-cover" /> @{ownerLabel}{owner?.school_name ? ` · ${owner.school_name}` : ''}{reputations[r.owner_user_id] !== undefined ? ` · ${t('search.books.returnRate', { rate: reputations[r.owner_user_id] })}` : ''}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setRequestTarget({ availability_id: r.id, book_id: r.book_id, owner_user_id: r.owner_user_id, title: r.title, author: r.author, cover_url: r.cover_url, isbn: r.isbn })}>
                              {t('search.books.requestLoan')}
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="h-7 w-7 grid place-items-center rounded-full border border-border text-muted-foreground">
                                  <MoreVertical size={14} />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openAddToPlan(r)}>Adicionar ao plano</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="libraries" className="mt-4">
          <PublicLibrariesTab profile={profile} onGoToProfile={onGoToProfile} />
        </TabsContent>

        <TabsContent value="readingLists" className="mt-4">
          {needsSchool ? <SchoolPrompt onGoToProfile={onGoToProfile} /> : <PublishedReadingListsTab userId={user?.id ?? null} />}
        </TabsContent>
      </Tabs>

      <LoanRequestModal book={requestTarget} open={!!requestTarget} onOpenChange={(open) => !open && setRequestTarget(null)} />
      <AddToPlanSheet
        book={planBook}
        open={showPlanSheet}
        onOpenChange={setShowPlanSheet}
        onNoActivePlan={() => toast('Não tens um plano activo.', { action: { label: 'Criar plano →', onClick: goCreatePlan } })}
      />
    </div>
  );
}

function SchoolPrompt({ onGoToProfile }: { onGoToProfile?: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="text-center py-10 space-y-3">
      <p className="text-sm text-muted-foreground">{t('search.schoolPrompt')}</p>
      <Button variant="outline" onClick={onGoToProfile}>{t('search.goToProfile')}</Button>
    </div>
  );
}

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

function PublishedReadingListsTab({ userId }: { userId: string | null }) {
  const { t } = useTranslation();
  const [lists, setLists] = useState<PublishedReadingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PublishedReadingList | null>(null);
  const [books, setBooks] = useState<PublishedListBook[]>([]);

  const loadLists = async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from('reading_lists' as any)
      .select('id, name, user_id, creator_name, creator_role, education_level, subject, is_official, created_at')
      .eq('approval_status', 'published')
      .order('created_at', { ascending: false });

    const listRows = (data || []) as any[];
    const subscriptionRes = await supabase.from('reading_list_subscriptions' as any).select('id, reading_list_id').eq('user_id', userId);
    const subscribedIds = new Set(((subscriptionRes.data || []) as any[]).map((s) => s.reading_list_id));

    const withCounts = await Promise.all(listRows.map(async (list) => {
      const { count } = await supabase.from('reading_list_books').select('id', { count: 'exact', head: true }).eq('reading_list_id', list.id);
      return { ...list, book_count: count || 0, subscribed: subscribedIds.has(list.id) } as PublishedReadingList;
    }));
    setLists(withCounts);
    setLoading(false);
  };

  useEffect(() => { loadLists(); }, [userId]);

  useEffect(() => {
    if (!selected) return;
    supabase
      .from('reading_list_books')
      .select('id, title, author, cover_url')
      .eq('reading_list_id', selected.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => setBooks((data || []) as PublishedListBook[]));
  }, [selected]);

  const subscribe = async (listId: string) => {
    if (!userId) return;
    await supabase.from('reading_list_subscriptions' as any).upsert({ user_id: userId, reading_list_id: listId }, { onConflict: 'user_id,reading_list_id' });
    loadLists();
  };

  if (selected) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" className="gap-2 px-0" onClick={() => setSelected(null)}><ArrowLeft size={14} />{t('bookDetail.back')}</Button>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-serif text-xl text-foreground">{selected.name}</h3>
            {selected.is_official && <Badge variant="outline" className="text-gold border-gold/40">{t('search.readingLists.official')}</Badge>}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{selected.creator_name || t('search.readingLists.creatorFallback')}</p>
        </div>
        {books.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">{t('readingLists.emptyList')}</p> : (
          <div className="space-y-3">
            {books.map((book) => (
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

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  if (lists.length === 0) return <p className="text-sm text-muted-foreground text-center py-10">{t('search.readingLists.empty')}</p>;

  return (
    <div className="space-y-3">
      {lists.map((list) => (
        <div key={list.id} className="p-3 border border-border rounded-md bg-card space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-medium text-foreground line-clamp-2">{list.name}</h3>
                {list.is_official && <Badge variant="outline" className="text-gold border-gold/40">{t('search.readingLists.official')}</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{list.creator_name || t('search.readingLists.creatorFallback')}{list.creator_role ? ` · ${list.creator_role}` : ''}</p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{t('search.readingLists.bookCount', { count: list.book_count })}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {list.education_level && <Badge variant="secondary">{list.education_level}</Badge>}
            {list.subject && <Badge variant="secondary">{list.subject}</Badge>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setSelected(list)}>{t('search.readingLists.viewList')}</Button>
            <Button variant={list.subscribed ? 'secondary' : 'default'} size="sm" className="h-8 text-xs gap-1" onClick={() => subscribe(list.id)} disabled={list.subscribed}>
              {list.subscribed ? <Heart size={13} /> : <BookmarkPlus size={13} />}{list.subscribed ? t('search.readingLists.subscribed') : t('search.readingLists.subscribe')}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
