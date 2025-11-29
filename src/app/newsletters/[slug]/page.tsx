import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, Mail } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/lib/supabase';
import { NEWSLETTERS } from '@/constants';
import { Newsletter } from '@/types';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import NewsletterSubscribeBox from '@/components/NewsletterSubscribeBox';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

async function getNewsletter(slug: string): Promise<Newsletter | null> {
  const { data, error } = await supabase
    .from('newsletters')
    .select('*')
    .eq('slug', slug)
    .single();

  if (data) {
    return {
      id: data.id,
      slug: data.slug,
      title: data.title,
      date: data.date,
      description: data.description,
      content: data.content,
      coverImage: data.cover_image,
      published: data.published
    };
  }

  const { data: dataById } = await supabase
    .from('newsletters')
    .select('*')
    .eq('id', slug)
    .single();

  if (dataById) {
      return {
      id: dataById.id,
      slug: dataById.slug,
      title: dataById.title,
      date: dataById.date,
      description: dataById.description,
      content: dataById.content,
      coverImage: dataById.cover_image,
      published: dataById.published
    };
  }

  const constantItem = NEWSLETTERS.find(n => n.slug === slug || n.id === slug);
  return constantItem || null;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const post = await getNewsletter(params.slug);

  if (!post) {
    return { title: 'Newsletter Not Found' };
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      images: post.coverImage ? [{ url: post.coverImage }] : [],
      type: 'article',
      publishedTime: post.date,
      url: `https://franklinechisom.com/newsletters/${post.slug}`,
    },
  };
}

export default async function NewsletterPost(props: Props) {
  const params = await props.params;
  const post = await getNewsletter(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-6 pt-8 pb-20">
      {/* Removed Section wrapper for SEO visibility */}
      <div className="animate-in fade-in duration-500">
        <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-primary mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to Home
        </Link>
        
        <div className="mb-6 flex items-center gap-4 text-sm text-slate-400 font-mono">
            <span className="flex items-center gap-2">
                <Calendar size={14} /> {post.date}
            </span>
            <span className="flex items-center gap-2 text-accent">
                <Mail size={14} /> Newsletter Archive
            </span>
        </div>

        <h1 className="font-serif text-3xl md:text-5xl text-primary leading-tight mb-8">
          {post.title}
        </h1>

        {post.coverImage && (
          <div className="mb-10 relative w-full h-[300px] md:h-[500px]">
            <Image 
              src={post.coverImage} 
              alt={post.title} 
              fill
              className="object-cover rounded-none shadow-sm"
              priority
            />
          </div>
        )}

        <div className="prose prose-lg prose-slate max-w-none font-light prose-headings:font-serif prose-headings:text-primary prose-a:text-accent prose-a:no-underline hover:prose-a:underline">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        <div className="mt-16 pt-10 border-t border-slate-100 bg-slate-50 p-8 rounded-sm">
             <h4 className="font-serif text-xl text-primary mb-2">Subscribe for future updates</h4>
             <p className="text-slate-600 text-sm leading-relaxed mb-6">
                 If you enjoyed this issue, join the list to get the next one directly in your inbox.
             </p>
             <NewsletterSubscribeBox />
        </div>
      </div>
    </div>
  );
}