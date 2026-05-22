import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Check, ChevronDown, ChevronUp, FileUp, GripVertical, MoreVertical, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useContent } from '@/hooks/useContent';
import WishlistScreen from '@/components/WishlistScreen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { buildPlanMonths } from '@/components/AddToPlanSheet';
import ReadingListDetail from '@/components/ReadingListDetail';

const TAB_KEY = 'folium_listas_tab';
type ListasTab = 'wishlist' | 'planos' | 'listas';
type ImportMode = 'plan' | 'list';

type Plan = { id: string; name: string; description: string | null; started_at: string | null; ends_at: string | null; created_at: string };
type PlanItem = { id: string; plan_id: string; book_id: string | null; isbn: string | null; title: string; author: string | null; cover_url: string | null; target_month: string | null; priority: number; status: 'planned' | 'reading' | 'done' | 'skipped'; books?: { reading_status: string | null } | null };
type ParsedBook = { title: string; author: string | null; isbn: string | null; month?: string | null };
type ReadingList = { id: string; name: string; creator_name: string | null; creator_role: string | null; is_official: boolean; created_at: string; updated_at: string; book_count?: number; subscribed?: boolean };

const ptMonths: Record<string, string> = { janeiro: '01', fevereiro: '02', março: '03', marco: '03', abril: '04', maio: '05', junho: '06', julho: '07', agosto: '08', setembro: '09', outubro: '10', novembro: '11', dezembro: '12' };
const LOCALE_MAP: Record<string, string> = { pt: 'pt-PT', en: 'en-US', es: 'es-ES', fr: 'fr-FR' };
const monthLabel = (month: string | null, lang: string = 'pt') => month ? new Intl.DateTimeFormat(LOCALE_MAP[lang] || lang || 'pt-PT', { month: 'long', year: 'numeric' }).format(new Date(`${month}-01T00:00:00`)) : '';
const csvEscape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

function normalizeMonth(value: unknown) {
  const raw = String(value ?? '').trim();
  if (!raw) return null;
  if (/^\d{4}-\d{2}$/.test(raw)) return raw;
  const match = raw.toLowerCase().normalize('NFC').match(/([a-zçãéóíúâêô]+)\s+(\d{4})/i);
  if (!match) return null;
  const mm = ptMonths[match[1]];
  return mm ? `${match[2]}-${mm}` : null;
}

function parseRows(rows: any[], mode: ImportMode): ParsedBook[] {
  return rows.map((row) => {
    const title = String(row.title ?? row.título ?? row.titulo ?? row.Title ?? '').trim();
    if (!title) return null;
    return {
      title,
      author: String(row.author ?? row.autor ?? row.Author ?? '').trim() || null,
      isbn: String(row.isbn ?? row.ISBN ?? '').trim() || null,
      month: mode === 'plan' ? normalizeMonth(row.month ?? row.mês ?? row.mes ?? row.Month) : null,
    };
  }).filter(Boolean) as ParsedBook[];
}

async function parseFile(file: File, mode: ImportMode) {
  if (file.name.toLowerCase().endsWith('.csv')) {
    const text = await file.text();
    const wb = XLSX.read(text, { type: 'string' });
    return parseRows(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]), mode);
  }
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer);
  return parseRows(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]), mode);
}

