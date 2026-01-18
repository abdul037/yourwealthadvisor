import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReplyNotificationRequest {
  postId: string;
  commentContent?: string;
  circleSlug?: string;
}

const truncate = (value: string, length: number) => {
  if (value.length <= length) return value;
  return `${value.slice(0, length - 3)}...`;
};

const buildReplyEmail = ({
  recipientName,
  commenterName,
  snippet,
  actionUrl,
}: {
  recipientName: string;
  commenterName: string;
  snippet: string;
  actionUrl: string;
}) => `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #111827; margin: 0;">Tharwa Net</h1>
      <p style="color: #6b7280; margin: 6px 0 0;">New reply on your post</p>
    </div>
    <div style="background: #f3f4f6; border-radius: 12px; padding: 24px;">
      <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 12px;">
        Hi ${recipientName},
      </p>
      <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 12px;">
        <strong>${commenterName}</strong> replied: "${snippet}"
      </p>
      <a href="${actionUrl}"
         style="display: inline-block; background: #2563eb; color: #ffffff; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        View reply
      </a>
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const emailFrom = Deno.env.get('EMAIL_FROM') || 'Tharwa Net <no-reply@tharwa.net>';

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

    const { postId, commentContent, circleSlug }: ReplyNotificationRequest = await req.json();
    if (!postId) {
      return new Response(JSON.stringify({ error: 'Missing postId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, author_id, title, content, circle_id')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (post.author_id === user.id) {
      return new Response(JSON.stringify({ skipped: true, reason: 'self_reply' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const { data: recipientPrefs } = await supabase
      .from('social_preferences')
      .select('reply_alerts')
      .eq('user_id', post.author_id)
      .maybeSingle();

    if (recipientPrefs?.reply_alerts === false) {
      return new Response(JSON.stringify({ skipped: true, reason: 'opted_out' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const { data: commenterProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const commenterName = commenterProfile?.full_name || user.email?.split('@')[0] || 'Someone';
    const snippetSource = commentContent?.trim() || post.title || post.content;
    const snippet = truncate(snippetSource, 120);

    let resolvedCircleSlug = circleSlug;
    if (!resolvedCircleSlug && post.circle_id) {
      const { data: circle } = await supabase
        .from('circles')
        .select('slug')
        .eq('id', post.circle_id)
        .single();
      resolvedCircleSlug = circle?.slug || undefined;
    }

    const actionUrl = resolvedCircleSlug ? `/social?circle=${resolvedCircleSlug}` : '/social';

    const { error: insertError } = await supabase
      .from('notifications')
      .insert({
        user_id: post.author_id,
        type: 'comment',
        title: 'New comment on your post',
        message: `${commenterName} replied: "${snippet}"`,
        priority: 'normal',
        is_read: false,
        action_url: actionUrl,
        related_id: post.id,
        related_type: 'post',
      });

    if (insertError) {
      throw insertError;
    }

    if (resendApiKey) {
      const { data: recipientUser } = await supabase.auth.admin.getUserById(post.author_id);
      const recipientEmail = recipientUser?.user?.email;
      if (recipientEmail) {
        const recipientName = recipientUser?.user?.user_metadata?.full_name || 'there';
        const html = buildReplyEmail({
          recipientName,
          commenterName,
          snippet,
          actionUrl: `${Deno.env.get('PUBLIC_SITE_URL') || 'https://tharwa.app'}${actionUrl}`,
        });
        await sendEmail({
          apiKey: resendApiKey,
          from: emailFrom,
          to: recipientEmail,
          subject: 'New reply on your post',
          html,
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[social-reply-notification]', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
