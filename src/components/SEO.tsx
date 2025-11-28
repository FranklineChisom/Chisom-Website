import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useData } from '../contexts/DataContext';

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
  contentType?: string; // For structured data (e.g., 'BlogPosting', 'Person')
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = 'website',
  publishedTime,
  modifiedTime,
  section,
  tags,
  contentType
}) => {
  const { siteConfig } = useData();

  // Defaults
  const siteName = siteConfig.name || 'Frankline Chisom Ebere';
  const defaultDescription = siteConfig.role + ' specializing in International Financial Law and African capital markets.';
  const siteUrl = 'https://franklinechisom.com';
  const twitterHandle = '@Frankline_Rolis';
  
  // Computed Values
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const metaDescription = description || defaultDescription;
  const metaImage = image || `${siteUrl}/images/og-image.jpg`; // Ensure you have a default OG image
  const canonicalUrl = url ? (url.startsWith('http') ? url : `${siteUrl}${url}`) : siteUrl;

  // JSON-LD Structured Data Generator
  const getStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
      "@type": contentType || "WebSite",
      "name": fullTitle,
      "url": canonicalUrl,
    };

    if (contentType === 'Person' || type === 'profile') {
      return {
        ...baseData,
        "@type": "Person",
        "name": siteConfig.name,
        "jobTitle": siteConfig.role,
        "url": siteUrl,
        "image": siteConfig.aboutImage,
        "sameAs": [
          siteConfig.social.linkedin,
          siteConfig.social.twitter,
          siteConfig.social.scholar,
          siteConfig.social.ssrn
        ].filter(Boolean)
      };
    }

    if (contentType === 'BlogPosting' || type === 'article') {
      return {
        ...baseData,
        "@type": "BlogPosting",
        "headline": title,
        "image": metaImage,
        "author": {
          "@type": "Person",
          "name": siteConfig.name,
          "url": siteUrl
        },
        "publisher": {
          "@type": "Organization",
          "name": siteName,
          "logo": {
            "@type": "ImageObject",
            "url": `${siteUrl}/logo.png` // Ensure you have a logo or remove this line
          }
        },
        "datePublished": publishedTime,
        "dateModified": modifiedTime || publishedTime,
        "description": metaDescription,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": canonicalUrl
        }
      };
    }

    return baseData;
  };

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />
      <meta name="author" content={siteConfig.name} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* Article Specifics */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {section && <meta property="article:section" content={section} />}
      {tags && tags.map(tag => (
        <meta property="article:tag" content={tag} key={tag} />
      ))}

      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify(getStructuredData())}
      </script>
    </Helmet>
  );
};

export default SEO;