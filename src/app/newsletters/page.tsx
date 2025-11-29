import React from 'react';
import { supabase } from '@/lib/supabase';
import { Newsletter } from '@/types';
import type { Metadata } from 'next';
import NewsletterList from '@/components/NewsletterList';

export const metadata: Metadata = {
  title: 'Newsletter Archive',
  description: 'Browse past issues on law, policy, and the economic future of Africa.',
  openGraph: {
    title: 'Newsletter Archive | Frankline Chisom Ebere',
    description: 'Browse past issues on law, policy, and the economic future of Africa.',
    url: 'https://franklinechisom.com/newsletters',
  }
};

async function getNewsletters() {
  const { data } = await supabase
    .from('newsletters')
    .select('*')
    .eq('published', true)
    .order('date', { ascending: false });

  if (!data || data.length === 0) {
    return []; // No fallback, return empty array
  }

  return data.map((n: any) => ({
    id: n.id,
    slug: n.slug,
    title: n.title,
    date: n.date,
    description: n.description,
    content: n.content,
    coverImage: n.cover_image,
    published: n.published
  })) as Newsletter[];
}

export default async function NewslettersPage() {
  const newsletters = await getNewsletters();
  return <NewsletterList initialNewsletters={newsletters} />;
}