import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Search, Star, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { tFormat, tGenre } from '@/lib/displayMappings';
import { parseGenres } from '@/components/GenreMultiSelect';

interface ReadingHistoryEntry {
  id: string;
  book_isbn: string | null;
  book_title: string;
  book_author: string | null;
  book_cover_url: string | null;
  book_publisher: string | null;
  book_year: string | null;
  book_pages: number | null;
  book_format: string | null;
  book_genre: string | null;
  book_series: string | null;
  book_language: string | null;
  status: string;
  rating: number | null;
  date_added: string;
  date_started: string | null;
  date_finished: string | null;
  personal_notes: string | null;
  source_library_name: string | null;
  removed_from_library: boolean;
}

interface Props {
  onBack: () => void;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={12} className={i <= rating ? 'fill-[hsl(var(--gold))] text-[hsl(var(--gold))]' : 'text-muted-foreground/30'} />
      ))}
    </div>
  );
}

function BookRow({ entry, onClick }: { entry: ReadingHistoryEntry; onClick: () => void }) {
  const { t } = useTranslation();
  const firstGenre = parseGenres(entry.book_genre)[0];
  return (
    <TooltipProvider delayDuration={400}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-secondary/50 transition-colors text-left"
          >
            {entry.book_cover_url ? (
              <img src={entry.book_cover_url} alt="" className="w-10 h-14 rounded object-cover flex-shrink-0" />
            ) : (
              <div className="w-10 h-14 rounded bg-secondary flex items-center justify-center flex-shrink-0">
                <BookOpen size={16} className="text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{entry.book_title}</p>
              <p className="text-xs text-muted-foreground truncate">{entry.book_author || '—'}</p>
              <div className="flex items-center gap-2 mt-1">
                {entry.book_year && <span className="text-xs text-muted-foreground">{entry.book_year}</span>}
                {firstGenre && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-accent/20 text-accent-foreground">
                    {tGenre(firstGenre, t)}
                  </Badge>
                )}
              </div>
            </div>
            {entry.rating && entry.status === 'Read' && (
              <div className="flex-shrink-0">
                <StarRating rating={entry.rating} />
              </div>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="hidden md:block w-64 p-3">
          <div className="flex gap-3">
            {entry.book_cover_url && (
              <img src={entry.book_cover_url} alt="" className="w-12 h-16 rounded object-cover" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{entry.book_title}</p>
              <p className="text-xs text-muted-foreground">{entry.book_author}</p>
              {entry.rating && <div className="mt-1"><StarRating rating={entry.rating} /></div>}
              {entry.date_finished && (
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(entry.date_finished).toLocaleDateString()}
                </p>
              )}
              {firstGenre && (
                <Badge variant="secondary" className="text-[10px] mt-1">{tGenre(firstGenre, t)}</Badge>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function DetailSheet({ entry, open, onClose }: { entry: ReadingHistoryEntry | null; open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  if (!entry) return null;
  const genres = parseGenres(entry.book_genre);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle className="font-serif text-xl">{entry.book_title}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <div className="flex gap-4">
            {entry.book_cover_url ? (
              <img src={entry.book_cover_url} alt="" className="w-24 h-36 rounded object-cover" />
            ) : (
              <div className="w-24 h-36 rounded bg-secondary flex items-center justify-center">
                <BookOpen size={24} className="text-muted-foreground" />
              </div>
            )}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{entry.book_author || '—'}</p>
              {entry.rating && <StarRating rating={entry.rating} />}
              {genres.length > 0 && (
                <Badge variant="secondary" className="text-xs bg-accent/20">{genres.map(g => tGenre(g, t)).join(', ')}</Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {entry.book_publisher && (
              <div><p className="text-muted-foreground text-xs">{t('bookDetail.publisher')}</p><p className="text-foreground">{entry.book_publisher}</p></div>
            )}
            {entry.book_year && (
              <div><p className="text-muted-foreground text-xs">{t('bookDetail.published')}</p><p className="text-foreground">{entry.book_year}</p></div>
            )}
            {entry.book_format && (
              <div><p className="text-muted-foreground text-xs">{t('bookDetail.format')}</p><p className="text-foreground">{tFormat(entry.book_format, t)}</p></div>
            )}
            {entry.book_pages && (
              <div><p className="text-muted-foreground text-xs">{t('bookDetail.pages')}</p><p className="text-foreground">{entry.book_pages}</p></div>
            )}
            {entry.book_language && (
              <div><p className="text-muted-foreground text-xs">{t('bookDetail.language')}</p><p className="text-foreground">{entry.book_language}</p></div>
            )}
            {entry.book_series && (
              <div><p className="text-muted-foreground text-xs">{t('bookDetail.series')}</p><p className="text-foreground">{entry.book_series}</p></div>
            )}
            {entry.book_isbn && (
              <div><p className="text-muted-foreground text-xs">{t('bookDetail.isbn')}</p><p className="text-foreground">{entry.book_isbn}</p></div>
            )}
            {entry.source_library_name && (
              <div><p className="text-muted-foreground text-xs">{t('readingHistory.sourceLibrary')}</p><p className="text-foreground">{entry.source_library_name}</p></div>
            )}
            {entry.date_added && (
              <div><p className="text-muted-foreground text-xs">{t('bookDetail.added')}</p><p className="text-foreground">{new Date(entry.date_added).toLocaleDateString()}</p></div>
            )}
            {entry.date_started && (
              <div><p className="text-muted-foreground text-xs">{t('readingHistory.dateStarted')}</p><p className="text-foreground">{new Date(entry.date_started).toLocaleDateString()}</p></div>
            )}
            {entry.date_finished && (
              <div><p className="text-muted-foreground text-xs">{t('readingHistory.dateFinished')}</p><p className="text-foreground">{new Date(entry.date_finished).toLocaleDateString()}</p></div>
            )}
          </div>

          {entry.personal_notes && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t('bookDetail.myNotes')}</p>
              <p className="text-sm text-foreground bg-secondary/50 rounded p-3">{entry.personal_notes}</p>
            </div>
          )}

          {entry.removed_from_library && (
            <p className="text-xs text-muted-foreground italic">{t('readingHistory.removedFromLibrary')}</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function ReadingHistoryScreen({ onBack }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [entries, setEntries] = useState<ReadingHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<ReadingHistoryEntry | null>(null);
  const [activeTab, setActiveTab] = useState('reading');

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from('reading_history')
        .select('*')
        .eq('user_id', user.id)
        .order('date_added', { ascending: false });
      setEntries((data as any as ReadingHistoryEntry[]) || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return entries.filter(e => {
      if (q && !e.book_title.toLowerCase().includes(q) && !(e.book_author || '').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [entries, search]);

  const statusMap: Record<string, string[]> = {
    reading: ['Currently Reading'],
    read: ['Read'],
    unread: ['Unread', 'unread'],
  };

  const getTabEntries = (tab: string) =>
    filtered.filter(e => statusMap[tab]?.some(s => s.toLowerCase() === e.status.toLowerCase()));

  const tabLabels: Record<string, string> = {
    reading: t('readingHistory.tabReading'),
    read: t('readingHistory.tabRead'),
    unread: t('readingHistory.tabUnread'),
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 pt-4 pb-24 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="text-foreground hover:text-muted-foreground transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h2 className="font-serif text-2xl text-foreground">{t('readingHistory.title')}</h2>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('readingHistory.searchPlaceholder')}
            className="pl-9 bg-background border-border text-sm"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            {['reading', 'read', 'unread'].map(tab => (
              <TabsTrigger key={tab} value={tab} className="flex-1 text-xs">
                {tabLabels[tab]} ({getTabEntries(tab).length})
              </TabsTrigger>
            ))}
          </TabsList>

          {['reading', 'read', 'unread'].map(tab => (
            <TabsContent key={tab} value={tab}>
              {loading ? (
                <p className="text-center text-muted-foreground text-sm py-8">{t('app.loading')}</p>
              ) : getTabEntries(tab).length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen size={32} className="mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">{t('readingHistory.empty')}</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {getTabEntries(tab).map(entry => (
                    <BookRow key={entry.id} entry={entry} onClick={() => setSelectedEntry(entry)} />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <DetailSheet entry={selectedEntry} open={!!selectedEntry} onClose={() => setSelectedEntry(null)} />
    </div>
  );
}
