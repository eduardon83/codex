import { useEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import { ArrowLeft, CalendarDays, Check, Download, File, Filter, Globe2, ImagePlus, Link as LinkIcon, List, MapPin, Plus, Share2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getAvatarById } from '@/lib/avatars';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import foliumIcon from '@/assets/folium-icon.svg';
import { EVENT_GROUPS, EVENT_SCOPE_LABELS_PT, EVENT_TYPE_KEYS, EventMedia, EventRole, EventScope, EventType, CodexEvent, creatorName, eventIcon, eventTone, formatDate, formatDateTime, isRegistrationEvent, scopeLabel } from '@/lib/events';

type UploadedMedia = { type: 'banner' | 'image' | 'attachment'; url: string; filename: string; mime_type: string; file_size: number; sort_order: number };
type EventForm = { type: EventType | null; scope: EventScope; title: string; introduction: string; body: string; starts_at: string; ends_at: string; multiDay: boolean; registrations: boolean; registration_opens_at: string; registration_closes_at: string; registration_limit: string; location: string; online: boolean; online_link: string; linked_book_isbn: string; linked_reading_list_id: string; draft: boolean; media: UploadedMedia[] };

const emptyForm: EventForm = { type: null, scope: 'national', title: '', introduction: '', body: '', starts_at: '', ends_at: '', multiDay: false, registrations: false, registration_opens_at: '', registration_closes_at: '', registration_limit: '', location: '', online: false, online_link: '', linked_book_isbn: '', linked_reading_list_id: '', draft: false, media: [] };

const GROUP_KEYS = ['all', 'reading', 'contests', 'conferences', 'visits', 'news'] as const;

export default function EventsScreen({ onOpenCalendarEvent }: { onOpenCalendarEvent?: string | null }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [events, setEvents] = useState<CodexEvent[]>([]);
  const [roles, setRoles] = useState<EventRole[]>([]);
  const [activeGroup, setActiveGroup] = useState('all');
  const [selected, setSelected] = useState<CodexEvent | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<{ type: string; scope: string; from: string; to: string }>({ type: '', scope: '', from: '', to: '' });

  const canCreate = roles.some((r) => ['bookstore', 'entity', 'global_admin', 'admin'].includes(r));

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('events' as any)
      .select('*, event_media(*), entities(name, role_label, logo_url), schools(name), districts(name), reading_lists(name)')
      .order('starts_at', { ascending: true, nullsFirst: false });
    const base = ((data as unknown as CodexEvent[]) || []).map((e) => ({ ...e, registration_count: 0, my_registration: null }));
    const ids = base.map((e) => e.id);
    if (ids.length) {
      const { data: regs } = await supabase.from('event_registrations' as any).select('id, event_id, user_id, status').in('event_id', ids).neq('status', 'cancelled');
      const rows = (regs as any[]) || [];
      base.forEach((event) => {
        event.registration_count = rows.filter((r) => r.event_id === event.id && r.status === 'confirmed').length;
        event.my_registration = rows.find((r) => r.event_id === event.id && r.user_id === user.id) || null;
      });
    }
    setEvents(base);
    if (onOpenCalendarEvent) setSelected(base.find((e) => e.id === onOpenCalendarEvent) || null);
  };

  useEffect(() => {
    if (!user) return;
    load();
    supabase.from('user_roles' as any).select('role').eq('user_id', user.id).then(({ data }) => setRoles(((data as any[]) || []).map((r) => r.role)));
  }, [user, onOpenCalendarEvent]);

  const visibleEvents = useMemo(() => events.filter((event) => {
    const groupOk = activeGroup === 'all' || EVENT_GROUPS[activeGroup]?.includes(event.type);
    const typeOk = !filters.type || event.type === filters.type;
    const scopeOk = !filters.scope || event.scope === filters.scope;
    const fromOk = !filters.from || !event.starts_at || event.starts_at >= new Date(filters.from).toISOString();
    const toOk = !filters.to || !event.starts_at || event.starts_at <= new Date(`${filters.to}T23:59:59`).toISOString();
    return groupOk && typeOk && scopeOk && fromOk && toOk;
  }), [events, activeGroup, filters]);

  const featured = visibleEvents.filter((event) => {
    if (event.is_official) return true;
    if (!event.starts_at) return false;
    const ts = new Date(event.starts_at).getTime();
    return ts >= Date.now() && ts <= Date.now() + 30 * 86400000;
  });

  if (selected) return <EventDetail event={selected} onBack={() => { setSelected(null); load(); }} onChanged={load} />;

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-foreground" style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: '1.75rem', color: 'hsl(var(--accent, var(--foreground)))' }}>{t('eventsScreen.title')}</h1>
        <div className="flex items-center gap-2">
          {canCreate && <Button size="sm" onClick={() => setCreateOpen(true)}><Plus size={15} className="mr-1" />{t('eventsScreen.create')}</Button>}
          <button onClick={() => setFilterOpen(true)} aria-label={t('eventsScreen.filter_aria')} className="h-9 w-9 grid place-items-center rounded-full border border-border text-muted-foreground"><Filter size={17} /></button>
        </div>
      </div>

      <div data-tutorial="events-filters" className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4">
        {GROUP_KEYS.map((key) => <button key={key} onClick={() => setActiveGroup(key)} className={cn('shrink-0 rounded-full border px-3 py-1.5 text-xs font-[Josefin_Sans]', activeGroup === key ? 'bg-foreground text-background border-foreground' : 'bg-background text-foreground border-border')}>{t(`eventsScreen.groups.${key}`)}</button>)}
      </div>

      <section className="mt-2">
        <h2 className="font-['Cormorant_Garamond'] text-xl text-foreground mb-3">{t('eventsScreen.in_focus')}</h2>
        {featured.length === 0 ? <EmptyEvents /> : <div className="flex gap-3 overflow-x-auto snap-x pb-2 -mx-4 px-4">{featured.map((event) => <FeaturedCard key={event.id} event={event} onClick={() => setSelected(event)} />)}</div>}
      </section>

      <section className="mt-7">
        <h2 className="font-['Cormorant_Garamond'] text-xl text-foreground mb-3">{t('eventsScreen.all_events')}</h2>
        <div className="space-y-3">{visibleEvents.map((event) => <CompactCard key={event.id} event={event} onClick={() => setSelected(event)} />)}{visibleEvents.length === 0 && <EmptyEvents />}</div>
      </section>

      <FilterSheet open={filterOpen} onOpenChange={setFilterOpen} filters={filters} setFilters={setFilters} />
      <EventCreateSheet open={createOpen} onOpenChange={setCreateOpen} roles={roles} onCreated={load} />
    </div>
  );
}