function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  const headers = Object.keys(rows[0] || { title: '', author: '', isbn: '' });
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => csvEscape(r[h])).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ListasScreen({ onGoToSearchReadingLists }: { onGoToSearchReadingLists?: () => void }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tab, setTab] = useState<ListasTab>(() => (localStorage.getItem(TAB_KEY) as ListasTab) || 'wishlist');

  useEffect(() => {
    localStorage.setItem(TAB_KEY, tab);
  }, [tab]);

  useEffect(() => {
    const openPlanos = () => setTab('planos');
    window.addEventListener('folium-open-planos', openPlanos);
    return () => window.removeEventListener('folium-open-planos', openPlanos);
  }, []);

  const headingText = tab === 'wishlist' ? t('lists.wishlist_title') : tab === 'planos' ? t('lists.plans_title') : t('lists.lists_title');

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto animate-fade-in">
      <h1
        className="font-serif italic text-foreground mb-4"
        style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: '1.75rem', color: 'hsl(var(--accent, var(--foreground)))' }}
      >
        {headingText}
      </h1>
      <Tabs value={tab} onValueChange={(value) => setTab(value as ListasTab)}>
        <TabsList data-tutorial="listas-tabs" className="w-full rounded-full mb-4" aria-label={t('lists.tabs_aria')}>
          <TabsTrigger value="wishlist" className="flex-1 rounded-full">{t('lists.tab_wishlist')}</TabsTrigger>
          <TabsTrigger value="planos" className="flex-1 rounded-full">{t('lists.tab_plans')}</TabsTrigger>
          <TabsTrigger value="listas" className="flex-1 rounded-full">{t('lists.tab_lists')}</TabsTrigger>
        </TabsList>
        <TabsContent value="wishlist" className="mt-0 -mx-4 -pt-4"><WishlistScreen /></TabsContent>
        <TabsContent value="planos"><PlanosTab userId={user?.id ?? null} /></TabsContent>
        <TabsContent value="listas"><ReadingListsArea userId={user?.id ?? null} onGoToSearchReadingLists={onGoToSearchReadingLists} onCreatePlan={() => setTab('planos')} /></TabsContent>
      </Tabs>
    </div>
  );
}

