import { supabase } from '@/integrations/supabase/client';

export const extractFilePathFromUrl = (url: string): string | null => {
  if (!url) return null;
  // Extract file path from Supabase Storage URL
  const match = url.match(/\/storage\/v1\/object\/public\/[^\/]+\/(.+)$/);
  return match ? match[1] : null;
};

export const getBucketFromUrl = (url: string): string | null => {
  if (!url) return null;
  // Extract bucket name from Supabase Storage URL
  const match = url.match(/\/storage\/v1\/object\/public\/([^\/]+)\//);
  return match ? match[1] : null;
};

export const deleteStorageFile = async (url: string): Promise<void> => {
  const bucket = getBucketFromUrl(url);
  const filePath = extractFilePathFromUrl(url);
  
  if (!bucket || !filePath) {
    console.warn('Could not extract bucket or file path from URL:', url);
    return;
  }

  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);
    
    if (error) {
      console.warn(`Failed to delete file ${filePath} from ${bucket}:`, error);
    }
  } catch (error) {
    console.warn(`Error deleting file ${filePath}:`, error);
  }
};

export const deleteStorageFiles = async (urls: string[]): Promise<void> => {
  // Group files by bucket for efficient batch deletion
  const filesByBucket: Record<string, string[]> = {};
  
  urls.forEach(url => {
    const bucket = getBucketFromUrl(url);
    const filePath = extractFilePathFromUrl(url);
    
    if (bucket && filePath) {
      if (!filesByBucket[bucket]) {
        filesByBucket[bucket] = [];
      }
      filesByBucket[bucket].push(filePath);
    }
  });

  // Delete files by bucket
  for (const [bucket, paths] of Object.entries(filesByBucket)) {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove(paths);
      
      if (error) {
        console.warn(`Failed to delete files from ${bucket}:`, error);
      }
    } catch (error) {
      console.warn(`Error deleting files from ${bucket}:`, error);
    }
  }
};