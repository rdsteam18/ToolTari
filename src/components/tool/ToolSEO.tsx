import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE_CONFIG } from '../../config/site';

interface SEOProps {
  title: string;
  description: string;
  schema?: Record<string, any> | Record<string, any>[];
  canonicalUrl?: string;
  ogType?: 'website' | 'article';
}

export default function ToolSEO({
  title,
  description,
  schema,
  canonicalUrl,
  ogType = 'website'
}: SEOProps) {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Update Title tag
    const fullTitle = title.includes(SITE_CONFIG.name) ? title : `${title} | ${SITE_CONFIG.name}`;
    document.title = fullTitle;

    // 2. Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // 3. Update Canonical URL
    const canonical = canonicalUrl || `${SITE_CONFIG.url}${pathname}`;
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonical);

    // 4. Update Open Graph Meta Tags
    const updateMetaTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateMetaTag('og:title', fullTitle);
    updateMetaTag('og:description', description);
    updateMetaTag('og:url', canonical);
    updateMetaTag('og:type', ogType);
    updateMetaTag('og:image', `${SITE_CONFIG.url}/assets/img/og-image.jpg`);

    // 5. Update JSON-LD Schema.org script tag
    let schemaScript = document.getElementById('jsonld-schema');
    if (schemaScript) {
      schemaScript.remove();
    }

    if (schema) {
      schemaScript = document.createElement('script');
      schemaScript.setAttribute('id', 'jsonld-schema');
      schemaScript.setAttribute('type', 'application/ld+json');
      schemaScript.innerHTML = JSON.stringify(schema);
      document.head.appendChild(schemaScript);
    }

    return () => {
      // Cleanup schema scripts on unmount if necessary
      const scriptToRemove = document.getElementById('jsonld-schema');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [title, description, schema, canonicalUrl, pathname, ogType]);

  return null; // Side-effect only component
}
export { ToolSEO };
