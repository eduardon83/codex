import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { BadgeCheck, Store, PenLine, Megaphone, ExternalLink, BookOpen, CalendarDays } from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';
import OwlLoader from '@/components/OwlLoader';

type ProRole = 'bookstore' | 'author' | 'influencer';

interface PublicProfile {
  user_id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  pro_entity_name: string | null;
  pro_city: string | null;
  pro_website: string | null;
  pro_platform_url: string | null;
  pro_verified: boolean;
  pro_roles: string[] | null;
}

const ROLE_META: Record<ProRole, { icon: typeof Store; labelKey: string; fallback: string }> = {
  bookstore: { icon: Store, labelKey: 'pro.role.bookstore', fallback: 'Livraria' },
  author: { icon: PenLine, labelKey: 'pro.role.author', fallback: 'Autor/a' },
  influencer: { icon: Megaphone, labelKey: 'pro.role.influencer', fallback: 'Influencer' },
};

export default function PublicProfile() {
  const { t } = useTranslation();
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [lists, setLists] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) return;
    (async () => {
      const { data: prof } = await supabase
        .from('public_profiles')
        .select('*')
        .eq('username', username)
        .maybeSingle();
      if (!prof) { setNotFound(true); setLoading(false); return; }
      setProfile(prof as any);

      const userId = (prof as any).user_id;
      const [{ data: ls }, { data: pls }, { data: evs }] = await Promise.all([
        supabase.from('reading_lists').select('id, name, scope, approval_status, created_at')
          .eq('user_id', userId).eq('approval_status', 'published').eq('scope', 'national')
          .order('created_at', { ascending: false }),
        supabase.from('reading_plans' as any).select('id, name, description, started_at, ends_at, created_at')
          .eq('user_id', userId).eq('is_public', true).eq('is_template', false)
          .order('created_at', { ascending: false }),
        supabase.from('events').select('id, title, starts_at, location, scope, status, approval_status')
          .eq('created_by_user_id', userId).eq('status', 'published').eq('approval_status', 'approved')
          .gte('starts_at', new Date().toISOString())
          .order('starts_at', { ascending: true }).limit(10),
      ]);
      setLists(ls || []);
      setPlans(pls || []);
      setEvents(evs || []);
      setLoading(false);
    })();
  }, [username]);

  useEffect(() => {
    if (profile) document.title = `@${profile.username} · Codex`;
  }, [profile]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><OwlLoader /></div>;
  }
  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          {t('publicProfile.notFound', 'Perfil não encontrado')}
        </h1>
        <Link to="/" className="text-sm text-muted-foreground underline">{t('common.back', 'Voltar')}</Link>
      </div>
    );
  }

  const proRoles = (profile.pro_roles || []).filter(r => ['bookstore','author','influencer'].includes(r)) as ProRole[];
  const isBookstore = proRoles.includes('bookstore');

  return (
    <div className="min-h-screen px-4 py-10 max-w-2xl mx-auto">
      <header className="flex items-start gap-4 mb-8">
        <UserAvatar
          photoUrl={/^https?:/.test(profile.avatar_url || '') ? profile.avatar_url : null}
          firstName={profile.first_name}
          lastName={profile.last_name}
          username={profile.username}
          size={88}
        />
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {profile.pro_entity_name || [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.username}
          </h1>
          {profile.username && <p className="text-sm text-muted-foreground">@{profile.username}</p>}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {proRoles.map(r => {
              const meta = ROLE_META[r];
              const Icon = meta.icon;
              return (
                <span key={r} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs border border-border rounded-full">
                  <Icon className="w-3 h-3" />
                  {t(meta.labelKey, meta.fallback)}
                </span>
              );
            })}
            {profile.pro_verified && proRoles.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-foreground">
                <BadgeCheck className="w-4 h-4" />
                {t('pro.verified', 'Verificado')}
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground mt-2 space-y-0.5">
            {profile.pro_city && <p>{profile.pro_city}</p>}
            {profile.pro_website && (
              <a href={profile.pro_website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline">
                {profile.pro_website.replace(/^https?:\/\//, '')} <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {profile.pro_platform_url && (
              <a href={profile.pro_platform_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline">
                {profile.pro_platform_url.replace(/^https?:\/\//, '')} <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </header>

      <Section title={t('publicProfile.lists', 'Listas públicas')} icon={BookOpen} empty={t('publicProfile.noLists', 'Sem listas públicas ainda.')}>
        {lists.map(l => (
          <li key={l.id} className="border border-border rounded p-3">
            <p className="text-sm" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem' }}>{l.name}</p>
          </li>
        ))}
      </Section>

      <Section title={t('publicProfile.plans', 'Planos públicos')} icon={BookOpen} empty={t('publicProfile.noPlans', 'Sem planos públicos ainda.')}>
        {plans.map(p => (
          <li key={p.id} className="border border-border rounded p-3">
            <p className="text-sm" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem' }}>{p.name}</p>
            {p.description && <p className="text-xs text-muted-foreground mt-1">{p.description}</p>}
          </li>
        ))}
      </Section>

      {isBookstore && (
        <Section title={t('publicProfile.events', 'Próximos eventos')} icon={CalendarDays} empty={t('publicProfile.noEvents', 'Sem eventos agendados.')}>
          {events.map(e => (
            <li key={e.id} className="border border-border rounded p-3">
              <p className="text-sm" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem' }}>{e.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(e.starts_at).toLocaleString()}{e.location ? ` · ${e.location}` : ''}
              </p>
            </li>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, icon: Icon, empty, children }: { title: string; icon: any; empty: string; children: React.ReactNode }) {
  const items = Array.isArray(children) ? children : [children];
  const hasContent = items.some(Boolean) && (children as any)?.length !== 0;
  return (
    <section className="mb-8">
      <h2 className="flex items-center gap-2 text-lg mb-3 text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        <Icon className="w-4 h-4" /> {title}
      </h2>
      {hasContent ? <ul className="space-y-2">{children}</ul> : <p className="text-xs text-muted-foreground italic">{empty}</p>}
    </section>
  );
}
