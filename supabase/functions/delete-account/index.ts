import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Permanently deletes the signed-in user's account and data.
// 1. Verifies the caller's session.
// 2. Runs public.delete_user_account() (one transaction: all data or nothing).
// 3. Deletes the auth user so they can no longer sign in.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(supabaseUrl, serviceRoleKey);

    // Who is asking? Only a signed-in user can delete, and only their own account.
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Missing authorization header' }, 401);
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await admin.auth.getUser(token);
    if (authError || !user) {
      return json({ error: 'Invalid or expired session' }, 401);
    }

    // Explicit confirmation so a stray request cannot wipe an account.
    const body = await req.json().catch(() => ({}));
    if (body?.confirm !== 'DELETE') {
      return json({ error: 'Confirmation required' }, 400);
    }

    const { error: dataError } = await admin.rpc('delete_user_account', { _user_id: user.id });
    if (dataError) {
      console.error('delete-account: data removal failed', dataError);
      return json({ error: 'We could not delete your data. Nothing was changed; please try again.' }, 500);
    }

    const { error: userError } = await admin.auth.admin.deleteUser(user.id);
    if (userError) {
      console.error('delete-account: auth user removal failed', userError);
      return json(
        { error: 'Your data was removed, but the sign-in could not be deleted. Please contact support.' },
        500,
      );
    }

    return json({ success: true });
  } catch (error) {
    console.error('delete-account: unexpected error', error);
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
});
