const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
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

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401);
  const token = authHeader.slice('Bearer '.length).trim();
  if (token !== SERVICE_KEY) return json({ error: 'Forbidden' }, 403);

  if (!LOVABLE_API_KEY || !RESEND_API_KEY) {
    return json({ error: 'Resend not configured' }, 500);
  }

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

  const resp = await fetch(`${GATEWAY_URL}/emails`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'X-Connection-Api-Key': RESEND_API_KEY,
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  const respBody = await resp.text();
  if (!resp.ok) {
    console.error('Resend send failed', resp.status, respBody);
    return json({ error: 'Resend send failed', status: resp.status, body: respBody }, 502);
  }

  let parsed: any = {};
  try { parsed = JSON.parse(respBody); } catch { /* ignore */ }
  return json({ success: true, id: parsed?.id ?? null });
});
