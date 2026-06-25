import type { AIResult } from './types';

interface CachedEntry {
  result: AIResult;
  timestamp: number;
}

const CACHE_PREFIX = 'tooltari_ai_cache_';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// In-Memory cache map
const memoryCache = new Map<string, CachedEntry>();

/**
 * Fast, non-cryptographic string hashing algorithm (cyrb53)
 * Suitable for generating fast unique keys from prompt content.
 */
function cyrb53(str: string, seed = 0): string {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
}

export const aiCache = {
  /**
   * Generates a unique cache key based on prompt parameters
   */
  generateKey(systemInstruction: string, prompt: string, provider: string, temp: number): string {
    const combinedString = `${provider}:${temp}:${systemInstruction}:${prompt}`;
    return cyrb53(combinedString);
  },

  /**
   * Retrieve a result from the cache. Returns null if not found or expired.
   */
  get(key: string, isPrivate = false): AIResult | null {
    // Privacy safeguard: never retrieve cached outputs for private context queries
    if (isPrivate) {
      return null;
    }

    const now = Date.now();

    // 1. Check Memory Cache
    const memEntry = memoryCache.get(key);
    if (memEntry) {
      if (now - memEntry.timestamp < CACHE_TTL_MS) {
        return memEntry.result;
      }
      // Expired: delete
      memoryCache.delete(key);
    }

    // 2. Check LocalStorage Fallback
    try {
      const stored = localStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (stored) {
        const parsed = JSON.parse(stored) as CachedEntry;
        if (now - parsed.timestamp < CACHE_TTL_MS) {
          // Put back in memory cache for faster subsequent hits
          memoryCache.set(key, parsed);
          return parsed.result;
        }
        // Expired: remove
        localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      }
    } catch (e) {
      console.warn('aiCache: Failed to read from localStorage', e);
    }

    return null;
  },

  /**
   * Store a result in the cache (both memory and localStorage)
   */
  set(key: string, result: AIResult, isPrivate = false): void {
    // Privacy safeguard: never cache private prompt inputs or uploaded files
    if (isPrivate || !result.success) {
      return;
    }

    const entry: CachedEntry = {
      result,
      timestamp: Date.now()
    };

    // 1. Save in Memory
    memoryCache.set(key, entry);

    // 2. Save in LocalStorage
    try {
      localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
    } catch (e) {
      console.warn('aiCache: Failed to write to localStorage', e);
    }
  },

  /**
   * Clear all expired entries from localStorage
   */
  cleanExpired(): void {
    const now = Date.now();
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CACHE_PREFIX)) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const parsed = JSON.parse(stored) as CachedEntry;
            if (now - parsed.timestamp >= CACHE_TTL_MS) {
              localStorage.removeItem(key);
            }
          }
        }
      }
    } catch (e) {
      console.warn('aiCache: Failed to clean expired entries', e);
    }
  }
};
