import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DISTRICTS = [
  'Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco', 'Coimbra', 'Évora',
  'Faro', 'Guarda', 'Leiria', 'Lisboa', 'Portalegre', 'Porto', 'Santarém',
  'Setúbal', 'Viana do Castelo', 'Vila Real', 'Viseu',
  'Ilha Terceira', 'Ilha da Graciosa', 'Ilha das Flores', 'Ilha de Santa Maria',
  'Ilha de São Jorge', 'Ilha de São Miguel', 'Ilha do Corvo', 'Ilha do Faial',
  'Ilha do Pico', 'Ilha da Madeira', 'Ilha de Porto Santo',
]

const AZORES_ISLANDS = new Set([
  'Ilha Terceira', 'Ilha da Graciosa', 'Ilha das Flores', 'Ilha de Santa Maria',
  'Ilha de São Jorge', 'Ilha de São Miguel', 'Ilha do Corvo', 'Ilha do Faial',
  'Ilha do Pico',
])
const MADEIRA_ISLANDS = new Set(['Ilha da Madeira', 'Ilha de Porto Santo'])

function mapDistrictName(name: string): string {
  if (AZORES_ISLANDS.has(name)) return 'Região Autónoma dos Açores'
  if (MADEIRA_ISLANDS.has(name)) return 'Região Autónoma da Madeira'
  return name
}

function pick<T = unknown>(o: Record<string, unknown>, ...keys: string[]): T | null {
  for (const k of keys) {
    if (o[k] !== undefined && o[k] !== null && o[k] !== '') return o[k] as T
  }
  return null
}

function inferEducationLevels(ciclo: string | null): string[] {
  if (!ciclo) return []
  const c = ciclo.toLowerCase()
  const levels: string[] = []
  if (c.includes('pré') || c.includes('pre-escolar') || c.includes('pré-escolar')) levels.push('pre_escolar')
  if (c.includes('1') && c.includes('ciclo')) levels.push('1_ciclo')
  if (c.includes('2') && c.includes('ciclo')) levels.push('2_ciclo')
  if (c.includes('3') && c.includes('ciclo')) levels.push('3_ciclo')
  if (c.includes('secund')) levels.push('secundario')
  if (c.includes('profission')) levels.push('profissional')
  return levels
}

function normalizeNatureza(n: string | null): string {
  if (!n) return 'public'
  const s = n.toLowerCase()
  if (s.includes('priv')) return 'private'
  if (s.includes('coop')) return 'cooperative'
  return 'public'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey)
    const { data: adminRecord } = await adminClient
      .from('admin_users').select('id').eq('user_id', user.id).single()
    if (!adminRecord) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Load districts → id map
    const { data: districtRows, error: dErr } = await adminClient
      .from('districts').select('id, name')
    if (dErr) throw dErr
    const districtIdByName: Record<string, string> = {}
    for (const d of districtRows || []) districtIdByName[d.name] = d.id

    const perDistrict: Record<string, { fetched: number; upserted: number; failed: number; error?: string }> = {}
    let totalFetched = 0
    let totalUpserted = 0
    let totalFailed = 0

    for (const districtName of DISTRICTS) {
      const stat = { fetched: 0, upserted: 0, failed: 0 } as { fetched: number; upserted: number; failed: number; error?: string }
      perDistrict[districtName] = stat

      const targetDistrict = mapDistrictName(districtName)
      const districtId = districtIdByName[targetDistrict]
      if (!districtId) {
        stat.error = `District not found: ${targetDistrict}`
        totalFailed += 1
        continue
      }

      try {
        const body = new URLSearchParams({
          regiao: '', distrito: districtName, concelho: '',
          tipo: 'E', nivel: '', natureza: '', escola: '', uo: '',
        })
        const resp = await fetch('https://www.gesedu.pt/PesquisaRede/GetEscolas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'User-Agent': 'Mozilla/5.0 (compatible; FoliumBot/1.0)',
          },
          body: body.toString(),
        })
        if (!resp.ok) {
          stat.error = `HTTP ${resp.status}`
          totalFailed += 1
          await new Promise((r) => setTimeout(r, 600))
          continue
        }
        const text = await resp.text()
        let json: unknown
        try { json = JSON.parse(text) } catch {
          stat.error = 'Invalid JSON'
          totalFailed += 1
          await new Promise((r) => setTimeout(r, 600))
          continue
        }
        const list: Record<string, unknown>[] = Array.isArray(json)
          ? (json as Record<string, unknown>[])
          : Array.isArray((json as { d?: unknown }).d)
            ? ((json as { d: Record<string, unknown>[] }).d)
            : []

        stat.fetched = list.length
        totalFetched += list.length

        const rows = list.map((s) => {
          const name = pick<string>(s, 'Designacao', 'designacao', 'Nome', 'nome')
          const meCode = pick<string>(s, 'CodigoME', 'codigoMe', 'CodigoMe', 'codigo_me', 'Codigo')
          const concelho = pick<string>(s, 'Concelho', 'concelho')
          const morada = pick<string>(s, 'Morada', 'morada', 'Endereco', 'endereco')
          const natureza = pick<string>(s, 'Natureza', 'natureza')
          const ciclo = pick<string>(s, 'Ciclo', 'ciclo', 'Niveis', 'niveis')
          if (!name || !meCode) return null
          return {
            me_code: String(meCode).trim(),
            name: String(name).trim(),
            concelho: concelho ? String(concelho).trim() : null,
            address: morada ? String(morada).trim() : null,
            district_id: districtId,
            school_type: normalizeNatureza(natureza),
            education_levels: inferEducationLevels(ciclo),
            is_verified: true,
            is_active: true,
          }
        }).filter(Boolean) as Record<string, unknown>[]

        if (rows.length > 0) {
          const { error: upErr, count } = await adminClient
            .from('schools')
            .upsert(rows, { onConflict: 'me_code', count: 'exact' })
          if (upErr) {
            stat.error = upErr.message
            stat.failed = rows.length
            totalFailed += rows.length
          } else {
            stat.upserted = count ?? rows.length
            totalUpserted += stat.upserted
          }
        }
      } catch (e) {
        stat.error = (e as Error).message
        totalFailed += 1
      }

      await new Promise((r) => setTimeout(r, 600))
    }

    const summary = {
      total_fetched: totalFetched,
      total_upserted: totalUpserted,
      total_failed: totalFailed,
      per_district: perDistrict,
    }

    await adminClient.from('admin_audit_log').insert({
      admin_user_id: user.id,
      action: 'seed_schools_gesedu',
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      details: `Fetched ${totalFetched}, upserted ${totalUpserted}, failed ${totalFailed}`,
    })

    return new Response(JSON.stringify({ success: true, summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
