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

  async uploadMergedEpub(blob: Blob, bookId: string, chapterNumber: number): Promise<string> {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const filePath = `${bookId}/chapter-${chapterNumber}-merged-${timestamp}-${randomString}.epub`;

    const { error: uploadError } = await supabase.storage
      .from('epubs')
      .upload(filePath, blob, {
        contentType: 'application/epub+zip',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('epubs')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  },

  async uploadAndMergeChapter(
    epubFile: File, 
    opfFile: File | null, 
    bookId: string, 
    chapterNumber: number
  ): Promise<{ epub_url: string; opf_url: string | null; merged_epub_url: string | null }> {
    const epub_url = await this.uploadChapterEpub(epubFile, bookId, chapterNumber);
    
    let opf_url: string | null = null;
    let merged_epub_url: string | null = null;
    
    if (opfFile) {
      opf_url = await this.uploadChapterOPF(opfFile, bookId, chapterNumber);
      
      try {
        const SUPABASE_URL = "https://aotzivwzoxmnnawcxioo.supabase.co";
        const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvdHppdnd6b3htbm5hd2N4aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5OTEwODYsImV4cCI6MjA2NTU2NzA4Nn0.n-S4MY36dvh2C8f8hRV3AH98VI5gtu3TN_Szb9G_ZQA";
        
        const response = await fetch(`${SUPABASE_URL}/functions/v1/merge-epub-opf`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'apikey': SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ epubUrl: epub_url, opfUrl: opf_url }),
        });
        
        if (response.ok) {
          const mergedBlob = await response.blob();
          merged_epub_url = await this.uploadMergedEpub(mergedBlob, bookId, chapterNumber);
          console.log('✅ EPUB merged and uploaded successfully');
        }
      } catch (error) {
        console.warn('⚠️ Failed to merge EPUB during upload, will merge on-demand:', error);
      }
    }
    
    return { epub_url, opf_url, merged_epub_url };
  },
};
