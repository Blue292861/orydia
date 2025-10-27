import { supabase } from '@/integrations/supabase/client';
import { ChapterEpub } from '@/types/ChapterEpub';

export const chapterEpubService = {
  async getChaptersByBookId(bookId: string): Promise<ChapterEpub[]> {
    const { data, error } = await supabase
      .from('book_chapter_epubs')
      .select('*')
      .eq('book_id', bookId)
      .order('position', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getChapterById(chapterId: string): Promise<ChapterEpub | null> {
    const { data, error } = await supabase
      .from('book_chapter_epubs')
      .select('*')
      .eq('id', chapterId)
      .single();

    if (error) throw error;
    return data;
  },

  async createChapter(chapter: Omit<ChapterEpub, 'id' | 'created_at' | 'updated_at'>): Promise<ChapterEpub> {
    const { data, error } = await supabase
      .from('book_chapter_epubs')
      .insert(chapter)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateChapter(id: string, updates: Partial<ChapterEpub>): Promise<void> {
    const { error } = await supabase
      .from('book_chapter_epubs')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteChapter(id: string): Promise<void> {
    const { error } = await supabase
      .from('book_chapter_epubs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async reorderChapters(bookId: string, newOrder: { id: string; position: number }[]): Promise<void> {
    const updates = newOrder.map(({ id, position }) =>
      supabase
        .from('book_chapter_epubs')
        .update({ position })
        .eq('id', id)
        .eq('book_id', bookId)
    );

    await Promise.all(updates);
  },

  async uploadChapterEpub(file: File, bookId: string, chapterNumber: number): Promise<string> {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const filePath = `${bookId}/chapter-${chapterNumber}-${timestamp}-${randomString}.epub`;

    const { error: uploadError } = await supabase.storage
      .from('epubs')
      .upload(filePath, file, {
        contentType: 'application/epub+zip',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('epubs')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  },

  async uploadChapterIllustration(file: File): Promise<string> {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop();
    const filePath = `illustrations/${timestamp}-${randomString}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from('book-covers')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('book-covers')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  },

  async uploadChapterOPF(file: File, bookId: string, chapterNumber: number): Promise<string> {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const filePath = `${bookId}/chapter-${chapterNumber}-${timestamp}-${randomString}.opf`;

    const { error: uploadError } = await supabase.storage
      .from('epubs')
      .upload(filePath, file, {
        contentType: 'application/oebps-package+xml',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('epubs')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  },
};
