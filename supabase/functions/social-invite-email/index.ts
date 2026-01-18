import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SocialInviteRequest {
  recipientEmail: string;
  recipientName?: string;
  inviteLink?: string;
  circleSlug?: string;
}

const buildInviteLink = ({
  origin,
  userId,
  circleSlug,
  inviteLink,
}: {
  origin: string;
  userId: string;
  circleSlug?: string;
  inviteLink?: string;
}) => {
  if (inviteLink) return inviteLink;
  const redirectTarget = circleSlug ? `/social?circle=${circleSlug}` : '/social';
  const redirectParam = encodeURIComponent(redirectTarget);
  const refParam = userId ? `&ref=${userId}` : '';
  return `${origin}/auth?mode=signup&redirect=${redirectParam}${refParam}`;
};

const buildInviteEmail = ({
  senderName,
  recipientName,
  inviteLink,
}: {
  senderName: string;
  recipientName?: string;
  inviteLink: string;
}) => {
  const greetingName = recipientName ? ` ${recipientName}` : '';
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #111827; margin: 0;">Tharwa Net</h1>
        <p style="color: #6b7280; margin: 6px 0 0;">Your money circle, together</p>
      </div>
      <div style="background: #f3f4f6; border-radius: 12px; padding: 24px;">
        <h2 style="color: #111827; margin: 0 0 12px;">You're invited</h2>
        <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
          Hi${greetingName},
        </p>
        <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
          <strong>${senderName}</strong> invited you to join Tharwa Net and connect on Tharwa Social.
        </p>
        <a href="${inviteLink}"
           style="display: inline-block; background: #2563eb; color: #ffffff; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Accept invite
        </a>
      </div>
      <p style="color: #6b7280; font-size: 13px; margin: 16px 0 0; text-align: center;">
        If the button doesn't work, copy this link:<br />
        <a href="${inviteLink}" style="color: #2563eb;">${inviteLink}</a>
      </p>
    </div>
  `;
};

const sendEmail = async ({
  apiKey,
  from,
  to,
  subject,
  html,
}: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
}) => {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend error: ${response.status} ${errorText}`);
  }
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const emailFrom = Deno.env.get('EMAIL_FROM') || 'Tharwa Net <no-reply@tharwa.net>';

    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: 'Email provider not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const { recipientEmail, recipientName, inviteLink, circleSlug }: SocialInviteRequest = await req.json();
    if (!recipientEmail) {
      return new Response(JSON.stringify({ error: 'Missing recipient email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const senderName = profile?.full_name || user.email?.split('@')[0] || 'Someone';
    const origin = req.headers.get('origin') || Deno.env.get('PUBLIC_SITE_URL') || 'https://tharwa.app';
    const resolvedInviteLink = buildInviteLink({
      origin,
      userId: user.id,
      circleSlug,
      inviteLink,
    });

    const subject = `${senderName} invited you to Tharwa Net`;
    const html = buildInviteEmail({
      senderName,
      recipientName,
      inviteLink: resolvedInviteLink,
    });

    await sendEmail({
      apiKey: resendApiKey,
      from: emailFrom,
      to: recipientEmail,
      subject,
      html,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[social-invite-email]', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
