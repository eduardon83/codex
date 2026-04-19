import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function ProfileSetup() {
  const { t } = useTranslation();
  const { user, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    location: '',
    bio: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setLoading(true);

    const { error: err } = await supabase
      .from('profiles')
      .update({
        ...form,
        profile_completed: true,
      })
      .eq('user_id', user.id);

    if (err) {
      setError(err.message);
    } else {
      await refreshProfile();
    }
    setLoading(false);
  };

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-3xl text-foreground mb-2 text-center">{t('profileSetup.welcome')}</h1>
        <p className="text-muted-foreground text-sm text-center mb-8">
          {t('profileSetup.tellUs')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <Input placeholder={t('profileSetup.firstName')} value={form.first_name} onChange={e => update('first_name', e.target.value)} required className="bg-background border-border h-11 text-sm" />
            <Input placeholder={t('profileSetup.lastName')} value={form.last_name} onChange={e => update('last_name', e.target.value)} required className="bg-background border-border h-11 text-sm" />
          </div>
          <Input placeholder={t('profileSetup.username')} value={form.username} onChange={e => update('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} required className="bg-background border-border h-11 text-sm" />
          <Input placeholder={t('profileSetup.locationPlaceholder')} value={form.location} onChange={e => update('location', e.target.value)} className="bg-background border-border h-11 text-sm" />
          <Textarea placeholder={t('profileSetup.bioPlaceholder')} value={form.bio} onChange={e => update('bio', e.target.value)} maxLength={280} rows={3} className="bg-background border-border text-sm resize-none" />

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button type="submit" className="w-full h-11" disabled={loading}>
            {loading ? t('profileSetup.saving') : t('profileSetup.continue')}
          </Button>
        </form>
      </div>
    </div>
  );
}
