import { useEffect, useMemo, useState } from 'react';
import { Archive, Ban, Check, Eye, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { EventDetail } from '@/components/EventsScreen';
import { EVENT_SCOPE_LABELS_PT, EVENT_TYPE_KEYS, EVENT_TYPE_LABELS_PT, EventScope, EventType, FoliumEvent, creatorName, formatDate, scopeLabel } from '@/lib/events';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminEvents() {
  const [events, setEvents] = useState<FoliumEvent[]>([]);
  const [selected, setSelected] = useState<FoliumEvent | null>(null);
  const [filters, setFilters] = useState({ type: '', scope: '', creator: '' });

  const load = async () => {
    const { data, error } = await supabase
      .from('events' as any)
      .select('*, event_media(*), entities(name, role_label, logo_url), schools(name), districts(name), reading_lists(name)')
      .order('created_at', { ascending: false });
    if (error) return toast.error(error.message);
    setEvents((data as unknown as FoliumEvent[]) || []);
  };

  useEffect(() => { load(); }, []);

  const pending = events.filter((event) => event.approval_status === 'pending');
  const published = useMemo(() => events.filter((event) => {
    if (event.status !== 'published') return false;
    if (filters.type && event.type !== filters.type) return false;
    if (filters.scope && event.scope !== filters.scope) return false;
    if (filters.creator && !creatorName(event).toLowerCase().includes(filters.creator.toLowerCase())) return false;
    return true;
  }), [events, filters]);

  const updateEvent = async (id: string, patch: Record<string, unknown>) => {
    const { error } = await supabase.from('events' as any).update(patch).eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Evento atualizado.');
    setSelected(null);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-['Cormorant_Garamond'] text-3xl text-foreground mb-1">Eventos</h1>
        <p className="text-sm text-muted-foreground font-['Josefin_Sans']">Revê aprovações, eventos publicados e ações administrativas.</p>
      </div>
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="published">Publicados</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-5">
          <EventTable events={pending} actionLabel="Rever" onReview={setSelected} empty="Sem eventos pendentes." />
        </TabsContent>
        <TabsContent value="published" className="mt-5 space-y-4">
          <div className="flex gap-2 flex-wrap">
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}>
              <option value="">Todos os tipos</option>{EVENT_TYPE_KEYS.map((type) => <option key={type} value={type}>{EVENT_TYPE_LABELS_PT[type]}</option>)}
            </select>
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={filters.scope} onChange={(e) => setFilters((f) => ({ ...f, scope: e.target.value }))}>
              <option value="">Todos os âmbitos</option>{Object.entries(EVENT_SCOPE_LABELS_PT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <div className="relative flex-1 min-w-48"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input className="pl-8" placeholder="Criador" value={filters.creator} onChange={(e) => setFilters((f) => ({ ...f, creator: e.target.value }))} /></div>
          </div>
          <EventTable events={published} onReview={setSelected} empty="Sem eventos publicados." actions={(event) => <><Button size="sm" variant="outline" onClick={() => updateEvent(event.id, { status: 'archived' })}><Archive size={14} className="mr-1" />Arquivar</Button><Button size="sm" variant="outline" onClick={() => updateEvent(event.id, { status: 'cancelled' })}><Ban size={14} className="mr-1" />Cancelar</Button></>} />
        </TabsContent>
      </Tabs>
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}><DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto p-0"><div className="bg-background"><EventDetail event={selected as FoliumEvent} adminActions={selected?.approval_status === 'pending' ? <div className="mt-6 grid grid-cols-2 gap-2"><Button onClick={() => updateEvent(selected.id, { approval_status: 'approved', status: 'published' })}><Check size={16} className="mr-2" />Aprovar</Button><Button variant="outline" onClick={() => updateEvent(selected.id, { approval_status: 'rejected', status: 'draft', rejection_note: 'Rejeitado pelo administrador.' })}><X size={16} className="mr-2" />Rejeitar com nota</Button></div> : null} /></div></DialogContent></Dialog>
    </div>
  );
}

function EventTable({ events, onReview, actionLabel = 'Ver', actions, empty }: { events: FoliumEvent[]; onReview: (e: FoliumEvent) => void; actionLabel?: string; actions?: (e: FoliumEvent) => React.ReactNode; empty: string }) {
  if (!events.length) return <div className="py-16 text-center text-sm text-muted-foreground font-['Josefin_Sans']">{empty}</div>;
  return <div className="border border-border rounded overflow-hidden"><table className="w-full text-sm"><thead className="bg-muted/30"><tr><th className="text-left p-3">Tipo</th><th className="text-left p-3">Título</th><th className="text-left p-3">Criador</th><th className="text-left p-3">Âmbito</th><th className="text-left p-3">Data</th><th className="text-right p-3">Ações</th></tr></thead><tbody>{events.map((event) => <tr key={event.id} className="border-t border-border"><td className="p-3 text-xs">{EVENT_TYPE_LABELS_PT[event.type as EventType]}</td><td className="p-3 font-medium">{event.title}</td><td className="p-3 text-muted-foreground">{creatorName(event)}</td><td className="p-3 text-muted-foreground">{scopeLabel(event)}</td><td className="p-3 text-muted-foreground">{formatDate(event.created_at)}</td><td className="p-3"><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => onReview(event)}><Eye size={14} className="mr-1" />{actionLabel}</Button>{actions?.(event)}</div></td></tr>)}</tbody></table></div>;
}
