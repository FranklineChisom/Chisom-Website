import React from 'react';
import { supabase } from '@/lib/supabase';
import { BLOG_POSTS } from '@/constants';
import { BlogPost } from '@/types';
import BlogList from '@/components/BlogList';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Articles on law, policy, and African economics by Frankline Chisom Ebere.',
  keywords: 'legal blog, law articles, AfCFTA analysis, arbitration insights, African capital markets',
  openGraph: {
    title: 'Blog | Frankline Chisom Ebere',
    description: 'Articles on law, policy, and African economics.',
    url: 'https://franklinechisom.com/blog',
  }
};

// Fetch data on the server
async function getBlogPosts() {
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('date', { ascending: false });

  // Fallback to constants if DB is empty or fails
  if (!data || data.length === 0) {
    return BLOG_POSTS;
  }

  // Map snake_case DB fields to camelCase TS types
  return data.map((p: any) => ({
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