function EmptyEvents() {
  const { t } = useTranslation();
  return <div className="py-10 text-center text-muted-foreground"><img src={foliumIcon} alt="Codex" className="h-10 w-10 mx-auto mb-3 opacity-70" /><p className="text-sm font-[Josefin_Sans]">{t('eventsScreen.empty')}</p></div>;
}

function bannerOf(event: CodexEvent) { return event.event_media?.find((m) => m.type === 'banner')?.url; }
function mediaOf(event: CodexEvent, type: EventMedia['type']) { return (event.event_media || []).filter((m) => m.type === type).sort((a, b) => a.sort_order - b.sort_order); }

function EventBanner({ event, className }: { event: CodexEvent; className?: string }) {
  const banner = bannerOf(event);
  const tone = eventTone(event.type);
  return banner ? <img src={banner} alt={event.title} className={cn('object-cover', className)} /> : <div className={cn('bg-gradient-to-br', tone.gradient, className)} />;
}

function TypeBadge({ type }: { type: EventType }) {
  const { t } = useTranslation();
  const tone = eventTone(type);
  return <span className={cn('inline-flex items-center rounded-full px-2 py-1 text-[10px] font-[Josefin_Sans] uppercase tracking-wider', tone.chip)}>{t(`eventsScreen.types.${type}`)}</span>;
}

