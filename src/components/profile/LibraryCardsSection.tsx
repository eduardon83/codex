import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Plus, MoreVertical, Pencil, Trash2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import LibraryCardEditor, { LibraryCardRecord } from './LibraryCardEditor';

const SPINE_GOLD = '#C9A84C';

function daysUntil(date: string): number {
  const d = new Date(date + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((d.getTime() - today.getTime()) / 86400000);
}

export default function LibraryCardsSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [cards, setCards] = useState<LibraryCardRecord[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<LibraryCardRecord | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('library_cards' as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    setCards((data as any) || []);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  // Listen for "scroll to library cards" event from Library banner
  useEffect(() => {
    const handler = () => {
      const el = document.getElementById('library-cards-section');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    window.addEventListener('scroll-to-library-cards', handler);
    return () => window.removeEventListener('scroll-to-library-cards', handler);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm(t('libraryCard.confirmDelete'))) return;
    await supabase.from('library_cards' as any).delete().eq('id', id);
    load();
  };

  const openAdd = () => { setEditing(null); setEditorOpen(true); };
  const openEdit = (c: LibraryCardRecord) => { setEditing(c); setEditorOpen(true); };

  return (
    <div id="library-cards-section" className="mt-6">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2" style={{ fontFamily: '"Josefin Sans", sans-serif' }}>
        {t('libraryCard.sectionTitle')}
      </p>

      {cards.length === 0 ? (
        <div className="relative border border-border rounded-md overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: SPINE_GOLD }} />
          <button
            onClick={openAdd}
            className="w-full pl-5 pr-4 py-6 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus size={16} />
            {t('libraryCard.addButton')}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {cards.map((c) => {
            const name = c.library_name || c.name || '';
            const days = c.expiry_date ? daysUntil(c.expiry_date) : null;
            const expiringSoon = days !== null && days >= 0 && days <= 30;
            const expired = days !== null && days < 0;
            return (
              <div key={c.id} id={`library-card-${c.id}`} className="relative border border-border rounded-md overflow-hidden bg-card">
                <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: SPINE_GOLD }} />
                <div className="pl-5 pr-3 py-3 flex items-start gap-2">
                  <BookOpen size={16} className="mt-1 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground truncate" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '18px' }}>
                      {name}
                    </p>
                    {c.location && <p className="text-xs text-muted-foreground truncate">{c.location}</p>}
                    {c.card_number && <p className="text-[11px] text-muted-foreground mt-0.5">№ {c.card_number}</p>}
                    {c.expiry_date && (
                      <p className={`text-[11px] mt-1 ${expired ? 'text-destructive' : expiringSoon ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
                        {expired
                          ? t('libraryCard.expiredOn', { date: c.expiry_date })
                          : t('libraryCard.expiresOn', { date: c.expiry_date })}
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 text-muted-foreground hover:text-foreground" aria-label="Mais opções do cartão">
                        <MoreVertical size={16} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(c)}>
                        <Pencil size={14} className="mr-2" /> {t('libraryCard.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => c.id && handleDelete(c.id)} className="text-destructive">
                        <Trash2 size={14} className="mr-2" /> {t('libraryCard.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
          <Button variant="outline" size="sm" onClick={openAdd} className="w-full">
            <Plus size={14} /> {t('libraryCard.addAnother')}
          </Button>
        </div>
      )}

      <LibraryCardEditor open={editorOpen} onClose={() => setEditorOpen(false)} card={editing} onSaved={load} />
    </div>
  );
}
