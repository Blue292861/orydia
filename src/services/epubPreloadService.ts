/**
 * Global EPUB preload service with LRU cache
 * Handles preloading and caching of EPUB files for faster chapter transitions
 */

const MAX_CACHE_SIZE = 5;

interface CacheEntry {
  blob: Blob;
  timestamp: number;
  chapterId: string;
}

class EpubPreloadService {
  private cache: Map<string, CacheEntry> = new Map();
  private pendingPreloads: Map<string, Promise<Blob | null>> = new Map();

  /**
   * Get a cached EPUB blob for a chapter
   */
  getCachedBlob(chapterId: string): Blob | null {
    const entry = this.cache.get(chapterId);
    if (entry) {
      // Update timestamp for LRU
      entry.timestamp = Date.now();
      return entry.blob;
    }
    return null;
  }

  /**
   * Check if a chapter is currently being preloaded
   */
  isPreloading(chapterId: string): boolean {
    return this.pendingPreloads.has(chapterId);
  }

  /**
   * Check if a chapter is cached
   */
  isCached(chapterId: string): boolean {
    return this.cache.has(chapterId);
  }

  /**
   * Preload a chapter EPUB into cache
   */
  async preloadChapter(chapterId: string, epubUrl: string): Promise<Blob | null> {
    // Already cached
    if (this.cache.has(chapterId)) {
      return this.getCachedBlob(chapterId);
    }

    // Already preloading
    if (this.pendingPreloads.has(chapterId)) {
      return this.pendingPreloads.get(chapterId) || null;
    }

    // Start preloading
    const preloadPromise = this.fetchAndCache(chapterId, epubUrl);
    this.pendingPreloads.set(chapterId, preloadPromise);

    try {
      const blob = await preloadPromise;
      return blob;
    } finally {
      this.pendingPreloads.delete(chapterId);
    }
  }

  private async fetchAndCache(chapterId: string, epubUrl: string): Promise<Blob | null> {
    try {
      console.log(`📥 Preloading chapter ${chapterId}...`);
      const startTime = performance.now();
      
      const response = await fetch(epubUrl, {
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        console.warn(`⚠️ Failed to preload chapter ${chapterId}: ${response.status}`);
        return null;
      }

      const blob = await response.blob();
      const duration = Math.round(performance.now() - startTime);
      console.log(`✅ Preloaded chapter ${chapterId} in ${duration}ms (${Math.round(blob.size / 1024)}KB)`);

      // Enforce LRU cache limit
      this.enforceMaxCacheSize();

      // Add to cache
      this.cache.set(chapterId, {
        blob,
        timestamp: Date.now(),
        chapterId,
      });

      return blob;
    } catch (error) {
      console.warn(`⚠️ Error preloading chapter ${chapterId}:`, error);
      return null;
    }
  }

  private enforceMaxCacheSize(): void {
    if (this.cache.size >= MAX_CACHE_SIZE) {
      // Find oldest entry
      let oldest: { key: string; timestamp: number } | null = null;
      
      for (const [key, entry] of this.cache.entries()) {
        if (!oldest || entry.timestamp < oldest.timestamp) {
          oldest = { key, timestamp: entry.timestamp };
        }
      }

      if (oldest) {
        console.log(`🗑️ Evicting oldest cache entry: ${oldest.key}`);
        this.cache.delete(oldest.key);
      }
    }
  }

  /**
   * Clear a specific chapter from cache
   */
  clearChapter(chapterId: string): void {
    this.cache.delete(chapterId);
  }

  /**
   * Clear entire cache
   */
  clearAll(): void {
    this.cache.clear();
    this.pendingPreloads.clear();
  }

  /**
   * Get cache stats for debugging
   */
  getStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}

// Singleton instance
export const epubPreloadService = new EpubPreloadService();
