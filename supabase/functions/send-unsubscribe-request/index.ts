import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface UnsubscribeRequest {
  name: string;
  email: string;
  reason: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Réception d'une demande de désinscription");
    
    const { name, email, reason }: UnsubscribeRequest = await req.json();

    // Validation simple côté serveur
    if (!name?.trim() || !email?.trim() || !reason?.trim()) {
      return new Response(
        JSON.stringify({ error: "Tous les champs sont requis" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Format d'email invalide" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Envoi de l'email de demande de désinscription pour: ${email}`);

    // Envoyer l'email à l'équipe support
    const emailResponse = await resend.emails.send({
      from: "Orydia <no-reply@resend.dev>",
      to: ["contact.toisondorsarl.neptune-group.fr"],
      subject: `Demande de suppression de compte - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Demande de suppression de compte utilisateur</h2>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Informations du demandeur :</h3>
            <p><strong>Nom :</strong> ${name}</p>
            <p><strong>Email :</strong> ${email}</p>
            
            <h3>Motif de la demande :</h3>
            <p style="white-space: pre-wrap;">${reason}</p>
          </div>
          
          <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #ff6b6b; background-color: #fff5f5;">
            <p style="margin: 0; color: #d63031;">
              <strong>Action requise :</strong> Cette demande nécessite un traitement manuel pour supprimer le compte utilisateur et toutes les données associées conformément au RGPD.
            </p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          
          <p style="color: #666; font-size: 12px;">
            Email généré automatiquement depuis le formulaire de désinscription d'Orydia.<br>
            Date de la demande : ${new Date().toLocaleString('fr-FR')}
          </p>
        </div>
      `,
    });

    console.log("Email envoyé avec succès:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Demande de suppression envoyée avec succès" 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: unknown) {
    console.error("Erreur dans send-unsubscribe-request:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    
    return new Response(
      JSON.stringify({ 
        error: "Erreur lors de l'envoi de la demande",
        details: errorMessage 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);