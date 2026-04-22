import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SENDER_DOMAIN = 'notify.folium.kendirstudios.pt';
const FROM_DOMAIN = 'folium.kendirstudios.pt';
const APP_URL = 'https://folium.kendirstudios.pt';
const CONTACT_EMAIL = 'folium@kendirstudios.pt';

type Language = 'pt' | 'en' | 'fr' | 'es';

interface ConsentEmailBody {
  parent_email?: string;
  child_name?: string;
  child_age?: number;
  child_language?: string;
  consent_token?: string;
  consent_expires_at?: string;
  resend?: boolean;
}

const subjectByLanguage: Record<Language, string> = {
  pt: 'O teu filho/educando quer criar uma conta no Folium',
  en: 'Your child wants to create a Folium account',
  fr: 'Votre enfant souhaite créer un compte Folium',
  es: 'Tu hijo/a quiere crear una cuenta en Folium',
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function language(value?: string): Language {
  return value === 'en' || value === 'fr' || value === 'es' || value === 'pt' ? value : 'pt';
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}

function textTemplate(lang: Language, childName: string, childAge: number, confirmUrl: string): string {
  const privacy = `${APP_URL}/privacy`;
  const terms = `${APP_URL}/terms`;
  const templates: Record<Language, string> = {
    pt: `Olá, ${childName} (${childAge} anos) criou uma conta no Folium — uma aplicação para gerir uma biblioteca pessoal e emprestar livros entre colegas da escola. Como ${childName} tem menos de 18 anos, precisamos da sua autorização antes de activar a conta. Para autorizar, clique aqui: ${confirmUrl}. Este link é válido durante 7 dias. Se não autorizar, a conta será automaticamente eliminada. Pode solicitar ver, alterar ou eliminar os dados do seu filho/educando a qualquer momento escrevendo para ${CONTACT_EMAIL}. Política de Privacidade completa: ${privacy} — Termos e Condições: ${terms}. Obrigado, A Equipa Folium.`,
    en: `Hello, ${childName} (${childAge} years old) has created a Folium account — an app for managing a personal book library and lending books between schoolmates. As ${childName} is under 18, we need your authorisation before activating the account. To authorise, click here: ${confirmUrl}. This link is valid for 7 days. If you do not authorise, the account will be automatically deleted. You can request to view, edit or delete your child's data at any time by emailing ${CONTACT_EMAIL}. Full Privacy Policy: ${privacy} — Terms & Conditions: ${terms}. Thank you, The Folium Team.`,
    fr: `Bonjour, ${childName} (${childAge} ans) a créé un compte sur Folium — une application pour gérer une bibliothèque personnelle et prêter des livres entre camarades. Comme ${childName} a moins de 18 ans, nous avons besoin de votre autorisation avant d'activer le compte. Pour autoriser, cliquez ici : ${confirmUrl}. Ce lien est valable 7 jours. Si vous n'autorisez pas, le compte sera automatiquement supprimé. Vous pouvez demander à consulter, modifier ou supprimer les données de votre enfant à tout moment en écrivant à ${CONTACT_EMAIL}. Politique de confidentialité complète : ${privacy} — Conditions d'utilisation : ${terms}. Merci, L'équipe Folium.`,
    es: `Hola, ${childName} (${childAge} años) ha creado una cuenta en Folium — una aplicación para gestionar una biblioteca personal y prestar libros entre compañeros de escuela. Como ${childName} tiene menos de 18 años, necesitamos tu autorización antes de activar la cuenta. Para autorizar, haz clic aquí: ${confirmUrl}. Este enlace es válido durante 7 días. Si no autorizas, la cuenta se eliminará automáticamente. Puedes solicitar ver, modificar o eliminar los datos de tu hijo/a en cualquier momento escribiendo a ${CONTACT_EMAIL}. Política de privacidad completa: ${privacy} — Términos y condiciones: ${terms}. Gracias, El equipo de Folium.`,
  };
  return templates[lang];
}

function htmlTemplate(lang: Language, childName: string, childAge: number, confirmUrl: string): string {
  const paragraphs = textTemplate(lang, childName, childAge, confirmUrl).split(/(?<=\.)\s+/);
  const cta = lang === 'fr' ? 'Autoriser le compte' : lang === 'es' ? 'Autorizar cuenta' : lang === 'en' ? 'Authorise account' : 'Autorizar conta';
  return `<!DOCTYPE html><html><body style="margin:0;background:#ffffff;color:#2c2a26;font-family:Arial,sans-serif;padding:24px"><main style="max-width:560px;margin:0 auto;border:1px solid #e7e0d6;padding:32px"><h1 style="font-family:Georgia,serif;font-size:28px;margin:0 0 20px;color:#2c2a26">Folium</h1>${paragraphs.map((p) => `<p style="font-size:15px;line-height:1.6;margin:0 0 14px">${escapeHtml(p)}</p>`).join('')}<p style="text-align:center;margin:28px 0"><a href="${confirmUrl}" style="display:inline-block;background:#2c2a26;color:#ffffff;text-decoration:none;padding:13px 24px;border-radius:4px;font-size:14px">${cta}</a></p></main></body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401);

    const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) return json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
    const input = await req.json().catch(() => ({})) as ConsentEmailBody;
    let parentEmail = input.parent_email;
    let childName = input.child_name;
    let childAge = input.child_age;
    let childLanguage = language(input.child_language);
    let token = input.consent_token;
    let expiresAt = input.consent_expires_at;

    if (input.resend || !parentEmail || !childName || !childAge || !token || !expiresAt) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('parent_email, first_name, date_of_birth, language, parent_consent_token, parent_consent_expires_at')
        .eq('user_id', userData.user.id)
        .maybeSingle();
      if (!profile?.parent_email || !profile?.parent_consent_token || !profile?.parent_consent_expires_at) return json({ error: 'No pending consent' }, 400);
      parentEmail = profile.parent_email;
      childName = profile.first_name || 'Folium';
      childLanguage = language(profile.language);
      token = profile.parent_consent_token;
      expiresAt = profile.parent_consent_expires_at;
      if (profile.date_of_birth) {
        const birth = new Date(profile.date_of_birth);
        const today = new Date();
        childAge = today.getFullYear() - birth.getFullYear();
        if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) childAge--;
      }
    }

    if (!parentEmail || !childName || !childAge || childAge < 13 || childAge > 17 || !token || !expiresAt) return json({ error: 'Invalid consent email request' }, 400);

    const confirmUrl = `${APP_URL}/consent?token=${encodeURIComponent(token)}`;
    const subject = subjectByLanguage[childLanguage];
    const text = textTemplate(childLanguage, childName, childAge, confirmUrl);
    const html = htmlTemplate(childLanguage, childName, childAge, confirmUrl);
    const messageId = `parental-consent-${userData.user.id}-${Date.now()}`;

    const { error } = await supabase.rpc('enqueue_email', {
      queue_name: 'transactional_emails',
      payload: {
        to: parentEmail,
        from: `Folium <no-reply@${FROM_DOMAIN}>`,
        sender_domain: SENDER_DOMAIN,
        subject,
        html,
        text,
        purpose: 'transactional',
        label: 'parental_consent',
        idempotency_key: messageId,
        message_id: messageId,
        queued_at: new Date().toISOString(),
        metadata: { user_id: userData.user.id, consent_expires_at: expiresAt },
      },
    });
    if (error) return json({ error: error.message }, 500);
    await supabase.from('email_send_log').insert({ message_id: messageId, template_name: 'parental_consent', recipient_email: parentEmail, status: 'pending' });
    return json({ success: true });
  } catch (error) {
    console.error(error);
    return json({ error: String(error) }, 500);
  }
});