import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Section from '@/components/Section';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

// Ensure data is revalidated every 60 seconds (prevents stale static pages)
export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>; // Updated: params is now a Promise
}

// 1. Generate Metadata
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params; // Await the params
  
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.cover_image ? [{ url: post.cover_image }] : [],
      type: 'article',
      publishedTime: post.date,
      authors: ['Frankline Chisom Ebere'],
    },
  };
}

// 2. Fetch Data
async function getBlogPost(slug: string) {
  if (!slug) return null;
  
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error(`Supabase fetch error for slug "${slug}":`, error.message);
    return null;
  }
  
  return data;
}

// 3. Page Component
export default async function BlogPost(props: Props) {
  const params = await props.params; // Await the params here too
  const post = await getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-6 pt-8 pb-20">
      <Section>
        <Link href="/blog" className="inline-flex items-center text-sm text-slate-500 hover:text-primary mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to Articles
        </Link>
        
        <div className="mb-6 flex flex-wrap gap-4 text-sm text-slate-400 font-mono">
            <span className="flex items-center gap-2">
                <Calendar size={14} /> {post.date}
            </span>
            <span className="flex items-center gap-2">
                <Clock size={14} /> {post.read_time}
            </span>
            <span className="text-accent font-semibold uppercase tracking-wider px-2 py-0.5 border border-slate-100 rounded">
                {post.category}
            </span>
        </div>

        <h1 className="font-serif text-3xl md:text-5xl text-primary leading-tight mb-8">
          {post.title}
        </h1>

        {post.cover_image && (
          <div className="mb-10 relative w-full h-[300px] md:h-[500px]">
            <Image 
              src={post.cover_image} 
              alt={post.title}
              fill
              className="object-cover rounded-sm shadow-sm"
              priority
            />
          </div>
        )}

        <div className="prose prose-sm sm:prose-base md:prose-lg prose-slate max-w-none 
          prose-headings:break-words
          prose-p:break-words prose-p:text-slate-700
          prose-a:break-words
          prose-code:break-words
          overflow-hidden w-full
          font-light prose-headings:font-serif prose-headings:text-primary prose-a:text-accent prose-a:no-underline hover:prose-a:underline">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-100">
             <h4 className="font-serif text-lg text-primary mb-4">About the Author</h4>
             <p className="text-slate-600 text-sm leading-relaxed">
                 Frankline Chisom Ebere explores the convergence of international finance, dispute resolution, and the digital economy.
             </p>
        </div>
      </Section>
    </div>
  );
}