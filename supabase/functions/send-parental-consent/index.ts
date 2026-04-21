import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

function consentUrl(token: string): string {
  const origin = Deno.env.get('PUBLIC_APP_URL') || 'https://foliumlibrary.lovable.app';
  return `${origin}/parental-consent?token=${encodeURIComponent(token)}`;
}

function buildHtml(childName: string, url: string): string {
  return `<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;background:#fafaf8;padding:24px;color:#2c2a26">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;padding:32px;border:1px solid #f0ede8;border-radius:6px">
    <h1 style="font-family:Georgia,serif;font-size:24px;margin:0 0 12px">Folium</h1>
    <p style="font-size:15px;line-height:1.5;margin:0 0 16px">Olá,</p>
    <p style="font-size:15px;line-height:1.5;margin:0 0 16px">
      <strong>${escapeHtml(childName)}</strong> registou-se no Folium, uma aplicação de partilha de livros entre estudantes.
      Como tem menos de 18 anos, precisamos do seu consentimento como encarregado de educação.
    </p>
    <p style="font-size:15px;line-height:1.5;margin:0 0 24px">
      Se autoriza esta utilização, clique no botão abaixo:
    </p>
    <p style="text-align:center;margin:0 0 24px">
      <a href="${url}" style="display:inline-block;background:#2c2a26;color:#fafaf8;padding:12px 24px;text-decoration:none;border-radius:4px;font-size:14px">
        Autorizar conta
      </a>
    </p>
    <p style="font-size:12px;color:#6b8e7f;line-height:1.5;margin:24px 0 0">
      Se não reconhece este pedido, pode ignorar este email.
    </p>
  </div>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    let { token, parentEmail, childName } = body as { token?: string; parentEmail?: string; childName?: string };
    const resend = body.resend === true;

    // For resend, look up profile to get current values
    if (resend || !token || !parentEmail) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, parent_email, parent_consent_token')
        .eq('user_id', userId)
        .maybeSingle();
      if (!profile?.parent_email || !profile?.parent_consent_token) {
        return new Response(JSON.stringify({ error: 'No pending consent' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      token = profile.parent_consent_token;
      parentEmail = profile.parent_email;
      childName = childName || profile.first_name || 'O seu educando';
    }

    const url = consentUrl(token!);
    const html = buildHtml(childName || 'O seu educando', url);

    // Enqueue email through existing pgmq infrastructure
    const { error: enqErr } = await supabase.rpc('enqueue_email', {
      queue_name: 'transactional_emails',
      payload: {
        to: parentEmail,
        subject: 'Folium — Autorização para conta de menor',
        html,
        template_name: 'parental_consent',
        metadata: { user_id: userId },
      },
    });

    if (enqErr) {
      console.error('enqueue_email error', enqErr);
      return new Response(JSON.stringify({ error: enqErr.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});