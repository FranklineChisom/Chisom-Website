import { useEffect } from 'react';

interface SEOOptions {
  title?: string;
  description?: string;
  keywords?: string;
  url?: string;
  type?: string;
}

export const usePageTitle = (title: string, siteName: string = "Frankline Chisom Ebere") => {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    document.title = fullTitle;
    
    return () => {
      document.title = siteName;
    };
  }, [title, siteName]);
};

export const useSEO = (options: SEOOptions) => {
  const {
    title,
    description,
    keywords,
    url,
    type = 'website'
  } = options;

  useEffect(() => {
    const siteName = 'Frankline Chisom Ebere';
    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    const defaultDescription = 'Legal scholar specializing in International Financial Law and African capital markets.';
    const metaDescription = description || defaultDescription;
    const siteUrl = 'https://franklinechisom.com';
    const pageUrl = url || siteUrl;

    // Set title
    document.title = fullTitle;

    // Helper function to set or update meta tags
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Set canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', pageUrl);

    // Basic meta tags
    setMetaTag('description', metaDescription);
    if (keywords) setMetaTag('keywords', keywords);

    // Open Graph tags
    setMetaTag('og:title', fullTitle, true);
    setMetaTag('og:description', metaDescription, true);
    setMetaTag('og:url', pageUrl, true);
    setMetaTag('og:type', type, true);
    setMetaTag('og:site_name', siteName, true);

    // Twitter tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', fullTitle);
    setMetaTag('twitter:description', metaDescription);

  }, [title, description, keywords, url, type]);
};