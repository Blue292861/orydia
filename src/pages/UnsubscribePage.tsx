import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from 'zod';

const unsubscribeSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(100, "Le nom doit faire moins de 100 caractères"),
  email: z.string().trim().email("Email invalide").max(255, "L'email doit faire moins de 255 caractères"),
  reason: z.string().trim().min(10, "Veuillez expliquer votre demande (minimum 10 caractères)").max(1000, "Le message doit faire moins de 1000 caractères")
});

type UnsubscribeFormData = z.infer<typeof unsubscribeSchema>;

export const UnsubscribePage: React.FC = () => {
  const [formData, setFormData] = useState<UnsubscribeFormData>({
    name: '',
    email: '',
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof UnsubscribeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validation côté client
      const validatedData = unsubscribeSchema.parse(formData);
      
      setIsSubmitting(true);

      const { error } = await supabase.functions.invoke('send-unsubscribe-request', {
        body: validatedData
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Demande envoyée",
        description: "Votre demande de suppression de compte a été transmise. Vous recevrez une réponse par email sous 48h.",
      });

      // Reset form
      setFormData({ name: '', email: '', reason: '' });
    } catch (error: unknown) {
      console.error('Erreur lors de l\'envoi:', error);
      
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast({
          title: "Erreur de validation",
          description: firstError.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite lors de l'envoi de votre demande. Veuillez réessayer.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Désinscription - Demande de suppression de compte</title>
        <meta name="description" content="Formulaire de demande de suppression de compte utilisateur" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Suppression de compte</CardTitle>
            <CardDescription className="text-center">
              Demande de suppression de votre compte utilisateur
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Votre nom complet"
                  required
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="votre.email@exemple.com"
                  required
                  maxLength={255}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Motif de la demande</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  placeholder="Expliquez brièvement pourquoi vous souhaitez supprimer votre compte..."
                  required
                  minLength={10}
                  maxLength={1000}
                  className="min-h-[120px]"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Envoi en cours..." : "Envoyer la demande"}
              </Button>
            </form>

            <div className="mt-6 text-sm text-muted-foreground text-center">
              <p>
                Votre demande sera traitée dans les 48 heures ouvrables.
                Vous recevrez une confirmation par email.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default UnsubscribePage;