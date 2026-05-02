import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';

export default function AdminSystem() {
  const [loading, setLoading] = useState(false);

  const sendTest = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-notification-email', {
        body: {
          to: 'folium@kendirstudios.pt',
          subject: '[Codex] Teste de notificação',
          body_html: 'Este é um email de teste do sistema de notificações do Codex. Se estás a ler isto, está tudo a funcionar.',
          action_label: 'Abrir backoffice',
          action_url: 'https://folium.kendirstudios.pt/admin',
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success('Email de teste enviado', { description: 'Verifica a caixa de entrada de folium@kendirstudios.pt.' });
    } catch (err: any) {
      toast.error('Falhou o envio', { description: err.message || 'Erro desconhecido' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-['Cormorant_Garamond'] text-3xl font-semibold text-foreground">Sistema</h1>
        <p className="text-sm text-muted-foreground font-['Josefin_Sans'] mt-1">
          Ferramentas de diagnóstico e operação.
        </p>
      </div>

      <section className="border border-border rounded-md p-5 bg-card max-w-xl">
        <h2 className="font-['Cormorant_Garamond'] text-lg font-semibold text-foreground mb-1">
          Notificações por email
        </h2>
        <p className="text-xs text-muted-foreground font-['Josefin_Sans'] mb-4">
          Envia um email de teste para folium@kendirstudios.pt para verificar que o sistema de notificações está operacional.
        </p>
        <Button onClick={sendTest} disabled={loading} variant="outline">
          <Mail className="w-4 h-4 mr-2" />
          {loading ? 'A enviar…' : 'Testar email de notificação'}
        </Button>
      </section>
    </div>
  );
}
