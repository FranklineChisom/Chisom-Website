import React from 'react';
import { supabase } from '@/lib/supabase';
import { Publication } from '@/types';
import type { Metadata } from 'next';
import ResearchList from '@/components/ResearchList';

export const metadata: Metadata = {
  title: 'Research & Publications',
  description: 'Publications on African capital markets, AfCFTA, dispute settlement, and international financial law.',
  keywords: 'legal research, AfCFTA publications, African capital markets, arbitration',
  openGraph: {
    title: 'Research & Publications | Frankline Chisom Ebere',
    description: 'Publications on African capital markets, AfCFTA, dispute settlement, and international financial law.',
    url: 'https://franklinechisom.com/research'
  }
};

async function getPublications() {
  const { data } = await supabase
    .from('publications')
    .select('*')
    .eq('published', true);

  if (!data || data.length === 0) {
    return []; // No fallback, return empty array
  }

  return data.map((pub: any) => ({
    id: pub.id,
    title: pub.title,
    year: pub.year,
    venue: pub.venue,
    type: pub.type,
    featured: pub.featured,
    abstract: pub.abstract,
    coAuthors: pub.co_authors,
    link: pub.link,
    published: pub.published
  })) as Publication[];
}

export default async function ResearchPage() {
  const publications = await getPublications();
  return <ResearchList initialPublications={publications} />;
}