function PlanosTab({ userId }: { userId: string | null }) {
  const { t } = useTranslation();
  const helpText = useContent('listas.planosHelp');
  const [plan, setPlan] = useState<Plan | null>(null);
  const [items, setItems] = useState<PlanItem[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [replaceDialog, setReplaceDialog] = useState(false);
  const [archiveDialog, setArchiveDialog] = useState(false);
  const [editingMeta, setEditingMeta] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', ends_at: '' });
  const [preview, setPreview] = useState<ParsedBook[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);

  const load = async () => {
    if (!userId) return;
    const { data } = await supabase.from('reading_plans' as any).select('*').eq('user_id', userId).eq('status', 'active').eq('is_template', false).maybeSingle();
    const active = (data as unknown as Plan | null) || null;
    setPlan(active);
    if (active) {
      const { data: rows } = await supabase.from('reading_plan_items' as any).select('*, books(reading_status)').eq('plan_id', active.id).order('priority');
      setItems((rows as any) || []);
    } else {
      setItems([]);
    }
  };

  useEffect(() => { load(); }, [userId]);
  const months = useMemo(() => buildPlanMonths(plan?.started_at || plan?.created_at?.slice(0, 10), plan?.ends_at), [plan]);
  useEffect(() => { if (months.length && !selectedMonth) setSelectedMonth(months.find(m => m.value === new Date().toISOString().slice(0, 7))?.value || months[0].value); }, [months, selectedMonth]);
  const counts = useMemo(() => items.reduce<Record<string, number>>((acc, item) => { if (item.target_month) acc[item.target_month] = (acc[item.target_month] || 0) + 1; return acc; }, {}), [items]);
  const monthItems = items.filter(i => i.target_month === selectedMonth).sort((a, b) => a.priority - b.priority);
  const unscheduled = items.filter(i => !i.target_month);

  const createPlan = async (imported: ParsedBook[] = []) => {
    if (!userId || !form.name.trim()) return;
    const { data, error } = await supabase.from('reading_plans' as any).insert({ user_id: userId, created_by_user_id: userId, name: form.name.trim(), description: form.description.trim() || null, ends_at: form.ends_at || null, status: 'active', is_template: false }).select().single();
    if (error) return toast.error(error.message);
    if (imported.length) await supabase.from('reading_plan_items' as any).insert(imported.map((b, idx) => ({ plan_id: (data as any).id, title: b.title, author: b.author, isbn: b.isbn, target_month: b.month || null, priority: idx, status: 'planned' })));
    setShowCreate(false); setShowImport(false); setPreview([]); setForm({ name: '', description: '', ends_at: '' });
    await load();
  };

  const exportPlan = () => {
    downloadCsv(`${plan?.name || 'plan'}.csv`, items.map(i => ({ title: i.title, author: i.author, isbn: i.isbn, month: i.target_month, status: i.status, priority: i.priority })));
    toast.success(t('lists.plan_exported'));
  };

  const archivePlan = async () => { if (!plan) return; await supabase.from('reading_plans' as any).update({ status: 'archived' }).eq('id', plan.id); setArchiveDialog(false); setPlan(null); setItems([]); };
  const replacePlan = async (shouldExport: boolean) => { if (shouldExport) exportPlan(); await archivePlan(); setReplaceDialog(false); setShowCreate(true); };
  const updateItem = async (id: string, patch: Partial<PlanItem>) => { await supabase.from('reading_plan_items' as any).update(patch).eq('id', id); if (patch.status === 'done') { const found = items.find(i => i.id === id); if (found?.book_id) await supabase.from('books').update({ reading_status: 'Read' }).eq('id', found.book_id); } load(); };
  const movePriority = async (item: PlanItem, direction: -1 | 1) => { const list = monthItems; const index = list.findIndex(i => i.id === item.id); const other = list[index + direction]; if (!other) return; await Promise.all([supabase.from('reading_plan_items' as any).update({ priority: other.priority }).eq('id', item.id), supabase.from('reading_plan_items' as any).update({ priority: item.priority }).eq('id', other.id)]); load(); };

  if (!plan) return <div className="space-y-4"><p className="text-xs leading-relaxed text-muted-foreground">{helpText}</p><PlanEmptyState onCreate={() => setShowCreate(true)} onImport={() => setShowImport(true)} createSheet={{ open: showCreate, setOpen: setShowCreate, form, setForm, onSave: () => createPlan() }} importDialog={{ open: showImport, setOpen: setShowImport, form, setForm, preview, setPreview, onConfirm: () => createPlan(preview) }} /></div>;

  return (
    <div className="space-y-5">
      <p className="text-xs leading-relaxed text-muted-foreground">{helpText}</p>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {editingMeta ? <Input value={form.name || plan.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mb-2" /> : <h2 className="font-serif text-2xl text-foreground truncate">{plan.name}</h2>}
          {editingMeta ? <Textarea maxLength={200} value={form.description || plan.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /> : plan.description && <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>}
          {editingMeta && <Button size="sm" className="mt-2" onClick={async () => { await supabase.from('reading_plans' as any).update({ name: form.name || plan.name, description: form.description || null }).eq('id', plan.id); setEditingMeta(false); load(); }}>{t('common.save')}</Button>}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><button aria-label={t('lists.plan_options_aria')} className="h-9 w-9 grid place-items-center rounded-full border border-border"><MoreVertical size={16} /></button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setForm({ name: plan.name, description: plan.description || '', ends_at: plan.ends_at || '' }); setEditingMeta(true); }}>{t('lists.edit_name_desc')}</DropdownMenuItem>
            <DropdownMenuItem onClick={exportPlan}>{t('lists.export_plan')}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setReplaceDialog(true)}>{t('lists.replace_plan')}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setArchiveDialog(true)}>{t('lists.archive_plan')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {months.map(m => <button key={m.value} onClick={() => setSelectedMonth(m.value)} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs ${selectedMonth === m.value ? 'bg-foreground text-background border-foreground' : 'bg-background text-foreground border-border'}`}>{m.label}<span className="ml-2 rounded-full bg-secondary px-1.5 text-[10px] text-foreground">{counts[m.value] || 0}</span></button>)}
      </div>
      <PlanItemList items={monthItems} onMove={movePriority} onUpdate={updateItem} onRemove={async id => { await supabase.from('reading_plan_items' as any).delete().eq('id', id); load(); }} months={months} />
      <Button variant="outline" className="w-full" onClick={() => setSearchOpen(true)}><Plus size={16} className="mr-2" />{t('lists.add_book_to_plan')}</Button>
      {unscheduled.length > 0 && <div className="pt-5 border-t border-border"><h3 className="font-serif text-lg mb-3">{t('lists.no_month_set')}</h3><PlanItemList items={unscheduled} onMove={movePriority} onUpdate={updateItem} onRemove={async id => { await supabase.from('reading_plan_items' as any).delete().eq('id', id); load(); }} months={months} /></div>}
      <BookSearchDialog open={searchOpen} onOpenChange={setSearchOpen} planId={plan.id} month={selectedMonth} onAdded={load} />
      <AlertDialog open={replaceDialog} onOpenChange={setReplaceDialog}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{t('lists.active_plan')}: {plan.name}</AlertDialogTitle><AlertDialogDescription>{t('lists.replace_plan_desc')}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel><Button variant="outline" onClick={() => replacePlan(false)}>{t('lists.replace_no_export')}</Button><AlertDialogAction onClick={() => replacePlan(true)}>{t('lists.export_and_replace')}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <AlertDialog open={archiveDialog} onOpenChange={setArchiveDialog}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{t('lists.archive_plan_title')}</AlertDialogTitle><AlertDialogDescription>{t('lists.archive_plan_desc')}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel><AlertDialogAction onClick={archivePlan}>{t('lists.archive_plan')}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}

function PlanEmptyState({ onCreate, onImport, createSheet, importDialog }: any) {
  const { t } = useTranslation();
  return <div className="space-y-3 pt-6"><Button className="w-full h-12" onClick={onCreate}>{t('lists.create_plan')}</Button><Button variant="outline" className="w-full h-12" onClick={onImport}>{t('lists.import_file')}</Button><PlanCreateSheet {...createSheet} /><ImportDialog mode="plan" {...importDialog} /></div>;
}

function PlanCreateSheet({ open, setOpen, form, setForm, onSave }: any) {
  const { t } = useTranslation();
  return <Sheet open={open} onOpenChange={setOpen}><SheetContent side="bottom" className="rounded-t-2xl"><SheetHeader><SheetTitle>{t('lists.create_plan')}</SheetTitle></SheetHeader><div className="mt-5 space-y-3"><Input placeholder={t('lists.plan_name')} value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} /><Textarea maxLength={200} placeholder={t('lists.plan_description')} value={form.description} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))} /><Input type="date" value={form.ends_at} onChange={e => setForm((f: any) => ({ ...f, ends_at: e.target.value }))} /><Button className="w-full" disabled={!form.name.trim()} onClick={onSave}>{t('common.save')}</Button></div></SheetContent></Sheet>;
}

function ImportDialog({ open, setOpen, form, setForm, preview, setPreview, onConfirm, mode }: any) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  return <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>{t('lists.import_file')}</DialogTitle></DialogHeader><div className="space-y-3"><Input placeholder={mode === 'plan' ? t('lists.plan_name') : t('lists.list_name')} value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} /><input ref={inputRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={async e => { const file = e.target.files?.[0]; if (file) setPreview(await parseFile(file, mode)); }} /><Button variant="outline" className="w-full" onClick={() => inputRef.current?.click()}><FileUp size={16} className="mr-2" />{t('lists.select_file')}</Button>{preview.length > 0 && <div><p className="text-sm text-muted-foreground mb-2">{t('lists.rows_detected', { count: preview.length })}</p><div className="max-h-48 overflow-auto border border-border rounded"><table className="w-full text-xs"><tbody>{preview.slice(0, 8).map((r: ParsedBook, i: number) => <tr key={i} className="border-b border-border"><td className="p-2">{r.title}</td><td className="p-2 text-muted-foreground">{r.author}</td><td className="p-2 text-muted-foreground">{r.month}</td></tr>)}</tbody></table></div></div>}<Button className="w-full" disabled={!form.name.trim() || preview.length === 0} onClick={onConfirm}>{t('lists.confirm_import')}</Button></div></DialogContent></Dialog>;
}

function PlanItemList({ items, onMove, onUpdate, onRemove, months }: any) {
  const { t } = useTranslation();
  if (items.length === 0) return <p className="text-sm text-muted-foreground text-center py-8">{t('lists.no_books_this_month')}</p>;
  return <div className="space-y-0">{items.map((item: PlanItem) => { const done = item.status === 'done' || item.books?.reading_status === 'Read'; return <div key={item.id} className={`flex items-center gap-3 py-3 border-b border-border ${done ? 'opacity-60' : ''}`}>{item.cover_url ? <img src={item.cover_url} alt="" className="w-[60px] h-10 object-cover rounded-sm" /> : <div className="w-[60px] h-10 bg-secondary rounded-sm grid place-items-center"><BookOpen size={14} /></div>}<div className="flex-1 min-w-0"><p className="text-sm text-foreground truncate">{done && <Check size={13} className="inline mr-1" />}{item.title}</p><p className="text-xs text-muted-foreground truncate">{item.author}</p></div><span className={`w-2.5 h-2.5 rounded-full ${done ? 'bg-emerald-500' : item.status === 'reading' ? 'bg-amber-500' : 'bg-muted-foreground'}`} /><button aria-label={t('lists.move_up_aria', { title: item.title })} onClick={() => onMove(item, -1)} className="text-muted-foreground"><ChevronUp size={14} /></button><button aria-label={t('lists.move_down_aria', { title: item.title })} onClick={() => onMove(item, 1)} className="text-muted-foreground"><ChevronDown size={14} /></button><DropdownMenu><DropdownMenuTrigger asChild><button aria-label={t('lists.options_aria', { title: item.title })} className="text-muted-foreground"><GripVertical size={16} /></button></DropdownMenuTrigger><DropdownMenuContent align="end">{months.map((m: any) => <DropdownMenuItem key={m.value} onClick={() => onUpdate(item.id, { target_month: m.value })}>{t('lists.move_to')} {m.label}</DropdownMenuItem>)}<DropdownMenuItem onClick={() => onUpdate(item.id, { status: 'reading' })}>{t('lists.mark_reading')}</DropdownMenuItem><DropdownMenuItem onClick={() => onUpdate(item.id, { status: 'done' })}>{t('lists.mark_read')}</DropdownMenuItem><DropdownMenuItem onClick={() => onRemove(item.id)}>{t('lists.remove_from_plan')}</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>; })}</div>;
}

function BookSearchDialog({ open, onOpenChange, planId, month, onAdded }: any) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  useEffect(() => { if (!open || !user) return; const run = async () => { const q = supabase.from('books').select('id,title,author,isbn,cover_url,reading_status,is_wishlist').eq('user_id', user.id).eq('is_wishlist', false).limit(25); const term = query.trim(); const { data } = term ? await q.or(`title.ilike.%${term}%,author.ilike.%${term}%,isbn.ilike.%${term}%`) : await q.eq('reading_status', 'Unread'); setResults(data || []); }; run(); }, [open, query, user]);
  const add = async (book: any) => { const { data: maxRows } = await supabase.from('reading_plan_items' as any).select('priority').eq('plan_id', planId).eq('target_month', month).order('priority', { ascending: false }).limit(1); await supabase.from('reading_plan_items' as any).insert({ plan_id: planId, book_id: book.id, title: book.title, author: book.author, isbn: book.isbn, cover_url: book.cover_url, target_month: month, priority: (((maxRows?.[0] as any)?.priority ?? -1) + 1), status: book.reading_status === 'Read' ? 'done' : 'planned' }); toast.success(t('lists.added_to_plan_for', { month: monthLabel(month) })); onOpenChange(false); onAdded(); };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>{t('lists.add_book_to_plan')}</DialogTitle></DialogHeader><div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input aria-label={t('lists.search_book_aria')} className="pl-9" value={query} onChange={e => setQuery(e.target.value)} placeholder={t('lists.search_placeholder')} /></div><div className="max-h-80 overflow-y-auto">{results.map(b => <button key={b.id} aria-label={t('lists.add_to_plan_aria', { title: b.title })} onClick={() => add(b)} className="w-full flex items-center gap-3 py-3 border-b border-border text-left"><div className="flex-1 min-w-0"><p className="text-sm truncate">{b.title}</p><p className="text-xs text-muted-foreground truncate">{b.author}</p></div><Badge className="bg-emerald-600/20 text-emerald-700 border-emerald-600/30">{t('lists.in_your_library')}</Badge></button>)}</div></DialogContent></Dialog>;
}

function ReadingListsArea({ userId, onGoToSearchReadingLists, onCreatePlan }: { userId: string | null; onGoToSearchReadingLists?: () => void; onCreatePlan: () => void }) {
  const { t } = useTranslation();
  const helpText = useContent('listas.listasHelp');
  const [personal, setPersonal] = useState<ReadingList[]>([]);
  const [subscribed, setSubscribed] = useState<ReadingList[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', import: false });
  const [preview, setPreview] = useState<ParsedBook[]>([]);
  const [detail, setDetail] = useState<(ReadingList & { _subscribed?: boolean }) | null>(null);

  const load = async () => {
    if (!userId) return;
    const { data: mine } = await supabase.from('reading_lists').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    const listRows = (mine as ReadingList[]) || [];
    const withCounts = await Promise.all(listRows.map(async l => ({ ...l, book_count: (await supabase.from('reading_list_books').select('id', { count: 'exact', head: true }).eq('reading_list_id', l.id)).count || 0 })));
    setPersonal(withCounts);
    const { data: subs } = await supabase.from('reading_list_subscriptions' as any).select('reading_list_id, reading_lists(*)').eq('user_id', userId);
    const subLists = ((subs || []) as any[]).map(s => s.reading_lists).filter(Boolean);
    setSubscribed(await Promise.all(subLists.map(async (l: ReadingList) => ({ ...l, subscribed: true, book_count: (await supabase.from('reading_list_books').select('id', { count: 'exact', head: true }).eq('reading_list_id', l.id)).count || 0 }))));
  };
  useEffect(() => { load(); }, [userId]);
  const openDetail = (list: ReadingList, subscribed = false) => { setDetail({ ...list, _subscribed: subscribed }); };
  const createList = async () => { if (!userId || !form.name.trim()) return; const { data } = await supabase.from('reading_lists').insert({ user_id: userId, name: form.name.trim(), scope: 'private', creator_role: 'student', approval_status: 'published' } as any).select().single(); if (data && preview.length) await supabase.from('reading_list_books').insert(preview.map(b => ({ reading_list_id: (data as any).id, title: b.title, author: b.author, isbn: b.isbn }))); setDialogOpen(false); setForm({ name: '', description: '', import: false }); setPreview([]); load(); };
  if (detail) return <ReadingListDetail list={detail as any} subscribed={detail._subscribed} onBack={() => { setDetail(null); load(); }} onCreatePlan={onCreatePlan} />;
  return <div className="space-y-8"><p className="text-xs leading-relaxed text-muted-foreground">{helpText}</p><section><div className="flex items-center justify-between mb-3"><h2 className="font-serif text-xl">{t('lists.my_lists')}</h2><Button size="sm" onClick={() => setDialogOpen(true)}><Plus size={14} className="mr-1" />{t('lists.new_list')}</Button></div>{personal.length === 0 ? <div className="text-center py-10 border border-border rounded-md"><p className="text-sm text-muted-foreground mb-3">{t('lists.no_lists_empty')}</p><Button onClick={() => setDialogOpen(true)}>+ {t('lists.new_list')}</Button></div> : <div className="space-y-3">{personal.map(l => <ListCard key={l.id} list={l} onView={() => openDetail(l, false)} onReload={load} />)}</div>}</section><section><h2 className="font-serif text-xl mb-3">{t('lists.subscribed_lists')}</h2>{subscribed.length === 0 ? <div className="text-center py-10 border border-border rounded-md"><p className="text-sm text-muted-foreground mb-3">{t('lists.no_subscriptions_empty')}</p><Button variant="outline" onClick={onGoToSearchReadingLists}>{t('lists.discover_lists')}</Button></div> : <div className="space-y-3">{subscribed.map(l => <ListCard key={l.id} list={l} onView={() => openDetail(l, true)} onReload={load} subscribed />)}</div>}</section><Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{t('lists.new_list')}</DialogTitle></DialogHeader><div className="space-y-3"><Input placeholder={t('lists.list_name')} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /><Textarea placeholder={t('lists.plan_description')} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /><div className="grid grid-cols-2 gap-2"><Button disabled={!form.name.trim()} onClick={() => { setForm(f => ({ ...f, import: false })); setPreview([]); createList(); }}>{t('lists.create_empty')}</Button><Button variant={form.import ? 'default' : 'outline'} onClick={() => setForm(f => ({ ...f, import: true }))}>{t('lists.import_file')}</Button></div>{form.import && <><ImportFileInline mode="list" preview={preview} setPreview={setPreview} /><Button className="w-full" disabled={!form.name.trim() || preview.length === 0} onClick={createList}>{t('lists.save_with_imported')}</Button></>}</div></DialogContent></Dialog></div>;
}

function ImportFileInline({ mode, preview, setPreview }: any) {
  const { t } = useTranslation();
  const ref = useRef<HTMLInputElement>(null);
  return <div><input ref={ref} type="file" accept=".csv,.xlsx" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (f) setPreview(await parseFile(f, mode)); }} /><Button variant="outline" className="w-full" onClick={() => ref.current?.click()}><FileUp size={15} className="mr-2" />{t('lists.choose_file')}</Button>{preview.length > 0 && <p className="text-xs text-muted-foreground mt-2">{t('lists.books_detected', { count: preview.length })}</p>}</div>;
}

function ListCard({ list, onView, onReload, subscribed }: any) {
  const { t, i18n } = useTranslation();
  const [confirm, setConfirm] = useState(false);
  const remove = async () => { if (subscribed) await supabase.from('reading_list_subscriptions' as any).delete().eq('reading_list_id', list.id); else await supabase.from('reading_lists').delete().eq('id', list.id); setConfirm(false); onReload(); };
  return <div className="border border-border rounded-md p-3"><div className="flex items-start justify-between gap-2"><div><p className="text-sm font-medium">{list.name}</p><p className="text-xs text-muted-foreground">{t('lists.book_count_date', { count: list.book_count || 0, date: new Date(list.updated_at || list.created_at).toLocaleDateString(i18n.language) })}</p><p className="text-xs text-muted-foreground">{list.creator_name || (subscribed ? t('lists.official_list') : t('lists.you'))}{list.is_official && <Badge className="ml-2 bg-gold text-gold-foreground">{t('lists.official')}</Badge>}</p></div><DropdownMenu><DropdownMenuTrigger asChild><button aria-label={t('lists.list_options_aria', { name: list.name })}><MoreVertical size={16} /></button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={onView}>{t('common.view')}</DropdownMenuItem>{!subscribed && <DropdownMenuItem onClick={() => toast.info(t('lists.edit_name_soon'))}>{t('lists.edit_name')}</DropdownMenuItem>}<DropdownMenuItem onClick={async () => { const { data } = await supabase.from('reading_list_books').select('title,author,isbn').eq('reading_list_id', list.id); downloadCsv(`${list.name}.csv`, (data as any) || []); }}>{t('lists.export_csv')}</DropdownMenuItem><DropdownMenuItem onClick={() => setConfirm(true)}>{subscribed ? t('lists.cancel_subscription') : t('common.remove')}</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div><Button variant="outline" size="sm" className="mt-3 w-full" onClick={onView} aria-label={t('lists.view_list_aria', { name: list.name })}>{t('common.view')}</Button><AlertDialog open={confirm} onOpenChange={setConfirm}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{subscribed ? t('lists.unsubscribe_confirm') : t('lists.remove_list_confirm')}</AlertDialogTitle><AlertDialogDescription>{t('lists.action_can_confirm')}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel><AlertDialogAction onClick={remove}>{subscribed ? t('lists.cancel_subscription') : t('common.remove')}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div>;
}