function FeaturedCard({ event, onClick }: { event: CodexEvent; onClick: () => void }) {
  const { t, i18n } = useTranslation();
  return <button onClick={onClick} aria-label={t('eventsScreen.view_aria', { title: event.title })} className="snap-center shrink-0 w-[88%] overflow-hidden rounded-md border border-border bg-card text-left"><div className="relative aspect-video"><EventBanner event={event} className="h-full w-full" /><div className="absolute left-3 top-3"><TypeBadge type={event.type} /></div></div><div className="p-4"><h3 className="font-['Cormorant_Garamond'] text-2xl leading-tight text-foreground">{event.title}</h3><p className="mt-2 text-sm text-muted-foreground font-[Josefin_Sans]">{formatDate(event.starts_at, i18n.language) || t('eventsScreen.no_date')} · {event.location || scopeLabel(event, t)}</p>{event.registration_limit && <p className="mt-2 text-xs text-muted-foreground font-[Josefin_Sans]">{t('eventsScreen.registrants_count', { count: event.registration_count || 0, limit: event.registration_limit })}</p>}</div></button>;
}

function CompactCard({ event, onClick }: { event: CodexEvent; onClick: () => void }) {
  const { t, i18n } = useTranslation();
  const Icon = eventIcon(event.type); const tone = eventTone(event.type);
  return <button onClick={onClick} aria-label={t('eventsScreen.view_aria', { title: event.title })} className="w-full rounded-md border border-border bg-card p-3 text-left flex gap-3"><div className={cn('h-10 w-10 rounded-md grid place-items-center shrink-0', tone.bg, tone.text)}><Icon size={18} /></div><div className="min-w-0 flex-1"><div className="flex items-center gap-2 mb-1"><span className="text-[10px] uppercase tracking-wider text-muted-foreground font-[Josefin_Sans]">{t(`eventsScreen.types.${event.type}`)}</span><span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-foreground font-[Josefin_Sans]">{formatDate(event.starts_at, i18n.language) || t(`eventsScreen.scopes.${event.scope}`)}</span></div><h3 className="font-['Cormorant_Garamond'] text-lg leading-tight text-foreground">{event.title}</h3><p className="mt-1 text-xs text-muted-foreground line-clamp-2 font-[Josefin_Sans]">{event.introduction}</p><p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground font-[Josefin_Sans]">{creatorName(event, t('eventsScreen.creator_default'))} · {scopeLabel(event, t)}</p></div></button>;
}

function FilterSheet({ open, onOpenChange, filters, setFilters }: any) {
  const { t } = useTranslation();
  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent side="bottom" className="rounded-t-2xl"><SheetHeader><SheetTitle>{t('eventsScreen.filters.title')}</SheetTitle></SheetHeader><div className="mt-5 space-y-3"><select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={filters.type} onChange={(e) => setFilters((f: any) => ({ ...f, type: e.target.value }))}><option value="">{t('eventsScreen.filters.all_types')}</option>{EVENT_TYPE_KEYS.map((type) => <option key={type} value={type}>{t(`eventsScreen.types.${type}`)}</option>)}</select><select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={filters.scope} onChange={(e) => setFilters((f: any) => ({ ...f, scope: e.target.value }))}><option value="">{t('eventsScreen.filters.all_scopes')}</option>{Object.keys(EVENT_SCOPE_LABELS_PT).map((k) => <option key={k} value={k}>{t(`eventsScreen.scopes.${k}`)}</option>)}</select><div className="grid grid-cols-2 gap-2"><Input type="date" value={filters.from} onChange={(e) => setFilters((f: any) => ({ ...f, from: e.target.value }))} /><Input type="date" value={filters.to} onChange={(e) => setFilters((f: any) => ({ ...f, to: e.target.value }))} /></div><Button variant="outline" className="w-full" onClick={() => setFilters({ type: '', scope: '', from: '', to: '' })}>{t('eventsScreen.filters.clear')}</Button></div></SheetContent></Sheet>;
}

