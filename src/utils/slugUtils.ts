/**
 * Utility functions for creating and managing URL slugs for books and audiobooks
 */

/**
 * Convert a string to a URL-friendly slug
 */
export const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD') // Normalize unicode characters
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Create a book URL path from author and title
 */
export const createBookPath = (author: string, title: string): string => {
  const authorSlug = createSlug(author);
  const titleSlug = createSlug(title);
  return `/${authorSlug}/${titleSlug}`;
};

/**
 * Create a shareable URL for a book
 */
export const createShareableBookUrl = (author: string, title: string): string => {
  const path = createBookPath(author, title);
  return `${window.location.origin}${path}`;
};

/**
 * Parse a book path to extract author and title slugs
 */
export const parseBookPath = (path: string): { authorSlug: string; titleSlug: string } | null => {
  const pathParts = path.split('/').filter(Boolean);
  
  if (pathParts.length !== 2) {
    return null;
  }
  
  return {
    authorSlug: pathParts[0],
    titleSlug: pathParts[1]
  };
};

/**
 * Find a book or audiobook by matching author and title slugs
 */
export const findWorkBySlug = <T extends { author: string; title?: string; name?: string }>(
  works: T[],
  authorSlug: string,
  titleSlug: string
): T | undefined => {
  return works.find(work => {
    const workTitle = work.title || work.name || '';
    const workAuthorSlug = createSlug(work.author);
    const workTitleSlug = createSlug(workTitle);
    
    return workAuthorSlug === authorSlug && workTitleSlug === titleSlug;
  });
};