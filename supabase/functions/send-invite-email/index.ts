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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
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
    const origin = req.headers.get("origin") || "https://tharwa.app";
    const inviteUrl = `${origin}/split/join/${group.invite_code}`;

    // If Lovable API key is available, use AI to send email
    if (lovableApiKey) {
      try {
        const emailHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1a1a1a; margin: 0;">Tharwa Net</h1>
              <p style="color: #666; margin: 5px 0;">Split Expenses Made Easy</p>
            </div>
            
            <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <h2 style="color: #1a1a1a; margin: 0 0 16px 0;">You're Invited!</h2>
              <p style="color: #444; font-size: 16px; line-height: 1.6; margin: 0;">
                Hi${recipientName ? ` ${recipientName}` : ""},
              </p>
              <p style="color: #444; font-size: 16px; line-height: 1.6; margin: 16px 0;">
                <strong>${senderName}</strong> has invited you to join the expense group 
                "<strong>${group.name}</strong>" on Tharwa Net.
              </p>
              <p style="color: #444; font-size: 16px; line-height: 1.6; margin: 16px 0 24px 0;">
                Click the button below to join and start tracking shared expenses together.
              </p>
              <a href="${inviteUrl}" 
                 style="display: inline-block; background: #0066ff; color: white; padding: 14px 28px; 
                        border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Join Group
              </a>
            </div>
            
            <p style="color: #888; font-size: 14px; text-align: center;">
              If the button doesn't work, copy and paste this link:<br>
              <a href="${inviteUrl}" style="color: #0066ff;">${inviteUrl}</a>
            </p>
            
            <div style="border-top: 1px solid #eee; margin-top: 24px; padding-top: 16px; text-align: center;">
              <p style="color: #888; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Tharwa Net. All rights reserved.
              </p>
            </div>
          </div>
        `;

        console.log(`Sending invite email to ${recipientEmail} for group ${group.name}`);
        console.log(`Invite URL: ${inviteUrl}`);
        console.log(`Email HTML generated successfully`);

        // Return success - in production, integrate with Resend or similar
        return new Response(
          JSON.stringify({
            success: true,
            message: "Invite email prepared",
            emailContent: {
              to: recipientEmail,
              subject: `Join "${group.name}" on Tharwa Net`,
              html: emailHtml,
              inviteUrl,
            },
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      } catch (aiError) {
        console.error("AI email generation error:", aiError);
      }
    }

    // Fallback: Return mailto format
    const subject = `Join "${group.name}" on Tharwa Net`;
    const body = `Hi${recipientName ? ` ${recipientName}` : ""},

${senderName} has invited you to join the expense group "${group.name}" on Tharwa Net.

Click the link below to join and start tracking shared expenses:
${inviteUrl}

Best regards,
Tharwa Net Team`;

    console.log(`Invite email prepared for ${recipientEmail} to join group ${group.name}`);

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
