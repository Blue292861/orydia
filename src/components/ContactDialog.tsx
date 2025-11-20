import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mail, Send } from 'lucide-react';

const contactSchema = z.object({
  firstName: z.string().trim().min(1, "Prénom requis").max(100, "Prénom trop long"),
  lastName: z.string().trim().min(1, "Nom requis").max(100, "Nom trop long"),
  subject: z.string().trim().min(1, "Objet requis").max(200, "Objet trop long"),
  message: z.string().trim().min(10, "Message trop court (minimum 10 caractères)").max(1000, "Message trop long (maximum 1000 caractères)"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export const ContactDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const { data: response, error } = await supabase.functions.invoke('send-contact-email', {
        body: data,
      });

      if (error) throw error;

      toast.success('Message envoyé avec succès !', {
        description: 'Nous vous répondrons dans les plus brefs délais.',
      });
      
      form.reset();
      setOpen(false);
    } catch (error: any) {
      console.error('Error sending contact email:', error);
      toast.error('Erreur lors de l\'envoi', {
        description: 'Une erreur est survenue. Veuillez réessayer.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-amber-700 hover:bg-amber-600 text-white border-2 border-amber-600 font-semibold px-4 py-2.5 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/30">
          <Mail className="w-4 h-4" />
          Nous contacter
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Formulaire de contact</DialogTitle>
          <DialogDescription>
            Envoyez-nous un message, nous vous répondrons dans les plus brefs délais.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input placeholder="Jean" {...field} maxLength={100} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Dupont" {...field} maxLength={100} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objet</FormLabel>
                  <FormControl>
                    <Input placeholder="Sujet de votre message" {...field} maxLength={200} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Votre message..."
                      className="min-h-[120px]"
                      {...field}
                      maxLength={1000}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <>Envoi en cours...</>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Envoyer
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
