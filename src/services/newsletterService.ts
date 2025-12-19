import { supabase } from '@/integrations/supabase/client';
import { Newsletter, NewsletterAttachment } from '@/types/Newsletter';

// Convert DB row to Newsletter type
const mapRowToNewsletter = (row: any): Newsletter => ({
  id: row.id,
  subject: row.subject,
  content: row.content,
  attachments: row.attachments || [],
  status: row.status,
  sentAt: row.sent_at,
  sentCount: row.sent_count,
  failedCount: row.failed_count,
  createdBy: row.created_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// Get all newsletters (admin)
export const getNewsletters = async (): Promise<Newsletter[]> => {
  const { data, error } = await supabase
    .from('newsletters')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapRowToNewsletter);
};

// Get a single newsletter
export const getNewsletter = async (id: string): Promise<Newsletter | null> => {
  const { data, error } = await supabase
    .from('newsletters')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data ? mapRowToNewsletter(data) : null;
};

// Create a newsletter
export const createNewsletter = async (
  subject: string,
  content: string,
  attachments: NewsletterAttachment[] = []
): Promise<Newsletter> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('newsletters')
    .insert({
      subject,
      content,
      attachments: attachments as unknown as any,
      created_by: user?.id,
    })
    .select()
    .single();

  if (error) throw error;
  return mapRowToNewsletter(data);
};

// Update a newsletter
export const updateNewsletter = async (
  id: string,
  updates: Partial<Pick<Newsletter, 'subject' | 'content' | 'attachments'>>
): Promise<Newsletter> => {
  const updateData: any = { ...updates };
  if (updates.attachments) {
    updateData.attachments = updates.attachments as unknown as any;
  }
  
  const { data, error } = await supabase
    .from('newsletters')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapRowToNewsletter(data);
};

// Delete a newsletter
export const deleteNewsletter = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('newsletters')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Send a newsletter via edge function
export const sendNewsletter = async (id: string): Promise<{ sentCount: number; failedCount: number }> => {
  // Update status to sending
  await supabase
    .from('newsletters')
    .update({ status: 'sending' })
    .eq('id', id);

  const { data, error } = await supabase.functions.invoke('send-newsletter', {
    body: { newsletterId: id },
  });

  if (error) {
    // Update status to failed
    await supabase
      .from('newsletters')
      .update({ status: 'failed' })
      .eq('id', id);
    throw error;
  }

  return data;
};

// Get subscriber count
export const getSubscriberCount = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('newsletter_subscribed', true);

  if (error) throw error;
  return count || 0;
};

// Upload attachment
export const uploadAttachment = async (file: File): Promise<NewsletterAttachment> => {
  const fileName = `${Date.now()}-${file.name}`;
  
  const { error: uploadError } = await supabase.storage
    .from('newsletter-attachments')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('newsletter-attachments')
    .getPublicUrl(fileName);

  return {
    name: file.name,
    url: publicUrl,
    type: file.type,
    size: file.size,
  };
};

// Delete attachment from storage
export const deleteAttachment = async (url: string): Promise<void> => {
  const fileName = url.split('/').pop();
  if (!fileName) return;

  const { error } = await supabase.storage
    .from('newsletter-attachments')
    .remove([fileName]);

  if (error) throw error;
};

// User subscription management
export const getNewsletterSubscription = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('newsletter_subscribed')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data?.newsletter_subscribed ?? true;
};

export const toggleNewsletterSubscription = async (userId: string, subscribed: boolean): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({ newsletter_subscribed: subscribed })
    .eq('id', userId);

  if (error) throw error;
};
