import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, BookOpen, Loader2, MapPin } from 'lucide-react';
import LoanRequestModal, { RequestableBook } from '@/components/LoanRequestModal';
import FindLibrariesScreen from '@/components/FindLibrariesScreen';
import HelpButton from '@/components/tutorial/HelpButton';

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

interface OwnerInfo { username: string | null; first_name: string | null; school_name: string | null; }

interface Props {
  onGoToProfile?: () => void;
  onOpenLibrary?: (lib: { libraryId: string; libraryName: string; ownerUserId: string; ownerUsername: string | null }) => void;
}

export default function ProcurarLivroScreen({ onGoToProfile, onOpenLibrary }: Props) {
  const { user, profile } = useAuth();
  const districtId = (profile as any)?.district_id ?? null;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AvailRow[]>([]);
  const [owners, setOwners] = useState<Record<string, OwnerInfo>>({});
  const [loading, setLoading] = useState(false);
  const [requestTarget, setRequestTarget] = useState<RequestableBook | null>(null);

  // Debounced fetch
  useEffect(() => {
    if (!user || !districtId) return;
    let active = true;
    setLoading(true);
    const t = setTimeout(async () => {
      let q = supabase
        .from('book_availability' as any)
        .select('id, book_id, owner_user_id, title, author, cover_url, isbn, district_id, school_id')
        .eq('is_available', true)
        .eq('district_id', districtId)
        .neq('owner_user_id', user.id)
        .limit(50);

      const term = query.trim();
      if (term) {
        q = q.or(`title.ilike.%${term}%,author.ilike.%${term}%,isbn.ilike.%${term}%`);
      }

      const { data } = await q;
      if (!active) return;
      const rows = ((data || []) as unknown) as AvailRow[];
      setResults(rows);

      // Resolve owner usernames + school names
      const ownerIds = Array.from(new Set(rows.map(r => r.owner_user_id)));
      const schoolIds = Array.from(new Set(rows.map(r => r.school_id).filter(Boolean) as string[]));

      const [profsRes, schoolsRes] = await Promise.all([
        ownerIds.length
          ? supabase.from('public_profiles').select('user_id, username, first_name').in('user_id', ownerIds)
          : Promise.resolve({ data: [] as any[] }),
        schoolIds.length
          ? supabase.from('schools').select('id, name').in('id', schoolIds)
          : Promise.resolve({ data: [] as any[] }),
      ]);

      const schoolMap = new Map<string, string>();
      (schoolsRes.data || []).forEach((s: any) => schoolMap.set(s.id, s.name));

      const profMap = new Map<string, { username: string | null; first_name: string | null }>();
      (profsRes.data || []).forEach((p: any) => p.user_id && profMap.set(p.user_id, p));

      const map: Record<string, OwnerInfo> = {};
      rows.forEach((r) => {
        const p = profMap.get(r.owner_user_id);
        map[r.owner_user_id] = {
          username: p?.username ?? null,
          first_name: p?.first_name ?? null,
          school_name: r.school_id ? schoolMap.get(r.school_id) ?? null : null,
        };
      });
      setOwners(map);
      setLoading(false);
    }, 200);
    return () => { active = false; clearTimeout(t); };
  }, [user, districtId, query]);

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl text-foreground">Procurar livro</h2>
        <HelpButton screen="discover" />
      </div>

      <Tabs defaultValue="books">
        <TabsList className="w-full">
          <TabsTrigger value="books" className="flex-1">Livros</TabsTrigger>
          <TabsTrigger value="public" className="flex-1">Bibliotecas Públicas</TabsTrigger>
        </TabsList>

        <TabsContent value="books" className="space-y-4 mt-4">
          {!districtId ? (
            <div className="text-center py-10 space-y-3">
              <p className="text-sm text-muted-foreground">
                Define a tua escola para descobrir livros à tua volta.
              </p>
              <Button variant="outline" onClick={onGoToProfile}>Ir ao perfil</Button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Título, autor ou ISBN…"
                  className="pl-9"
                />
              </div>

              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
              ) : results.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">
                  Sem livros disponíveis no teu distrito.
                </p>
              ) : (
                <div className="space-y-3">
                  {results.map((r) => {
                    const owner = owners[r.owner_user_id];
                    const ownerLabel = owner?.username || owner?.first_name || 'utilizador';
                    return (
                      <div key={r.id} className="flex gap-3 p-3 border border-border rounded-md bg-card">
                        {r.cover_url ? (
                          <img src={r.cover_url} alt={r.title} className="w-14 h-20 object-cover rounded shrink-0" />
                        ) : (
                          <div className="w-14 h-20 bg-secondary rounded flex items-center justify-center shrink-0">
                            <BookOpen size={18} className="text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-2">{r.title}</p>
                          {r.author && <p className="text-xs text-muted-foreground line-clamp-1">{r.author}</p>}
                          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                            <MapPin size={10} /> @{ownerLabel}{owner?.school_name ? ` · ${owner.school_name}` : ''}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2 h-7 text-xs"
                            onClick={() => setRequestTarget({
                              availability_id: r.id,
                              book_id: r.book_id,
                              owner_user_id: r.owner_user_id,
                              title: r.title,
                              author: r.author,
                              cover_url: r.cover_url,
                              isbn: r.isbn,
                            })}
                          >
                            Pedir emprestado
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="public" className="mt-4">
          {/* Reuse existing public-library discovery (Overpass + saved) */}
          <FindLibrariesScreen onGoToProfile={onGoToProfile} onOpenLibrary={onOpenLibrary} />
        </TabsContent>
      </Tabs>

      <LoanRequestModal
        book={requestTarget}
        open={!!requestTarget}
        onOpenChange={(o) => !o && setRequestTarget(null)}
      />
    </div>
  );
}
