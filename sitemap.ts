import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://franklinechisom.com';

  // 1. Static Routes
  const routes = [
    '',
    '/about',
    '/research',
    '/blog',
    '/contact',
    '/current-focus',
    '/newsletters',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 1,
  }));

  // 2. Dynamic Blog Posts
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('published', true);

  const blogRoutes = (posts || []).map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 3. Dynamic Newsletters
  const { data: newsletters } = await supabase
    .from('newsletters')
    .select('slug, updated_at')
    .eq('published', true);

  const newsletterRoutes = (newsletters || []).map((item) => ({
    url: `${baseUrl}/newsletters/${item.slug}`,
    lastModified: new Date(item.updated_at || new Date()),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...routes, ...blogRoutes, ...newsletterRoutes];
}