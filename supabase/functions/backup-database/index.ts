import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TABLES = [
  'profiles',
  'libraries',
  'books',
  'loans',
  'loan_requests',
  'reading_history',
  'reading_lists',
  'reading_list_books',
  'library_cards',
  'book_cache',
  'app_content',
  'saved_libraries',
  'user_favourites',
  'admin_audit_log',
  'admin_users',
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!

  const adminClient = createClient(supabaseUrl, serviceRoleKey)

  // Optional: if called with an Authorization header, require admin (for manual UI trigger)
  let actingAdminId: string | null = null
  const authHeader = req.headers.get('Authorization')
  if (authHeader && !authHeader.includes(serviceRoleKey)) {
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const { data: adminRecord } = await adminClient
      .from('admin_users').select('id').eq('user_id', user.id).single()
    if (!adminRecord) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    actingAdminId = user.id
  }

  const startedAt = new Date()
  const dateStr = startedAt.toISOString().slice(0, 10)
  const filename = `backup-${dateStr}.json`

  try {
    const dump: Record<string, unknown> = {
      generated_at: startedAt.toISOString(),
      tables: {},
    }
    const counts: Record<string, number> = {}

    for (const table of TABLES) {
      const { data, error } = await adminClient.from(table).select('*')
      if (error) {
        console.warn(`Failed to dump ${table}:`, error.message)
        ;(dump.tables as Record<string, unknown>)[table] = { error: error.message }
        counts[table] = -1
      } else {
        ;(dump.tables as Record<string, unknown>)[table] = data
        counts[table] = data?.length ?? 0
      }
    }

    const json = JSON.stringify(dump, null, 2)
    const fileSize = new Blob([json]).size

    // Upload to backups bucket
    const { error: uploadError } = await adminClient.storage
      .from('backups')
      .upload(filename, new Blob([json], { type: 'application/json' }), {
        upsert: true,
        contentType: 'application/json',
      })

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

    // Delete files older than 90 days
    const { data: files } = await adminClient.storage.from('backups').list('', {
      limit: 1000,
      sortBy: { column: 'name', order: 'asc' },
    })
    const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000
    const toDelete: string[] = []
    for (const f of files ?? []) {
      const created = f.created_at ? new Date(f.created_at).getTime() : 0
      if (created && created < cutoff) toDelete.push(f.name)
    }
    if (toDelete.length > 0) {
      await adminClient.storage.from('backups').remove(toDelete)
    }

    const sizeKb = (fileSize / 1024).toFixed(1)
    const details = `Backup ${filename} • ${sizeKb} KB • rows: ${JSON.stringify(counts)} • pruned: ${toDelete.length}`

    await adminClient.from('admin_audit_log').insert({
      admin_user_id: actingAdminId ?? '00000000-0000-0000-0000-000000000000',
      action: 'database_backup_success',
      details,
      ip_address: req.headers.get('x-forwarded-for') ?? 'cron',
    })

    return new Response(JSON.stringify({
      success: true, filename, size_bytes: fileSize, counts, pruned: toDelete.length,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Backup failed:', message)
    await adminClient.from('admin_audit_log').insert({
      admin_user_id: actingAdminId ?? '00000000-0000-0000-0000-000000000000',
      action: 'database_backup_failure',
      details: `Backup ${filename} failed: ${message}`,
      ip_address: req.headers.get('x-forwarded-for') ?? 'cron',
    }).then(() => {})
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
