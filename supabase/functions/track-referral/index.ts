import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generateTrackingCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { partnerId, source } = await req.json();

    if (!partnerId) {
      return new Response(
        JSON.stringify({ error: 'Partner ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get partner details
    const { data: partner, error: partnerError } = await supabase
      .from('affiliate_partners')
      .select('*')
      .eq('id', partnerId)
      .eq('is_active', true)
      .single();

    if (partnerError || !partner) {
      return new Response(
        JSON.stringify({ error: 'Partner not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user from auth header if available
    let userId = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Generate unique tracking code
    const trackingCode = generateTrackingCode();

    // Get client info
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Record the click
    const { error: clickError } = await supabase
      .from('referral_clicks')
      .insert({
        user_id: userId,
        partner_id: partnerId,
        tracking_code: trackingCode,
        source: source || 'direct',
        ip_address: ipAddress,
        user_agent: userAgent,
      });

    if (clickError) {
      console.error('Error recording click:', clickError);
    }

    // Build redirect URL with tracking
    const redirectUrl = `${partner.referral_url}?ref=tharwa_${trackingCode}`;

    return new Response(
      JSON.stringify({
        redirectUrl,
        trackingCode,
        partnerName: partner.name,
        bonusCoins: partner.bonus_coins,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in track-referral:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
