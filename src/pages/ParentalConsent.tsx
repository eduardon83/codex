import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import foliumLogo from '@/assets/folium-logo.svg';
import foliumLogoGold from '@/assets/folium-logo-gold.png';
import { Loader2, Check, X } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { isFoliumDarkTheme } from '@/lib/foliumTheme';

interface ConsentRequest {
  first_name: string | null;
  age: number | null;
  language: string | null;
}

export default function ParentalConsent() {
  const { t } = useTranslation();
  const { currentTheme } = useTheme();
  const [status, setStatus] = useState<'loading' | 'ready' | 'success' | 'invalid'>('loading');
  const [request, setRequest] = useState<ConsentRequest | null>(null);
  const [approving, setApproving] = useState(false);
  const logo = isFoliumDarkTheme(currentTheme.id) ? foliumLogoGold : foliumLogo;
  const token = new URLSearchParams(window.location.search).get('token') || '';

  useEffect(() => {
    if (!token) { setStatus('invalid'); return; }
    (supabase.rpc as any)('get_parental_consent_request', { _token: token })
      .then(({ data, error }: any) => {
        const row = data?.[0];
        if (error || !row) setStatus('invalid');
        else { setRequest(row); setStatus('ready'); }
      });
  }, [token]);

  const approve = async () => {
    setApproving(true);
    const { data, error } = await (supabase.rpc as any)('grant_parental_consent', { _token: token });
    const row = data?.[0];
    setApproving(false);
    if (error || !row) { setStatus('invalid'); return; }
    setRequest(prev => ({ ...(prev || {}), first_name: row.first_name }));
    setStatus('success');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md text-center">
        <img src={logo} alt="Folium" className="w-40 mx-auto mb-6" />
        {status === 'loading' && <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto" />}
        {status === 'invalid' && (
          <><X className="w-10 h-10 text-destructive mx-auto mb-4" /><p className="text-sm text-muted-foreground">{t('consent.invalid')}</p></>
        )}
        {status === 'ready' && request && (
          <div className="text-left space-y-5">
            <h1 className="font-['Cormorant_Garamond'] text-3xl text-foreground text-center">{t('consent.title')}</h1>
            <p className="text-sm text-muted-foreground text-center">{t('consent.intro', { name: request.first_name, age: request.age })}</p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
              <li>{t('consent.pointLibrary')}</li><li>{t('consent.pointLoans')}</li><li>{t('consent.pointSchool')}</li>
            </ul>
            <p className="text-xs text-muted-foreground text-center">
              <a className="underline" href="/terms">{t('legal.termsTitle')}</a>{' · '}<a className="underline" href="/privacy">{t('legal.privacyTitle')}</a>
            </p>
            <Button onClick={approve} disabled={approving} className="w-full h-12">{approving ? t('app.loading') : t('consent.authorize')}</Button>
          </div>
        )}
        {status === 'success' && (
          <><Check className="w-10 h-10 text-foreground mx-auto mb-4" /><h1 className="font-['Cormorant_Garamond'] text-2xl text-foreground mb-3">{t('consent.successTitle')}</h1><p className="text-sm text-muted-foreground">{t('consent.successBody', { name: request?.first_name || '' })}</p></>
        )}
      </div>
    </div>
  );
}