export function EventDetail({ event, onBack, onChanged, adminActions }: { event: CodexEvent; onBack?: () => void; onChanged?: () => void; adminActions?: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [galleryImage, setGalleryImage] = useState<string | null>(null);
  const count = event.registration_count || 0;
  const full = event.registration_limit ? count >= event.registration_limit : false;
  const registered = event.my_registration?.status === 'confirmed';
  const waitlisted = event.my_registration?.status === 'waitlisted';
  const registrationClosed = event.registration_closes_at ? new Date(event.registration_closes_at).getTime() < Date.now() : false;
  const online = event.location?.toLowerCase() === 'online' || Boolean(event.online_link);
  const avatar = event.profiles?.avatar_url ? getAvatarById(event.profiles.avatar_url)?.file : null;

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title: event.title, text: event.introduction, url });
    else { await navigator.clipboard.writeText(url); toast.success(t('eventsScreen.link_copied')); }
  };

  const register = async () => {
    if (!user) return;
    const status = full ? 'waitlisted' : 'confirmed';
    const { error } = await supabase.from('event_registrations' as any).upsert({ event_id: event.id, user_id: user.id, status }, { onConflict: 'event_id,user_id' });
    if (error) return toast.error(error.message);
    const msg = event.starts_at
      ? t('eventsScreen.registered_success_with_date', { title: event.title, date: formatDate(event.starts_at, i18n.language) })
      : t('eventsScreen.registered_success', { title: event.title });
    toast.success(msg);
    setConfirmOpen(false); onChanged?.();
  };

  const cancel = async () => {
    if (!user) return;
    const { error } = await supabase.from('event_registrations' as any).delete().eq('event_id', event.id).eq('user_id', user.id);
    if (error) return toast.error(error.message);
    toast.success(t('eventsScreen.registration_cancelled')); onChanged?.();
  };

  return <div className="min-h-screen pb-24 bg-background animate-fade-in"><div className="max-w-lg mx-auto px-4 pt-4"><div className="flex items-center justify-between mb-4"><button onClick={onBack} className="text-muted-foreground hover:text-foreground"><ArrowLeft size={20} /></button><button onClick={share} className="text-muted-foreground hover:text-foreground"><Share2 size={20} /></button></div><EventBanner event={event} className="w-full aspect-video rounded-md" /><div className="mt-4 flex gap-2 flex-wrap"><TypeBadge type={event.type} /><Badge variant="secondary" className="rounded-full">{scopeLabel(event, t)}</Badge></div><h1 className="mt-4 font-['Cormorant_Garamond'] text-4xl leading-none text-foreground">{event.title}</h1><div className="mt-4 flex items-center gap-3"><div className="h-9 w-9 rounded-full bg-secondary grid place-items-center overflow-hidden">{event.entities?.logo_url ? <img src={event.entities.logo_url} className="h-full w-full object-cover" /> : avatar ? <img src={avatar} className="h-full w-full object-cover" /> : <img src={foliumIcon} className="h-5 w-5 opacity-70" />}</div><p className="text-sm text-muted-foreground font-[Josefin_Sans]">{creatorName(event, t('eventsScreen.creator_default'))} · <span className="text-foreground">{event.entities?.role_label || event.schools?.name || t('eventsScreen.creator_label_default')}</span></p></div><p className="mt-5 text-base leading-relaxed text-muted-foreground font-[Josefin_Sans]">{event.introduction}</p><div className="my-6 border-t border-border" />{event.starts_at && <InfoRow icon={<CalendarDays size={18} />} text={event.ends_at ? t('eventsScreen.date_from_to', { from: formatDateTime(event.starts_at, i18n.language), to: formatDateTime(event.ends_at, i18n.language) }) : formatDateTime(event.starts_at, i18n.language)} />}{event.location && <InfoRow icon={online ? <Globe2 size={18} /> : <MapPin size={18} />} text={event.location} />}{event.online_link && registered && <InfoRow icon={<LinkIcon size={18} />} text={event.online_link} />}{event.linked_book_isbn && <InfoRow icon={<BookIcon />} text={t('eventsScreen.linked_book', { isbn: event.linked_book_isbn })} />}{event.reading_lists?.name && <InfoRow icon={<List size={18} />} text={t('eventsScreen.linked_list', { name: event.reading_lists.name })} />}<div className="mt-6 whitespace-pre-wrap text-sm leading-7 text-foreground font-[Josefin_Sans]">{event.body}</div><Attachments files={mediaOf(event, 'attachment')} /><Gallery images={mediaOf(event, 'image')} onOpen={setGalleryImage} />{isRegistrationEvent(event) && <div className="mt-7 rounded-md border border-border p-4 bg-card">{registered ? <div><Badge className="bg-emerald-700 text-primary-foreground"><Check size={13} className="mr-1" />{t('eventsScreen.registered')}</Badge><button onClick={cancel} className="block mt-3 text-sm text-muted-foreground underline">{t('eventsScreen.cancel_registration')}</button></div> : waitlisted ? <p className="text-sm text-muted-foreground">{t('eventsScreen.waitlisted')}</p> : registrationClosed ? <p className="text-sm text-muted-foreground">{t('eventsScreen.closed')}</p> : <div><p className="text-sm text-muted-foreground mb-3">{event.registration_closes_at ? t('eventsScreen.until', { date: formatDate(event.registration_closes_at, i18n.language) }) : ''}{event.registration_limit ? t('eventsScreen.slots_remaining', { count: Math.max(event.registration_limit - count, 0) }) : t('eventsScreen.open_registration')}</p><Button className="w-full" onClick={() => setConfirmOpen(true)}>{full ? t('eventsScreen.join_waitlist') : t('eventsScreen.register')}</Button>{full && <p className="mt-2 text-xs text-muted-foreground">{t('eventsScreen.full_capacity')}</p>}</div>}</div>}{adminActions}<Button variant="outline" className="w-full mt-6" onClick={share}><Share2 size={16} className="mr-2" />{t('eventsScreen.share')}</Button></div><Sheet open={confirmOpen} onOpenChange={setConfirmOpen}><SheetContent side="bottom" className="rounded-t-2xl"><SheetHeader><SheetTitle>{t('eventsScreen.confirm_title')}</SheetTitle></SheetHeader><div className="mt-5 space-y-3"><h3 className="font-['Cormorant_Garamond'] text-2xl">{event.title}</h3><p className="text-sm text-muted-foreground font-[Josefin_Sans]">{formatDateTime(event.starts_at, i18n.language)}<br />{event.location}</p><Button className="w-full" onClick={register}>{t('eventsScreen.confirm_button')}</Button></div></SheetContent></Sheet><Dialog open={!!galleryImage} onOpenChange={() => setGalleryImage(null)}><DialogContent className="p-0 bg-transparent border-0"><img src={galleryImage || ''} className="w-full rounded-md" /></DialogContent></Dialog></div>;
}

