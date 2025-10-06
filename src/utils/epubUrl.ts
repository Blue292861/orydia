// src/utils/epubUrl.ts
import { supabase } from '@/integrations/supabase/client';

/**
 * Convertit une URL Supabase Storage en URL publique directe
 * Gère aussi les URLs externes qui sont retournées telles quelles
 */
export function toPublicEpubUrl(url: string): string {
  // Si c'est une URL Supabase Storage, extraire le filePath et obtenir l'URL publique
  if (url.includes('/object/public/epubs/')) {
    const match = url.match(/\/object\/public\/epubs\/(.+)$/);
    const filePath = match ? match[1] : url.split('/').pop() || '';
    return supabase.storage.from('epubs').getPublicUrl(filePath).data.publicUrl;
  }
  
  // Sinon, retourner l'URL telle quelle (URL externe ou déjà publique)
  return url;
}
