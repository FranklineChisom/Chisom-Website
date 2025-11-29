import React from 'react';
import { supabase } from '@/lib/supabase';
import { BlogPost } from '@/types';
import BlogList from '@/components/BlogList';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Articles on law, policy, and African economics by Frankline Chisom Ebere.',
  openGraph: {
    title: 'Blog | Frankline Chisom Ebere',
    description: 'Articles on law, policy, and African economics.',
    url: 'https://franklinechisom.com/blog',
  }
};

async function getBlogPosts() {
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true);

  if (!data || data.length === 0) {
    return []; 
  }

  // Robust client-side sorting to handle various date formats string/ISO
  const sortedData = data.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return sortedData.map((p: any) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    date: p.date,
    excerpt: p.excerpt,
    content: p.content,
    category: p.category,
    readTime: p.read_time,
    coverImage: p.cover_image,
    published: p.published
  })) as BlogPost[];
}

export default async function BlogPage() {
  const blogPosts = await getBlogPosts();
  return <BlogList initialPosts={blogPosts} />;
}