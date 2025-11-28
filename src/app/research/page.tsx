import React from 'react';
import { ExternalLink } from 'lucide-react';
import Pagination from '@/components/Pagination';
import SearchBar from '@/components/SearchBar';
import Section from '@/components/Section';
import { supabase } from '@/lib/supabase';
import { PUBLICATIONS } from '@/constants';
import { Publication } from '@/types';
import type { Metadata } from 'next';

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

// Fetch data on server
async function getPublications() {
  const { data } = await supabase
    .from('publications')
    .select('*')
    .eq('published', true);

  if (!data || data.length === 0) {
    return PUBLICATIONS;
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

// Client Component for interactive list
import ResearchList from '@/components/ResearchList';

export default async function ResearchPage() {
  const publications = await getPublications();
  return <ResearchList initialPublications={publications} />;
}