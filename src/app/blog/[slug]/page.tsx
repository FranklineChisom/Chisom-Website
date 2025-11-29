import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/lib/supabase';
import { BlogPost } from '@/types';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (data) {
    return {
      id: data.id,
      slug: data.slug,
      title: data.title,
      date: data.date,
      category: data.category,
      readTime: data.read_time,
      excerpt: data.excerpt,
      content: data.content,
      coverImage: data.cover_image,
      published: data.published
    };
  }

  const { data: dataById } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', slug)
    .single();

  if (dataById) {
      return {
      id: dataById.id,
      slug: dataById.slug,
      title: dataById.title,
      date: dataById.date,
      category: dataById.category,
      readTime: dataById.read_time,
      excerpt: dataById.excerpt,
      content: dataById.content,
      coverImage: dataById.cover_image,
      published: dataById.published
    };
  }

  // No fallback to constants
  return null;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const post = await getBlogPost(params.slug);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [{ url: post.coverImage }] : [],
      type: 'article',
      publishedTime: post.date,
      authors: ['Frankline Chisom Ebere'],
      url: `https://franklinechisom.com/blog/${post.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : [],
    }
  };
}

export default async function BlogPostPage(props: Props) {
  const params = await props.params;
  const post = await getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-6 pt-8 pb-20">
      {/* Removed Section wrapper to ensure immediate visibility for SEO */}
      <div className="animate-in fade-in duration-500">
        <Link href="/blog" className="inline-flex items-center text-sm text-slate-500 hover:text-primary mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to Articles
        </Link>
        
        <div className="mb-6 flex flex-wrap gap-4 text-sm text-slate-400 font-mono">
            <span className="flex items-center gap-2">
                <Calendar size={14} /> {post.date}
            </span>
            <span className="flex items-center gap-2">
                <Clock size={14} /> {post.readTime}
            </span>
            <span className="text-accent font-semibold uppercase tracking-wider px-2 py-0.5 border border-slate-100 rounded">
                {post.category}
            </span>
        </div>

        <h1 className="font-serif text-3xl md:text-5xl text-primary leading-tight mb-8 font-normal">
          {post.title}
        </h1>

        {post.coverImage && (
          <div className="mb-10 relative w-full h-auto">
            <img 
              src={post.coverImage} 
              alt={post.title}
              className="w-full h-auto object-cover max-h-[500px] rounded-none shadow-sm"
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
      </div>
    </div>
  );
}