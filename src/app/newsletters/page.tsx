import React from 'react';
import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';
import Section from '@/components/Section';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';
import { supabase } from '@/lib/supabase';
import { NEWSLETTERS } from '@/constants';
import { Newsletter } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Newsletter Archive',
  description: 'Browse past issues on law, policy, and the economic future of Africa.',
  openGraph: {
    title: 'Newsletter Archive | Frankline Chisom Ebere',
    description: 'Browse past issues on law, policy, and the economic future of Africa.',
    url: 'https://franklinechisom.com/newsletters',
  }
};

// Fetch data on the server
async function getNewsletters() {
  const { data } = await supabase
    .from('newsletters')
    .select('*')
    .eq('published', true)
    .order('date', { ascending: false });

  // Fallback to constants if DB is empty or fails
  if (!data || data.length === 0) {
    return NEWSLETTERS;
  }

  // Map snake_case DB fields to camelCase TS types
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

// Client Component for interactivity (Search & Pagination)
import NewsletterList from '@/components/NewsletterList';

export default async function NewslettersPage() {
  const newsletters = await getNewsletters();

  return <NewsletterList initialNewsletters={newsletters} />;
}