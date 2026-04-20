// Daily job: flip overdue loan_requests, send 3-day reminders & 48h confirm reminders.
// Triggered by pg_cron via supabase.insert (see migration setup in user instructions).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const now = new Date()
  const nowIso = now.toISOString()
  const in3Days = new Date(now.getTime() + 3 * 86400000).toISOString()
  const ago48h = new Date(now.getTime() - 48 * 3600000).toISOString()

  // 1) Flip past-due to 'overdue'
  const { data: overdueRows, error: e1 } = await supabase
    .from('loan_requests')
    .update({ status: 'overdue' })
    .in('status', ['accepted', 'in_progress'])
    .lt('due_date', nowIso)
    .select('id')

  // 2) Mark 3-day reminder window (idempotent via reminder_3day_sent_at)
  const { data: dueSoon, error: e2 } = await supabase
    .from('loan_requests')
    .update({ reminder_3day_sent_at: nowIso })
    .in('status', ['accepted', 'in_progress'])
    .gte('due_date', nowIso)
    .lte('due_date', in3Days)
    .is('reminder_3day_sent_at', null)
    .select('id')

  // 3) 48h single-side confirmation reminder
  const { data: halfReturned, error: e3 } = await supabase
    .from('loan_requests')
    .update({ reminder_confirm_sent_at: nowIso })
    .in('status', ['accepted', 'in_progress', 'overdue'])
    .or('borrower_confirmed_return.eq.true,lender_confirmed_return.eq.true')
    .lte('updated_at', ago48h)
    .is('reminder_confirm_sent_at', null)
    .select('id')

  return new Response(JSON.stringify({
    overdue: overdueRows?.length ?? 0,
    due_soon: dueSoon?.length ?? 0,
    half_returned: halfReturned?.length ?? 0,
    errors: [e1?.message, e2?.message, e3?.message].filter(Boolean),
  }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
})
