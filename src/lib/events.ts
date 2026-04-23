import { BookOpen, CalendarDays, Feather, Landmark, Library, Megaphone, Mic2, Newspaper, PenTool, Trophy, Users } from 'lucide-react';

export type EventType = 'reading_group' | 'author_talk' | 'writing_comp' | 'reading_comp' | 'poetry_slam' | 'book_club' | 'symposium' | 'workshop' | 'book_fair' | 'interschool' | 'library_visit' | 'reading_week' | 'storytelling' | 'news' | 'award' | 'pnl_update';
export type EventScope = 'school' | 'district' | 'regional' | 'national';
export type EventStatus = 'draft' | 'published' | 'archived' | 'cancelled';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type EventRole = 'teacher' | 'school_admin' | 'entity' | 'global_admin' | 'admin';

export type EventMedia = { id: string; event_id: string; type: 'banner' | 'image' | 'attachment'; url: string; filename: string | null; mime_type: string | null; file_size?: number | null; sort_order: number; created_at: string };
export type FoliumEvent = {
  id: string; created_by_user_id: string; entity_id: string | null; school_id: string | null; district_id: string | null; type: EventType; scope: EventScope; title: string; introduction: string; body: string; status: EventStatus; is_official: boolean; approval_status: ApprovalStatus; rejection_note?: string | null; starts_at: string | null; ends_at: string | null; registration_opens_at: string | null; registration_closes_at: string | null; registration_limit: number | null; location: string | null; online_link: string | null; linked_book_isbn: string | null; linked_reading_list_id: string | null; created_at: string; updated_at: string; event_media?: EventMedia[]; entities?: { name: string; role_label: string | null; logo_url: string | null } | null; schools?: { name: string } | null; districts?: { name: string } | null; profiles?: { first_name: string | null; last_name: string | null; username: string | null; avatar_url: string | null } | null; reading_lists?: { name: string } | null; registration_count?: number; my_registration?: { id: string; status: 'confirmed' | 'waitlisted' | 'cancelled' } | null;
};

export const EVENT_TYPE_KEYS: EventType[] = ['reading_group', 'author_talk', 'writing_comp', 'reading_comp', 'poetry_slam', 'book_club', 'symposium', 'workshop', 'book_fair', 'interschool', 'library_visit', 'reading_week', 'storytelling', 'news', 'award', 'pnl_update'];

export const EVENT_GROUPS: Record<string, EventType[]> = {
  all: EVENT_TYPE_KEYS,
  reading: ['reading_group', 'author_talk', 'poetry_slam', 'book_club', 'storytelling'],
  contests: ['writing_comp', 'reading_comp', 'award'],
  conferences: ['symposium', 'workshop', 'book_fair', 'interschool'],
  school: ['library_visit', 'reading_week'],
  news: ['news', 'pnl_update'],
};

export const EVENT_GROUP_LABELS: Record<string, string> = { all: 'Todos', reading: 'Leitura', contests: 'Concursos', conferences: 'Conferências', school: 'Escola', news: 'Novidades' };

export const EVENT_TYPE_LABELS_PT: Record<EventType, string> = {
  reading_group: 'Grupo de Leitura', author_talk: 'Apresentação de Autor', writing_comp: 'Concurso de Escrita', reading_comp: 'Concurso de Leitura', poetry_slam: 'Recital / Poetry Slam', book_club: 'Clube do Livro', symposium: 'Simpósio / Conferência', workshop: 'Oficina', book_fair: 'Feira do Livro', interschool: 'Evento Interescolar', library_visit: 'Visita à Biblioteca', reading_week: 'Semana da Leitura', storytelling: 'Hora do Conto', news: 'Novidade', award: 'Prémio Literário', pnl_update: 'Atualização PNL'
};

export const EVENT_SCOPE_LABELS_PT: Record<EventScope, string> = { school: 'Escola', district: 'Distrito', regional: 'Regional', national: 'Nacional' };

export const eventIcon = (type: EventType) => {
  if (['reading_group', 'book_club'].includes(type)) return BookOpen;
  if (['author_talk', 'storytelling'].includes(type)) return Users;
  if (type === 'poetry_slam') return Mic2;
  if (['writing_comp', 'reading_comp'].includes(type)) return PenTool;
  if (type === 'award') return Trophy;
  if (['symposium', 'workshop', 'interschool'].includes(type)) return Landmark;
  if (type === 'book_fair') return Library;
  if (['library_visit', 'reading_week'].includes(type)) return CalendarDays;
  if (type === 'pnl_update') return Megaphone;
  if (type === 'news') return Newspaper;
  return Feather;
};

export const eventTone = (type: EventType) => {
  if (EVENT_GROUPS.reading.includes(type)) return { bg: 'bg-emerald-950', text: 'text-emerald-100', border: 'border-emerald-800', chip: 'bg-emerald-950 text-emerald-100', dot: 'bg-emerald-500', gradient: 'from-emerald-950 via-emerald-900 to-background' };
  if (EVENT_GROUPS.contests.includes(type)) return { bg: 'bg-amber-950', text: 'text-amber-100', border: 'border-amber-800', chip: 'bg-amber-950 text-amber-100', dot: 'bg-amber-500', gradient: 'from-amber-950 via-amber-900 to-background' };
  if (EVENT_GROUPS.conferences.includes(type)) return { bg: 'bg-sky-950', text: 'text-sky-100', border: 'border-sky-800', chip: 'bg-sky-950 text-sky-100', dot: 'bg-sky-500', gradient: 'from-sky-950 via-sky-900 to-background' };
  if (EVENT_GROUPS.school.includes(type)) return { bg: 'bg-violet-950', text: 'text-violet-100', border: 'border-violet-800', chip: 'bg-violet-950 text-violet-100', dot: 'bg-violet-500', gradient: 'from-violet-950 via-violet-900 to-background' };
  return { bg: 'bg-muted', text: 'text-foreground', border: 'border-border', chip: 'bg-muted text-foreground', dot: 'bg-muted-foreground', gradient: 'from-muted via-secondary to-background' };
};

export const isRegistrationEvent = (event: Pick<FoliumEvent, 'type' | 'registration_closes_at' | 'registration_limit'>) => !['news', 'pnl_update'].includes(event.type) && Boolean(event.registration_closes_at || event.registration_limit);
export const formatDate = (value?: string | null) => value ? new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)) : '';
export const formatDateTime = (value?: string | null) => value ? new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : '';
export const creatorName = (event: FoliumEvent) => event.entities?.name || [event.profiles?.first_name, event.profiles?.last_name].filter(Boolean).join(' ') || event.profiles?.username || 'Folium';
export const scopeLabel = (event: FoliumEvent) => event.scope === 'school' && event.schools?.name ? event.schools.name : event.scope !== 'national' && event.districts?.name ? `${EVENT_SCOPE_LABELS_PT[event.scope]} de ${event.districts.name}` : EVENT_SCOPE_LABELS_PT[event.scope];
