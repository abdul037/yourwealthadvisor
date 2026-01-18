import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const truncate = (value: string, length: number) => {
  if (value.length <= length) return value;
  return `${value.slice(0, length - 3)}...`;
};

const buildDigestEmail = ({
  recipientName,
  weekRange,
  items,
}: {
  recipientName: string;
  weekRange: string;
  items: string;
}) => `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #111827; margin: 0;">Tharwa Net</h1>
      <p style="color: #6b7280; margin: 6px 0 0;">Weekly Social Digest</p>
    </div>
    <div style="background: #f3f4f6; border-radius: 12px; padding: 24px;">
      <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 12px;">
        Hi ${recipientName},
      </p>
      <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
        Here are the highlights from ${weekRange}.
      </p>
      <ul style="padding-left: 18px; margin: 0; color: #111827;">
        ${items}
      </ul>
    </div>
  </div>
`;

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

const listAllUsers = async (supabase: ReturnType<typeof createClient>) => {
  const users = [];
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const batch = data?.users || [];
    users.push(...batch);
    if (batch.length < perPage) break;
    page += 1;
  }

  return users;
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
    const baseUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://tharwa.app';

    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: 'Email provider not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const users = await listAllUsers(supabase);
    const { data: preferences } = await supabase
      .from('social_preferences')
      .select('user_id, weekly_digest');

    const optOut = new Set(
      (preferences || []).filter((pref) => pref.weekly_digest === false).map((pref) => pref.user_id)
    );

    const since = new Date();
    since.setDate(since.getDate() - 7);
    const sinceIso = since.toISOString();
    const weekRange = `${since.toISOString().slice(0, 10)} - ${new Date().toISOString().slice(0, 10)}`;

    const results = {
      attempted: 0,
      sent: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const user of users) {
      if (!user.email || optOut.has(user.id)) {
        results.skipped += 1;
        continue;
      }

      results.attempted += 1;

      const { data: memberships, error: membershipError } = await supabase
        .from('circle_memberships')
        .select('circle_id')
        .eq('user_id', user.id);

      if (membershipError) {
        results.errors.push(`Membership error for ${user.id}: ${membershipError.message}`);
        continue;
      }

      const circleIds = (memberships || []).map((m) => m.circle_id).filter(Boolean);
      if (circleIds.length === 0) {
        results.skipped += 1;
        continue;
      }

      const { data: posts, error: postError } = await supabase
        .from('posts')
        .select('id, title, content, created_at, upvote_count, comment_count, circle:circles(name, slug)')
        .in('circle_id', circleIds)
        .gte('created_at', sinceIso)
        .order('upvote_count', { ascending: false })
        .order('comment_count', { ascending: false })
        .limit(5);

      if (postError) {
        results.errors.push(`Posts error for ${user.id}: ${postError.message}`);
        continue;
      }

      if (!posts || posts.length === 0) {
        results.skipped += 1;
        continue;
      }

      const items = posts
        .map((post) => {
          const circle = (post as any).circle;
          const circleName = circle?.name || 'Circle';
          const circleSlug = circle?.slug;
          const title = post.title || truncate(post.content || '', 80);
          const link = circleSlug ? `${baseUrl}/social?circle=${circleSlug}` : `${baseUrl}/social`;
          return `<li style="margin-bottom: 10px;"><strong>${circleName}:</strong> ${title} <a href="${link}" style="color: #2563eb;">View</a></li>`;
        })
        .join('');

      const recipientName =
        (user.user_metadata && (user.user_metadata.full_name as string)) ||
        user.email.split('@')[0] ||
        'there';

      const html = buildDigestEmail({ recipientName, weekRange, items });

      try {
        await sendEmail({
          apiKey: resendApiKey,
          from: emailFrom,
          to: user.email,
          subject: 'Your Tharwa Social weekly digest',
          html,
        });
        results.sent += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`Send error for ${user.id}: ${message}`);
      }
    }

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[social-weekly-digest]', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