function BookIcon() { return <span className="text-base">📚</span>; }
function InfoRow({ icon, text }: { icon: React.ReactNode; text: string }) { return <div className="mt-3 flex items-start gap-3 text-sm text-foreground font-[Josefin_Sans]"><span className="mt-0.5 text-muted-foreground">{icon}</span><span className="break-words">{text}</span></div>; }
function Attachments({ files }: { files: EventMedia[] }) { const { t } = useTranslation(); if (!files.length) return null; return <div className="mt-7 space-y-2"><h3 className="font-['Cormorant_Garamond'] text-xl">{t('eventsScreen.attachments')}</h3>{files.map((file) => <div key={file.id} className="flex items-center gap-3 rounded-md border border-border p-3"><File size={18} className="text-muted-foreground" /><span className="flex-1 text-sm truncate font-[Josefin_Sans]">{file.filename || t('eventsScreen.attachment_default')}</span><Button size="sm" variant="outline" onClick={() => window.open(file.url, '_blank')}><Download size={14} className="mr-1" />{t('eventsScreen.download')}</Button></div>)}</div>; }
function Gallery({ images, onOpen }: { images: EventMedia[]; onOpen: (url: string) => void }) { const { t } = useTranslation(); if (!images.length) return null; return <div className="mt-7"><h3 className="font-['Cormorant_Garamond'] text-xl mb-3">{t('eventsScreen.gallery')}</h3><div className="flex gap-2 overflow-x-auto">{images.map((image) => <button key={image.id} onClick={() => onOpen(image.url)}><img src={image.url} className="h-24 w-32 object-cover rounded-md border border-border" /></button>)}</div></div>; }

