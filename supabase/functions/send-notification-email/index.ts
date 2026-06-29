import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend';

const FROM_ADDRESS = 'Codex <codex@kendirstudios.pt>';
const APP_URL = 'https://codex.kendirstudios.pt';

interface NotificationBody {
  to?: string;
  subject?: string;
  body_html?: string;
  action_label?: string;
  action_url?: string;
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

function buildHtml(body: string, actionLabel: string, actionUrl: string): string {
  const safeUrl = actionUrl.replace(/"/g, '%22');
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;background:#ffffff;color:#2c2a26;font-family:Arial,sans-serif;padding:24px">
    <main style="max-width:560px;margin:0 auto;border:1px solid #e7e0d6;padding:32px">
      <h1 style="font-family:Georgia,serif;font-size:28px;margin:0 0 24px;color:#2c2a26">Codex</h1>
      <div style="font-size:15px;line-height:1.6;margin:0 0 28px">
        <p style="margin:0">${escapeHtml(body)}</p>
      </div>
      <p style="text-align:center;margin:28px 0">
        <a href="${safeUrl}" style="display:inline-block;background:#2c2a26;color:#ffffff;text-decoration:none;padding:13px 24px;border-radius:4px;font-size:14px">${escapeHtml(actionLabel)}</a>
      </p>
      <hr style="border:none;border-top:1px solid #e7e0d6;margin:32px 0 16px" />
      <p style="font-size:11px;color:#8a857d;line-height:1.5;margin:0">
        Codex · Worlds4Education — Kendir Studios · Vila Nova de Gaia · Portugal<br/>
        <a href="${APP_URL}" style="color:#8a857d">codex.kendirstudios.pt</a>
      </p>
    </main>
  </body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  // Diagnostic logging (never logs secret values)
  console.log('[send-notification-email] env check', {
    has_LOVABLE_API_KEY: !!LOVABLE_API_KEY,
    has_RESEND_API_KEY: !!RESEND_API_KEY,
    resend_key_prefix_ok: RESEND_API_KEY ? RESEND_API_KEY.startsWith('re_') : false,
    resend_key_length: RESEND_API_KEY ? RESEND_API_KEY.length : 0,
    from_address: FROM_ADDRESS,
    gateway_url: GATEWAY_URL,
  });

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401);
  const token = authHeader.slice('Bearer '.length).trim();

  // Allow either: service-role key (server-to-server) OR an authenticated admin user.
  let authorized = token === SERVICE_KEY;
  if (!authorized) {
    try {
      const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const { data: userData, error: userErr } = await userClient.auth.getUser();
      if (userErr || !userData?.user) {
        console.warn('[send-notification-email] auth getUser failed', userErr?.message);
        return json({ error: 'Unauthorized' }, 401);
      }
      const admin = createClient(SUPABASE_URL, SERVICE_KEY);
      const { data: isAdmin, error: roleErr } = await admin.rpc('has_role', {
        _user_id: userData.user.id,
        _role: 'admin',
      });
      if (roleErr) {
        console.error('[send-notification-email] has_role error', roleErr.message);
        return json({ error: 'Role check failed' }, 500);
      }
      if (!isAdmin) return json({ error: 'Forbidden' }, 403);
      authorized = true;
    } catch (e) {
      console.error('[send-notification-email] auth check threw', (e as Error).message);
      return json({ error: 'Unauthorized' }, 401);
    }
  }

  if (!LOVABLE_API_KEY || !RESEND_API_KEY) {
    return json({
      error: 'Resend not configured',
      detail: {
        has_LOVABLE_API_KEY: !!LOVABLE_API_KEY,
        has_RESEND_API_KEY: !!RESEND_API_KEY,
      },
    }, 500);
  }
  // Note: when using Lovable's Resend connector, RESEND_API_KEY is a gateway
  // connection key (not necessarily prefixed with re_). Do not validate format here.



  let input: NotificationBody;
  try { input = (await req.json()) as NotificationBody; } catch { return json({ error: 'Invalid JSON' }, 400); }

  const to = (input.to || '').trim();
  const subject = (input.subject || '').trim();
  const bodyText = (input.body_html || '').trim();
  const actionLabel = (input.action_label || 'Abrir Codex').trim();
  const actionUrl = (input.action_url || APP_URL).trim();

  if (!to || !subject || !bodyText) return json({ error: 'Missing to, subject or body_html' }, 400);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return json({ error: 'Invalid recipient email' }, 400);
  if (subject.length > 200 || bodyText.length > 4000 || actionLabel.length > 60 || actionUrl.length > 500) {
    return json({ error: 'Field too long' }, 400);
  }

  const html = buildHtml(bodyText, actionLabel, actionUrl);
  const text = `${bodyText}\n\n${actionLabel}: ${actionUrl}\n\nCodex · codex.kendirstudios.pt`;

  const payload = { from: FROM_ADDRESS, to: [to], subject, html, text };
  console.log('[send-notification-email] sending via Resend gateway', { to, subject, from: FROM_ADDRESS });

  let resp: Response;
  try {
    resp = await fetch(`${GATEWAY_URL}/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': RESEND_API_KEY,
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error('[send-notification-email] fetch threw', (e as Error).message);
    return json({ error: 'Network error calling Resend gateway', detail: (e as Error).message }, 502);
  }

  const respBody = await resp.text();
  console.log('[send-notification-email] Resend response', { status: resp.status, body: respBody.slice(0, 1000) });

  if (!resp.ok) {
    return json({ error: 'Resend send failed', status: resp.status, body: respBody }, 502);
  }

  let parsed: any = {};
  try { parsed = JSON.parse(respBody); } catch { /* ignore */ }
  return json({ success: true, id: parsed?.id ?? null });
});
