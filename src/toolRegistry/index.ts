import type { ToolRegistryEntry } from '../types/tool';
import { pdfTools } from './pdf.tools';
import { imageTools } from './image.tools';
import { developerTools } from './developer.tools';
import { aiTools } from './ai.tools';
import { audioTools } from './audio.tools';

// Combine all tools into a single registry
export const allTools: ToolRegistryEntry[] = [
  ...pdfTools,
  ...imageTools,
  ...developerTools,
  ...aiTools,
  ...audioTools
];

/**
 * Get all registered tools
 */
export function getAllTools(): ToolRegistryEntry[] {
  return allTools;
}

/**
 * Filter tools by their category slug (e.g. 'pdf-tools')
 */
export function getToolsByCategory(categorySlug: string): ToolRegistryEntry[] {
  return allTools.filter(t => t.categorySlug === categorySlug);
}

/**
 * Find a specific tool entry by its unique ID
 */
export function findToolById(id: string): ToolRegistryEntry | undefined {
  return allTools.find(t => t.id === id);
}

/**
 * Find a specific tool entry by its URL slug path (e.g. '/pdf-tools/merge-pdf')
 * Handles trailing slashes or legacy .html extensions by normalization
 */
export function findToolBySlug(slug: string): ToolRegistryEntry | undefined {
  // Normalize slug to handle potential formats
  let normalized = slug.trim().toLowerCase();
  
  // Strip trailing slash
  if (normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  
  // Strip legacy .html
  if (normalized.endsWith('.html')) {
    normalized = normalized.slice(0, -5);
  }

  // Also support prefix mapping (e.g. convert /tools/merge-pdf to /pdf-tools/merge-pdf)
  if (normalized.startsWith('/tools/')) {
    const baseSlug = normalized.replace('/tools/', '');
    // Try to find matching ID or base slug
    const matched = allTools.find(t => t.id === baseSlug || t.slug.endsWith(baseSlug));
    if (matched) return matched;
  }

  return allTools.find(t => {
    const entrySlugNormalized = t.slug.toLowerCase();
    return entrySlugNormalized === normalized || 
           entrySlugNormalized === `${normalized}.html` ||
           entrySlugNormalized.replace('-tools', '/tools').endsWith(normalized);
  });
}