function EventCreateSheet({ open, onOpenChange, roles, onCreated }: { open: boolean; onOpenChange: (v: boolean) => void; roles: EventRole[]; onCreated: () => void }) {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [lists, setLists] = useState<{ id: string; name: string }[]>([]);
  const canChooseScope = true;
  const isGlobal = roles.includes('global_admin') || roles.includes('admin');

  useEffect(() => { if (user && open) supabase.from('reading_lists' as any).select('id, name').eq('user_id', user.id).then(({ data }) => setLists((data as any[]) || [])); }, [user, open]);

  const update = (patch: Partial<EventForm>) => setForm((f) => ({ ...f, ...patch }));
  const skipDates = form.type === 'news' || form.type === 'pnl_update';
  const maxStep = 6;

  const uploadFiles = async (files: FileList | null, type: UploadedMedia['type']) => {
    if (!files || !user) return;
    const current = form.media.filter((m) => m.type === type).length;
    const limits = type === 'banner' ? 1 : type === 'image' ? 5 : 3;
    const picked = Array.from(files).slice(0, limits - current);
    const uploaded: UploadedMedia[] = [];
    for (const file of picked) {
      const max = type === 'banner' ? 5 : type === 'image' ? 2 : 10;
      if (file.size > max * 1024 * 1024) { toast.error(t('eventsScreen.create_sheet.max_mb', { name: file.name, max })); continue; }
      if (type === 'attachment' && !['application/pdf', 'image/png'].includes(file.type)) { toast.error(t('eventsScreen.create_sheet.attachments_only')); continue; }
      const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
      const { error } = await supabase.storage.from('event-media').upload(path, file);
      if (error) { toast.error(error.message); continue; }
      const { data } = supabase.storage.from('event-media').getPublicUrl(path);
      uploaded.push({ type, url: data.publicUrl, filename: file.name, mime_type: file.type, file_size: file.size, sort_order: current + uploaded.length });
    }
    update({ media: [...form.media, ...uploaded] });
  };

  const publish = async () => {
    if (!user || !form.type || !form.title.trim() || !form.introduction.trim() || !form.body.trim()) return toast.error(t('eventsScreen.create_sheet.required'));
    setSaving(true);
    const approval_status = 'approved';
    const status = form.draft ? 'draft' : 'published';
    const profileAny = profile as any;
    const { data, error } = await supabase.from('events' as any).insert({ created_by_user_id: user.id, type: form.type, scope: form.scope, title: form.title.trim(), introduction: form.introduction.trim(), body: form.body.trim(), status, approval_status, is_official: isGlobal, district_id: form.scope !== 'national' ? profileAny?.district_id || null : null, school_id: null, starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null, ends_at: form.multiDay && form.ends_at ? new Date(form.ends_at).toISOString() : null, registration_opens_at: form.registrations && form.registration_opens_at ? new Date(form.registration_opens_at).toISOString() : null, registration_closes_at: form.registrations && form.registration_closes_at ? new Date(form.registration_closes_at).toISOString() : null, registration_limit: form.registrations && form.registration_limit ? Number(form.registration_limit) : null, location: form.online ? 'Online' : form.location || null, online_link: form.online_link || null, linked_book_isbn: form.linked_book_isbn || null, linked_reading_list_id: form.linked_reading_list_id || null }).select().single();
    if (error) { setSaving(false); return toast.error(error.message); }
    const eventId = (data as any).id;
    if (form.media.length) await supabase.from('event_media' as any).insert(form.media.map((m) => ({ ...m, event_id: eventId })));
    toast.success(form.draft ? t('eventsScreen.create_sheet.draft_saved') : t('eventsScreen.create_sheet.published'));
    setSaving(false); setStep(1); setForm(emptyForm); onOpenChange(false); onCreated();
  };

  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent side="bottom" className="rounded-t-2xl max-h-[92vh] overflow-y-auto"><SheetHeader><SheetTitle className="font-['Cormorant_Garamond'] text-2xl">{t('eventsScreen.create_sheet.title')}</SheetTitle></SheetHeader><div className="mt-5"><div className="mb-4 flex gap-1">{Array.from({ length: maxStep }, (_, i) => <span key={i} className={cn('h-1 flex-1 rounded-full', i + 1 <= step ? 'bg-foreground' : 'bg-secondary')} />)}</div>{step === 1 && <StepType form={form} update={update} canChooseScope={canChooseScope} />}{step === 2 && <div className="space-y-3"><Input maxLength={100} placeholder={t('eventsScreen.create_sheet.title_ph')} value={form.title} onChange={(e) => update({ title: e.target.value })} /><div><Textarea maxLength={300} placeholder={t('eventsScreen.create_sheet.intro_ph')} value={form.introduction} onChange={(e) => update({ introduction: e.target.value })} /><p className="text-xs text-muted-foreground text-right">{form.introduction.length}/300</p></div><Textarea className="min-h-40" placeholder={t('eventsScreen.create_sheet.body_ph')} value={form.body} onChange={(e) => update({ body: e.target.value })} /></div>}{step === 3 && <StepMedia form={form} uploadFiles={uploadFiles} remove={(url) => update({ media: form.media.filter((m) => m.url !== url) })} />}{step === 4 && <StepDates form={form} update={update} skipDates={skipDates} />}{step === 5 && <div className="space-y-3"><Input placeholder={t('eventsScreen.create_sheet.isbn_ph')} value={form.linked_book_isbn} onChange={(e) => update({ linked_book_isbn: e.target.value })} /><select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.linked_reading_list_id} onChange={(e) => update({ linked_reading_list_id: e.target.value })}><option value="">{t('eventsScreen.create_sheet.list_ph')}</option>{lists.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>}{step === 6 && <div className="space-y-4"><EventPreview form={form} /><label className="flex items-center justify-between text-sm font-[Josefin_Sans]"><span>{t('eventsScreen.create_sheet.save_draft')}</span><Switch checked={form.draft} onCheckedChange={(v) => update({ draft: v })} /></label></div>}<div className="mt-6 flex gap-2"><Button variant="outline" className="flex-1" disabled={step === 1} onClick={() => setStep((s) => Math.max(1, s - 1))}>{t('eventsScreen.create_sheet.back')}</Button>{step < maxStep ? <Button className="flex-1" onClick={() => setStep((s) => skipDates && s === 3 ? 5 : Math.min(maxStep, s + 1))}>{t('eventsScreen.create_sheet.continue')}</Button> : <Button className="flex-1" disabled={saving} onClick={publish}>{saving ? t('eventsScreen.create_sheet.saving') : t('eventsScreen.create_sheet.publish')}</Button>}</div></div></SheetContent></Sheet>;
}

