import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { BadgeCheck, ExternalLink, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

type ProRole = 'bookstore' | 'author' | 'influencer';

interface ListRow { id: string; name: string; scope: string; approval_status: string }
interface PlanRow { id: string; name: string; is_public: boolean; is_template: boolean }

export default function ProContentSection() {
  const { t } = useTranslation();
  const { user, profile, refreshProfile } = useAuth();
  const [roles, setRoles] = useState<ProRole[]>([]);
  const [lists, setLists] = useState<ListRow[]>([]);
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    pro_entity_name: '',
    pro_city: '',
    pro_website: '',
    pro_platform_url: '',
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: r } = await supabase.from('user_roles' as any).select('role').eq('user_id', user.id);
      const proRoles = ((r || []) as any[])
        .map(x => x.role as string)
        .filter(role => ['bookstore', 'author', 'influencer'].includes(role)) as ProRole[];
      setRoles(proRoles);

      if (proRoles.length === 0) { setLoading(false); return; }

      const [{ data: ls }, { data: pls }] = await Promise.all([
        supabase.from('reading_lists').select('id, name, scope, approval_status').eq('user_id', user.id),
        supabase.from('reading_plans' as any).select('id, name, is_public, is_template').eq('user_id', user.id).eq('is_template', false),
      ]);
      setLists((ls as any) || []);
      setPlans((pls as any) || []);
      setLoading(false);
    })();
  }, [user]);

  useEffect(() => {
    if (profile) {
      setForm({
        pro_entity_name: (profile as any).pro_entity_name || '',
        pro_city: (profile as any).pro_city || '',
        pro_website: (profile as any).pro_website || '',
        pro_platform_url: (profile as any).pro_platform_url || '',
      });
    }
  }, [profile]);

  if (loading || roles.length === 0) return null;

  const saveProInfo = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update(form as any).eq('user_id', user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    await refreshProfile();
    toast.success(t('pro.profileSaved', 'Perfil profissional guardado'));
  };

  const toggleListPublic = async (list: ListRow, makePublic: boolean) => {
    const updates = makePublic
      ? { scope: 'national', approval_status: 'published' }
      : { scope: 'private', approval_status: 'draft' };
    const { error } = await supabase.from('reading_lists').update(updates as any).eq('id', list.id);
    if (error) { toast.error(error.message); return; }
    setLists(prev => prev.map(l => l.id === list.id ? { ...l, ...updates } : l));
  };

  const togglePlanPublic = async (plan: PlanRow, makePublic: boolean) => {
    const { error } = await supabase.from('reading_plans' as any).update({ is_public: makePublic }).eq('id', plan.id);
    if (error) { toast.error(error.message); return; }
    setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, is_public: makePublic } : p));
  };

  const isVerified = (profile as any)?.pro_verified === true;
  const username = profile?.username;
  const profileUrl = username ? `${window.location.origin}/u/${username}` : null;

  return (
    <div className="mt-8 border-t border-border pt-5 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-muted-foreground">{t('pro.section.title', 'Conteúdo público')}</p>
        <div className="flex items-center gap-2">
          {roles.map(r => (
            <Badge key={r} variant="secondary" className="text-[11px]">
              {t(`pro.role.${r}`, r)}
            </Badge>
          ))}
          {isVerified && (
            <span className="inline-flex items-center gap-0.5 text-xs text-foreground">
              <BadgeCheck className="w-4 h-4" /> {t('pro.verified', 'Verificado')}
            </span>
          )}
        </div>
      </div>

      {profileUrl && (
        <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs underline text-muted-foreground">
          {profileUrl} <ExternalLink className="w-3 h-3" />
        </a>
      )}

      {/* Pro profile fields */}
      <div className="space-y-2">
        <Input
          value={form.pro_entity_name}
          onChange={e => setForm(f => ({ ...f, pro_entity_name: e.target.value }))}
          placeholder={t('pro.fields.entityName', 'Nome (livraria, autor, etc.)')}
          className="bg-background border-border text-sm h-9"
        />
        <Input
          value={form.pro_city}
          onChange={e => setForm(f => ({ ...f, pro_city: e.target.value }))}
          placeholder={t('pro.fields.city', 'Cidade')}
          className="bg-background border-border text-sm h-9"
        />
        <Input
          value={form.pro_website}
          onChange={e => setForm(f => ({ ...f, pro_website: e.target.value }))}
          placeholder={t('pro.fields.website', 'Website (https://...)')}
          className="bg-background border-border text-sm h-9"
        />
        <Input
          value={form.pro_platform_url}
          onChange={e => setForm(f => ({ ...f, pro_platform_url: e.target.value }))}
          placeholder={t('pro.fields.platform', 'Instagram / TikTok / YouTube')}
          className="bg-background border-border text-sm h-9"
        />
        <Button onClick={saveProInfo} disabled={saving} size="sm" variant="outline" className="w-full">
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Save className="w-3 h-3 mr-1" /> {t('common.save', 'Guardar')}</>}
        </Button>
      </div>

      {/* Lists */}
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
          {t('pro.lists.title', 'Listas — tornar públicas')}
        </p>
        {lists.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">{t('pro.lists.empty', 'Ainda não tens listas. Cria uma em "Listas".')}</p>
        ) : (
          <ul className="space-y-1.5">
            {lists.map(l => {
              const isPublic = l.scope === 'national' && l.approval_status === 'published';
              return (
                <li key={l.id} className="flex items-center justify-between gap-2 text-sm border border-border rounded px-3 py-2">
                  <span className="truncate">{l.name}</span>
                  <Switch checked={isPublic} onCheckedChange={(v) => toggleListPublic(l, v)} />
                </li>
              );
            })}
          </ul>
        )}
        <p className="text-[11px] text-muted-foreground mt-2 italic">
          {t('pro.publicNote', 'Esta lista será visível a todos os utilizadores do Codex.')}
        </p>
      </div>

      {/* Plans */}
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
          {t('pro.plans.title', 'Planos — tornar públicos')}
        </p>
        {plans.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">{t('pro.plans.empty', 'Ainda não tens planos. Cria um em "Planos".')}</p>
        ) : (
          <ul className="space-y-1.5">
            {plans.map(p => (
              <li key={p.id} className="flex items-center justify-between gap-2 text-sm border border-border rounded px-3 py-2">
                <span className="truncate">{p.name}</span>
                <Switch checked={p.is_public} onCheckedChange={(v) => togglePlanPublic(p, v)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
