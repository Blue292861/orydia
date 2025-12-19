import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewsletterRequest {
  newsletterId: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-newsletter function invoked");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      console.error("User is not admin");
      return new Response(JSON.stringify({ error: "Forbidden: Admin only" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { newsletterId }: NewsletterRequest = await req.json();
    console.log("Processing newsletter:", newsletterId);

    // Get newsletter
    const { data: newsletter, error: newsletterError } = await supabase
      .from("newsletters")
      .select("*")
      .eq("id", newsletterId)
      .single();

    if (newsletterError || !newsletter) {
      console.error("Newsletter not found:", newsletterError);
      return new Response(JSON.stringify({ error: "Newsletter not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get subscribed users with their emails from auth.users
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id")
      .eq("newsletter_subscribed", true);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    console.log(`Found ${profiles?.length || 0} subscribed users`);

    if (!profiles || profiles.length === 0) {
      await supabase
        .from("newsletters")
        .update({ status: "sent", sent_at: new Date().toISOString(), sent_count: 0 })
        .eq("id", newsletterId);

      return new Response(JSON.stringify({ sentCount: 0, failedCount: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get emails from auth.users
    const userIds = profiles.map((p) => p.id);
    const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();

    if (authUsersError) {
      console.error("Error fetching auth users:", authUsersError);
      throw authUsersError;
    }

    const subscribedEmails = authUsers.users
      .filter((u) => userIds.includes(u.id) && u.email)
      .map((u) => u.email!);

    console.log(`Found ${subscribedEmails.length} emails to send`);

    let sentCount = 0;
    let failedCount = 0;
    const batchSize = 50;

    // Build attachments HTML
    const attachmentsHtml = newsletter.attachments?.length > 0
      ? `<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="font-weight: bold; margin-bottom: 10px;">Pièces jointes :</p>
          ${newsletter.attachments.map((att: any) => 
            `<a href="${att.url}" style="display: block; color: #d97706; text-decoration: underline; margin-bottom: 5px;">${att.name}</a>`
          ).join("")}
        </div>`
      : "";

    // Send emails in batches
    for (let i = 0; i < subscribedEmails.length; i += batchSize) {
      const batch = subscribedEmails.slice(i, i + batchSize);
      console.log(`Sending batch ${Math.floor(i / batchSize) + 1} with ${batch.length} emails`);

      const promises = batch.map(async (email) => {
        try {
          await resend.emails.send({
            from: "Orydia <newsletter@resend.dev>",
            to: [email],
            subject: newsletter.subject,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #1a1a2e; color: #e5e7eb; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #2d2d44; border-radius: 12px; overflow: hidden;">
                  <div style="background: linear-gradient(135deg, #d97706, #b45309); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">📚 Orydia</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Newsletter</p>
                  </div>
                  <div style="padding: 30px;">
                    <h2 style="color: #fbbf24; margin-top: 0;">${newsletter.subject}</h2>
                    <div style="line-height: 1.6; white-space: pre-wrap;">${newsletter.content}</div>
                    ${attachmentsHtml}
                  </div>
                  <div style="background-color: #1a1a2e; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
                    <p>Vous recevez cet email car vous êtes abonné à la newsletter Orydia.</p>
                    <p>Pour vous désabonner, rendez-vous dans votre profil sur l'application.</p>
                  </div>
                </div>
              </body>
              </html>
            `,
          });
          return { success: true };
        } catch (error) {
          console.error(`Failed to send to ${email}:`, error);
          return { success: false };
        }
      });

      const results = await Promise.all(promises);
      sentCount += results.filter((r) => r.success).length;
      failedCount += results.filter((r) => !r.success).length;

      // Small delay between batches
      if (i + batchSize < subscribedEmails.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log(`Finished sending: ${sentCount} sent, ${failedCount} failed`);

    // Update newsletter status
    await supabase
      .from("newsletters")
      .update({
        status: failedCount === subscribedEmails.length ? "failed" : "sent",
        sent_at: new Date().toISOString(),
        sent_count: sentCount,
        failed_count: failedCount,
      })
      .eq("id", newsletterId);

    return new Response(JSON.stringify({ sentCount, failedCount }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-newsletter:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