function StepType({ form, update, canChooseScope }: { form: EventForm; update: (p: Partial<EventForm>) => void; canChooseScope: boolean }) {
  const { t } = useTranslation();
  const codexScopes: { value: EventScope; labelKey: string }[] = [{ value: 'district', labelKey: 'eventsScreen.create_sheet.scope_local' }, { value: 'national', labelKey: 'eventsScreen.create_sheet.scope_national' }];
  return <div className="space-y-4"><div className="grid grid-cols-2 gap-2">{EVENT_TYPE_KEYS.map((type) => { const Icon = eventIcon(type); const active = form.type === type; return <button key={type} onClick={() => update({ type })} className={cn('rounded-md border p-3 text-left', active ? 'border-foreground bg-secondary' : 'border-border')}><Icon size={18} className="mb-2" /><span className="text-xs font-[Josefin_Sans]">{t(`eventsScreen.types.${type}`)}</span></button>; })}</div>{canChooseScope ? <div className="grid grid-cols-2 gap-1">{codexScopes.map(({ value, labelKey }) => <button key={value} onClick={() => update({ scope: value })} className={cn('rounded-full border px-2 py-1 text-xs', form.scope === value ? 'bg-foreground text-background border-foreground' : 'border-border')}>{t(labelKey)}</button>)}</div> : <p className="text-sm text-muted-foreground font-[Josefin_Sans]">{t('eventsScreen.create_sheet.scope_auto')}</p>}</div>;
}
function StepMedia({ form, uploadFiles, remove }: { form: EventForm; uploadFiles: (files: FileList | null, type: UploadedMedia['type']) => void; remove: (url: string) => void }) {
  const { t } = useTranslation();
  const input = useRef<HTMLInputElement>(null); const [kind, setKind] = useState<UploadedMedia['type']>('banner');
  return <div className="space-y-3"><input ref={input} type="file" multiple={kind !== 'banner'} accept={kind === 'attachment' ? '.pdf,.png' : 'image/*'} className="hidden" onChange={(e) => uploadFiles(e.target.files, kind)} /><Button variant="outline" className="w-full" onClick={() => { setKind('banner'); setTimeout(() => input.current?.click()); }}><ImagePlus size={16} className="mr-2" />{t('eventsScreen.create_sheet.banner')}</Button><Button variant="outline" className="w-full" onClick={() => { setKind('image'); setTimeout(() => input.current?.click()); }}><Upload size={16} className="mr-2" />{t('eventsScreen.create_sheet.additional_images')}</Button><Button variant="outline" className="w-full" onClick={() => { setKind('attachment'); setTimeout(() => input.current?.click()); }}><File size={16} className="mr-2" />{t('eventsScreen.create_sheet.attachments_btn')}</Button><div className="space-y-2">{form.media.map((m) => <div key={m.url} className="flex items-center gap-2 rounded-md border border-border p-2 text-sm"><span className="flex-1 truncate">{m.type}: {m.filename}</span><button onClick={() => remove(m.url)}><X size={16} /></button></div>)}</div></div>;
}
function StepDates({ form, update, skipDates }: { form: EventForm; update: (p: Partial<EventForm>) => void; skipDates: boolean }) {
  const { t } = useTranslation();
  return <div className="space-y-3">{!skipDates && <><Input type="datetime-local" value={form.starts_at} onChange={(e) => update({ starts_at: e.target.value })} /><label className="flex items-center justify-between text-sm"><span>{t('eventsScreen.create_sheet.multi_day')}</span><Switch checked={form.multiDay} onCheckedChange={(v) => update({ multiDay: v })} /></label>{form.multiDay && <Input type="datetime-local" value={form.ends_at} onChange={(e) => update({ ends_at: e.target.value })} />}</>}<label className="flex items-center justify-between text-sm"><span>{t('eventsScreen.create_sheet.registrations_open')}</span><Switch checked={form.registrations} onCheckedChange={(v) => update({ registrations: v })} /></label>{form.registrations && <><Input type="datetime-local" value={form.registration_opens_at} onChange={(e) => update({ registration_opens_at: e.target.value })} /><Input type="datetime-local" value={form.registration_closes_at} onChange={(e) => update({ registration_closes_at: e.target.value })} /><Input type="number" min="1" placeholder={t('eventsScreen.create_sheet.limit_ph')} value={form.registration_limit} onChange={(e) => update({ registration_limit: e.target.value })} /></>}<label className="flex items-center justify-between text-sm"><span>{t('eventsScreen.create_sheet.online_event')}</span><Switch checked={form.online} onCheckedChange={(v) => update({ online: v })} /></label>{form.online ? <Input placeholder={t('eventsScreen.create_sheet.online_link')} value={form.online_link} onChange={(e) => update({ online_link: e.target.value })} /> : <Input placeholder={t('eventsScreen.create_sheet.location_ph')} value={form.location} onChange={(e) => update({ location: e.target.value })} />}</div>;
}
function EventPreview({ form }: { form: EventForm }) {
  const { t } = useTranslation();
  return <div className="rounded-md border border-border overflow-hidden"><div className={cn('aspect-video bg-gradient-to-br', form.type ? eventTone(form.type).gradient : 'from-muted to-background')}>{form.media.find((m) => m.type === 'banner') && <img src={form.media.find((m) => m.type === 'banner')!.url} className="h-full w-full object-cover" />}</div><div className="p-4">{form.type && <TypeBadge type={form.type} />}<h3 className="mt-3 font-['Cormorant_Garamond'] text-3xl">{form.title || t('eventsScreen.create_sheet.preview_title_ph')}</h3><p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{form.introduction || t('eventsScreen.create_sheet.preview_intro_ph')}</p></div></div>;
}
