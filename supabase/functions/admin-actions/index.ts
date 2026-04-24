import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      throw new Error('Backend configuration is missing required credentials')
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Verify caller identity
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } }
    })
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check admin status using service role
    const adminClient = createClient(supabaseUrl, serviceRoleKey)
    const { data: adminRecord } = await adminClient
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!adminRecord) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { action, user_id, role, details, reason } = await req.json()
    const allowedRoles = ['admin', 'teacher', 'school_admin', 'entity', 'global_admin', 'moderator', 'user']

    // Log to audit
    const logAction = async (actionName: string, affectedUserId?: string, actionDetails?: string) => {
      await adminClient.from('admin_audit_log').insert({
        admin_user_id: user.id,
        action: actionName,
        affected_user_id: affectedUserId || null,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown',
        details: actionDetails || null,
      })
    }

    switch (action) {
      case 'delete_user': {
        if (!user_id) throw new Error('user_id required')
        // Don't allow self-delete
        if (user_id === user.id) throw new Error('Cannot delete yourself')
        // Delete from auth (cascades to profiles etc.)
        const { error } = await adminClient.auth.admin.deleteUser(user_id)
        if (error) throw error
        await logAction('delete_user', user_id, details)
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'suspend_user': {
        if (!user_id) throw new Error('user_id required')
        const trimmedReason = typeof reason === 'string' ? reason.trim().slice(0, 500) : null
        const { error } = await adminClient
          .from('profiles')
          .update({
            suspended: true,
            account_status: 'suspended',
            suspension_reason: trimmedReason || null,
          })
          .eq('user_id', user_id)
        if (error) throw error
        await logAction('suspend_user', user_id, trimmedReason || details || null)
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'unsuspend_user': {
        if (!user_id) throw new Error('user_id required')
        const { error } = await adminClient
          .from('profiles')
          .update({
            suspended: false,
            account_status: 'active',
            suspension_reason: null,
          })
          .eq('user_id', user_id)
        if (error) throw error
        await logAction('unsuspend_user', user_id, details)
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'promote_admin': {
        if (!user_id) throw new Error('user_id required')
        const { error } = await adminClient
          .from('admin_users')
          .insert({ user_id })
        const { error: roleError } = await adminClient
          .from('user_roles')
          .upsert({ user_id, role: 'admin' }, { onConflict: 'user_id,role' })
        if (roleError) throw roleError
        if (error) throw error
        await logAction('promote_admin', user_id, details)
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'assign_role': {
        if (!user_id) throw new Error('user_id required')
        if (!role || !allowedRoles.includes(role)) throw new Error('Invalid role')
        const { error } = await adminClient
          .from('user_roles')
          .upsert({ user_id, role }, { onConflict: 'user_id,role' })
        if (error) throw error
        if (role === 'admin') {
          const { error: adminError } = await adminClient
            .from('admin_users')
            .insert({ user_id })
          if (adminError && adminError.code !== '23505') throw adminError
        }
        await logAction(`assign_role_${role}`, user_id, details)
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'remove_role': {
        if (!user_id) throw new Error('user_id required')
        if (!role || !allowedRoles.includes(role)) throw new Error('Invalid role')
        if (user_id === user.id && role === 'admin') throw new Error('Cannot remove your own admin role')
        const { error } = await adminClient
          .from('user_roles')
          .delete()
          .eq('user_id', user_id)
          .eq('role', role)
        if (error) throw error
        if (role === 'admin') {
          const { error: adminError } = await adminClient
            .from('admin_users')
            .delete()
            .eq('user_id', user_id)
          if (adminError) throw adminError
        }
        await logAction(`remove_role_${role}`, user_id, details)
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'demote_admin': {
        if (!user_id) throw new Error('user_id required')
        if (user_id === user.id) throw new Error('Cannot demote yourself')
        const { error } = await adminClient
          .from('admin_users')
          .delete()
          .eq('user_id', user_id)
        if (error) throw error
        await logAction('demote_admin', user_id, details)
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'log_export': {
        await logAction('data_export', undefined, details)
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      default:
        throw new Error(`Unknown action: ${action}`)
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
