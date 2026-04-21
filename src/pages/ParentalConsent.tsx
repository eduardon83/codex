import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import foliumLogo from '@/assets/folium-logo.svg';
import { Loader2, Check, X } from 'lucide-react';

export default function ParentalConsent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'invalid'>('loading');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) { setStatus('invalid'); return; }
    supabase.rpc('confirm_parental_consent', { _token: token })
      .then(({ data, error }) => {
        if (error || !data) setStatus('invalid');
        else setStatus('success');
      });
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <img src={foliumLogo} alt="Folium" className="w-40 mx-auto mb-6" />
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">A confirmar…</p>
          </div>
        )}
        {status === 'success' && (
          <>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-secondary mb-4">
              <Check className="w-7 h-7 text-foreground" />
            </div>
            <h1 className="font-['Cormorant_Garamond'] text-2xl text-foreground mb-3">Conta autorizada</h1>
            <p className="text-sm text-muted-foreground">
              Obrigado. O seu educando pode agora usar o Folium.
            </p>
          </>
        )}
        {status === 'invalid' && (
          <>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-destructive/10 mb-4">
              <X className="w-7 h-7 text-destructive" />
            </div>
            <h1 className="font-['Cormorant_Garamond'] text-2xl text-foreground mb-3">Link inválido</h1>
            <p className="text-sm text-muted-foreground">
              Este link já foi usado ou expirou. Peça ao seu educando para reenviar o pedido.
            </p>
          </>
        )}
      </div>
    </div>
  );
}