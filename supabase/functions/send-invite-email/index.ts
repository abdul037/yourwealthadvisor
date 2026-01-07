import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteEmailRequest {
  groupId: string;
  recipientEmail: string;
  recipientName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { groupId, recipientEmail, recipientName }: InviteEmailRequest = await req.json();

    if (!groupId || !recipientEmail) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Fetch group details
    const { data: group, error: groupError } = await supabase
      .from("expense_groups")
      .select("name, invite_code, currency")
      .eq("id", groupId)
      .single();

    if (groupError || !group) {
      console.error("Group fetch error:", groupError);
      return new Response(JSON.stringify({ error: "Group not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get sender's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const senderName = profile?.full_name || user.email?.split("@")[0] || "Someone";
    const inviteUrl = `${req.headers.get("origin") || "https://tharwa.app"}/split/join/${group.invite_code}`;

    // For now, we'll generate a mailto link response
    // In production, you'd integrate with Resend or another email service
    const subject = `Join "${group.name}" on Tharwa Net`;
    const body = `Hi${recipientName ? ` ${recipientName}` : ""},

${senderName} has invited you to join the expense group "${group.name}" on Tharwa Net.

Click the link below to join and start tracking shared expenses:
${inviteUrl}

Best regards,
Tharwa Net Team`;

    console.log(`Invite email prepared for ${recipientEmail} to join group ${group.name}`);

    // Return the formatted email content (for client-side mailto or future email integration)
    return new Response(
      JSON.stringify({
        success: true,
        emailContent: {
          to: recipientEmail,
          subject,
          body,
          inviteUrl,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-invite-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
