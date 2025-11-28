'use client';

import React, { useEffect } from 'react';
import { useData } from '@/contexts/DataContext';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'book' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  contentType?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = 'website',
  contentType
}) => {
  const { siteConfig } = useData();

  // Defaults
  const siteName = siteConfig.name || 'Frankline Chisom Ebere';
  const defaultDescription = siteConfig.role + ' specializing in International Financial Law and African capital markets.';
  const siteUrl = 'https://franklinechisom.com';
  
  // Computed Values
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const metaDescription = description || defaultDescription;
  const metaImage = image || `${siteUrl}/images/og-image.jpg`;
  const canonicalUrl = url ? (url.startsWith('http') ? url : `${siteUrl}${url}`) : siteUrl;

  useEffect(() => {
    // Update Title
    document.title = fullTitle;

    // Helper to update meta tags dynamically
    const updateMeta = (name: string, content: string, attribute = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Update Basic Meta
    updateMeta('description', metaDescription);
    if (keywords) updateMeta('keywords', keywords);
    updateMeta('author', siteConfig.name);

    // Update Open Graph
    updateMeta('og:title', fullTitle, 'property');
    updateMeta('og:description', metaDescription, 'property');
    updateMeta('og:url', canonicalUrl, 'property');
    updateMeta('og:type', type, 'property');
    updateMeta('og:image', metaImage, 'property');

    // Update Twitter
    updateMeta('twitter:title', fullTitle, 'name');
    updateMeta('twitter:description', metaDescription, 'name');
    updateMeta('twitter:image', metaImage, 'name');

  }, [fullTitle, metaDescription, keywords, siteConfig.name, canonicalUrl, type, metaImage]);

  return null; // This component doesn't render anything visibly
};

export default SEO;