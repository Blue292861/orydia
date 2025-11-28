import { supabase } from "@/integrations/supabase/client";
import { Waypoint, WaypointFormData } from "@/types/Waypoint";

export async function getWaypointsByChapterId(chapterId: string): Promise<Waypoint[]> {
  const { data, error } = await supabase
    .from('chapter_waypoints')
    .select('*')
    .eq('chapter_id', chapterId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching waypoints:', error);
    throw error;
  }

  return (data || []) as Waypoint[];
}

export async function createWaypoint(formData: WaypointFormData): Promise<Waypoint> {
  const { data: userData } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('chapter_waypoints')
    .insert({
      chapter_id: formData.chapter_id,
      word_text: formData.word_text,
      cfi_range: formData.cfi_range,
      word_index: formData.word_index,
      waypoint_type: formData.waypoint_type,
      content_text: formData.content_text,
      content_image_url: formData.content_image_url,
      content_audio_url: formData.content_audio_url,
      content_link_url: formData.content_link_url,
      content_link_label: formData.content_link_label,
      created_by: userData?.user?.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating waypoint:', error);
    throw error;
  }

  return data as Waypoint;
}

export async function updateWaypoint(id: string, formData: Partial<WaypointFormData>): Promise<void> {
  const { error } = await supabase
    .from('chapter_waypoints')
    .update({
      word_text: formData.word_text,
      cfi_range: formData.cfi_range,
      word_index: formData.word_index,
      waypoint_type: formData.waypoint_type,
      content_text: formData.content_text,
      content_image_url: formData.content_image_url,
      content_audio_url: formData.content_audio_url,
      content_link_url: formData.content_link_url,
      content_link_label: formData.content_link_label,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating waypoint:', error);
    throw error;
  }
}

export async function deleteWaypoint(id: string): Promise<void> {
  const { error } = await supabase
    .from('chapter_waypoints')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting waypoint:', error);
    throw error;
  }
}

export async function uploadWaypointAudio(file: File, chapterId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${chapterId}/${Date.now()}.${fileExt}`;
  const filePath = `waypoint-audio/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('book-assets')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading audio:', uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('book-assets')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function uploadWaypointImage(file: File, chapterId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${chapterId}/${Date.now()}.${fileExt}`;
  const filePath = `waypoint-images/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('book-assets')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('book-assets')
    .getPublicUrl(filePath);

  return data.publicUrl;
}
