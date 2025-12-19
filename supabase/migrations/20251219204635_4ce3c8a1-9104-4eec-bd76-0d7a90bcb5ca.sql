-- Ajouter le champ newsletter_subscribed à profiles (par défaut true)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS newsletter_subscribed BOOLEAN DEFAULT true;

-- Créer la table newsletters
CREATE TABLE public.newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'draft',
  sent_at TIMESTAMPTZ,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;

-- Policies for newsletters
CREATE POLICY "Admins can manage newsletters"
ON public.newsletters
FOR ALL
USING (user_has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role));

-- Créer le bucket pour les pièces jointes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('newsletter-attachments', 'newsletter-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for newsletter attachments
CREATE POLICY "Admins can upload newsletter attachments"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'newsletter-attachments' AND user_has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update newsletter attachments"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'newsletter-attachments' AND user_has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete newsletter attachments"
ON storage.objects
FOR DELETE
USING (bucket_id = 'newsletter-attachments' AND user_has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view newsletter attachments"
ON storage.objects
FOR SELECT
USING (bucket_id = 'newsletter-attachments');

-- Trigger pour updated_at
CREATE TRIGGER update_newsletters_updated_at
BEFORE UPDATE ON public.newsletters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();