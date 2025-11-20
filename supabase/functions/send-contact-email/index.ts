import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactRequest {
  firstName: string;
  lastName: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firstName, lastName, subject, message }: ContactRequest = await req.json();

    // Server-side validation
    if (!firstName || firstName.trim().length === 0 || firstName.length > 100) {
      return new Response(
        JSON.stringify({ error: "Prénom invalide" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!lastName || lastName.trim().length === 0 || lastName.length > 100) {
      return new Response(
        JSON.stringify({ error: "Nom invalide" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!subject || subject.trim().length === 0 || subject.length > 200) {
      return new Response(
        JSON.stringify({ error: "Objet invalide" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!message || message.trim().length < 10 || message.length > 1000) {
      return new Response(
        JSON.stringify({ error: "Message invalide (entre 10 et 1000 caractères)" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Sanitize inputs (escape HTML)
    const sanitize = (str: string) => str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    const safeFirstName = sanitize(firstName.trim());
    const safeLastName = sanitize(lastName.trim());
    const safeSubject = sanitize(subject.trim());
    const safeMessage = sanitize(message.trim());

    const timestamp = new Date().toLocaleString('fr-FR', { 
      timeZone: 'Europe/Paris',
      dateStyle: 'full',
      timeStyle: 'short'
    });

    const emailResponse = await resend.emails.send({
      from: "Orydia Contact <onboarding@resend.dev>",
      to: ["contact.toisondorsarl@neptune-group.fr"],
      subject: `[Orydia] ${safeSubject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #8B7355; padding-bottom: 10px;">
            Nouveau message de contact - Orydia
          </h2>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #8B7355; margin-top: 0;">Informations du contact :</h3>
            <p><strong>Prénom :</strong> ${safeFirstName}</p>
            <p><strong>Nom :</strong> ${safeLastName}</p>
            <p><strong>Objet :</strong> ${safeSubject}</p>
            
            <h3 style="color: #8B7355; margin-top: 20px;">Message :</h3>
            <div style="background: white; padding: 15px; border-radius: 4px; white-space: pre-wrap; line-height: 1.6;">
${safeMessage}
            </div>
          </div>

          <p style="color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 15px; margin-top: 20px;">
            Email généré depuis le formulaire de contact d'Orydia<br>
            Date : ${timestamp}
          </p>
        </div>
      `,
    });

    console.log("Contact email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, data: emailResponse }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Une erreur est survenue" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
