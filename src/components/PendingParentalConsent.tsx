import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import foliumLogo from '@/assets/folium-logo.svg';
import foliumLogoGold from '@/assets/folium-logo-gold.png';
import { Mail, RefreshCw, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '@/hooks/useTheme';
import { isFoliumDarkTheme } from '@/lib/foliumTheme';

export default function PendingParentalConsent() {
  const { profile, signOut, refreshProfile } = useAuth();
  const { currentTheme } = useTheme();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const logo = isFoliumDarkTheme(currentTheme.id) ? foliumLogoGold : foliumLogo;

  const resend = async () => {
    setResending(true);
    try {
      const { error } = await supabase.functions.invoke('send-parental-consent-email', {
        body: { resend: true },
      });
      if (error) throw error;
      toast.success('Email reenviado para o teu encarregado de educação.');
    } catch (e: any) {
      toast.error(e?.message || 'Não foi possível reenviar.');
    } finally {
      setResending(false);
    }
  };

  const checkStatus = async () => {
    setChecking(true);
    await refreshProfile();
    setChecking(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <img src={logo} alt="Codex" className="w-40 mx-auto mb-6" />
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-secondary mb-4">
          <Mail className="w-6 h-6 text-foreground" />
        </div>
        <h1 className="font-['Cormorant_Garamond'] text-2xl text-foreground mb-3">
          Quase lá!
        </h1>
        <p className="text-sm text-muted-foreground font-['Josefin_Sans'] leading-relaxed mb-2">
          Aguarda a confirmação do teu encarregado de educação por email.
        </p>
        {profile?.parent_email && (
          <p className="text-xs text-muted-foreground mb-6">
            Enviámos para <span className="text-foreground">{profile.parent_email}</span>
          </p>
        )}

        <div className="space-y-2 mt-6">
          <Button onClick={checkStatus} disabled={checking} variant="outline" className="w-full h-11 gap-2">
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            Já confirmaram — verificar
          </Button>
          <Button onClick={resend} disabled={resending} variant="ghost" className="w-full h-11 text-sm">
            {resending ? 'A reenviar…' : 'Reenviar email'}
          </Button>
        </div>

        <button
          onClick={signOut}
          className="mt-8 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="w-3 h-3" /> Sair
        </button>
      </div>
    </div>
  );
}