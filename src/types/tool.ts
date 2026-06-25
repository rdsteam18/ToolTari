export interface ToolSEOData {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
}

export interface ToolSchemaData {
  type: string;
  applicationCategory: string;
  operatingSystem?: string;
  browserRequirements?: string;
}

export interface ToolRegistryEntry {
  id: string;
  name: string;
  category: string; // e.g., 'pdf', 'image', 'developer', etc.
  categorySlug: string; // e.g., 'pdf-tools', 'image-tools', etc.
  slug: string; // clean url route, e.g. '/pdf-tools/merge-pdf'
  description: string;
  icon: string;
  popularity: number;
  status: 'active' | 'coming-soon';
  seo: ToolSEOData;
  schema: ToolSchemaData;
  relatedTools: string[]; // List of related tool IDs
}
