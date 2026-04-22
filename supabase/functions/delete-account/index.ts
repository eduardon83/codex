import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401);

    const body = await req.json().catch(() => ({}));
    const requestedUserId = typeof body.userId === 'string' ? body.userId : null;
    if (!requestedUserId) return json({ error: 'Missing userId' }, 400);

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) return json({ error: 'Unauthorized' }, 401);
    if (userData.user.id !== requestedUserId) return json({ error: 'Cannot delete another user' }, 403);

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
    const userId = userData.user.id;

    const { data: books } = await supabase.from('books').select('id').eq('user_id', userId);
    const bookIds = (books || []).map((book) => book.id as string);
    const { data: lists } = await supabase.from('reading_lists').select('id').eq('user_id', userId);
    const listIds = (lists || []).map((list) => list.id as string);

    await supabase.from('book_availability').delete().eq('owner_user_id', userId);
    for (const bookId of bookIds) await supabase.from('book_availability').delete().eq('book_id', bookId);
    await supabase.from('loan_requests').delete().or(`owner_user_id.eq.${userId},requester_user_id.eq.${userId}`);
    for (const bookId of bookIds) await supabase.from('loan_requests').delete().eq('book_id', bookId);
    await supabase.from('loans').delete().or(`lender_id.eq.${userId},borrower_user_id.eq.${userId}`);
    for (const bookId of bookIds) await supabase.from('loans').delete().eq('book_id', bookId);
    await supabase.from('reading_list_subscriptions').delete().eq('user_id', userId);
    for (const listId of listIds) {
      await supabase.from('reading_list_subscriptions').delete().eq('reading_list_id', listId);
      await supabase.from('reading_list_books').delete().eq('reading_list_id', listId);
    }
    await supabase.from('reading_lists').delete().eq('user_id', userId);
    await supabase.from('user_favourites').delete().eq('user_id', userId);
    await supabase.from('reading_history').delete().eq('user_id', userId);
    await supabase.from('saved_libraries').delete().eq('user_id', userId);
    await supabase.from('books').delete().eq('user_id', userId);
    await supabase.from('library_cards').delete().eq('user_id', userId);
    await supabase.from('libraries').delete().eq('user_id', userId);
    await supabase.from('profiles').delete().eq('user_id', userId);

    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteError) return json({ error: deleteError.message }, 500);

    return json({ success: true });
  } catch (error) {
    console.error(error);
    return json({ error: String(error) }, 500);
  }
});