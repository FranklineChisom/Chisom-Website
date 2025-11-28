import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Section from '@/components/Section';
import SearchBar from '@/components/SearchBar';
import NewsletterForm from '@/components/NewsletterForm';
import { supabase } from '@/lib/supabase';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Articles on law, policy, and African economics.',
};

// Fetch data on the server
async function getBlogPosts() {
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('date', { ascending: false });
  return data || [];
}

export default async function Blog() {
  const blogPosts = await getBlogPosts();

  return (
    <div className="max-w-4xl mx-auto px-6 space-y-20">
      <Section>
        <h1 className="font-serif text-4xl md:text-5xl text-primary mb-8">Writings</h1>
        <p className="text-xl text-slate-600 font-light leading-relaxed max-w-2xl mb-8">
          Thoughts on law, policy, and the future of African markets.
        </p>
        
        {/* SearchBar is a Client Component, so passing data to it works fine */}
        <SearchBar 
          blogPosts={blogPosts} 
          scope="blog"
          placeholder="Search articles..."
        />
      </Section>

      <Section delay={100}>
        <div className="grid gap-16">
          {blogPosts.length > 0 ? blogPosts.map((post) => (
            <article key={post.id} className="group flex flex-col md:grid md:grid-cols-4 gap-6 items-start">
              <div className="md:col-span-1 text-sm text-slate-400 font-mono pt-1">
                {post.date}
                <div className="mt-2 text-xs text-accent uppercase tracking-wider font-semibold">{post.category}</div>
              </div>
              <div className="md:col-span-3">
                {/* 3. Link Update */}
                <Link href={`/blog/${post.slug || post.id}`}>
                  <h2 className="font-serif text-2xl text-primary font-medium mb-3 group-hover:text-teal-700 transition-colors cursor-pointer">
                    {post.title}
                  </h2>
                </Link>
                <p className="text-slate-600 leading-relaxed mb-4">
                  {post.excerpt}
                </p>
                <Link href={`/blog/${post.slug || post.id}`} className="inline-flex items-center text-sm font-medium text-slate-800 hover:text-primary transition-colors">
                  Read Article <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </article>
          )) : (
            <p className="text-slate-500 italic">No articles published yet.</p>
          )}
        </div>
      </Section>

      {/* Newsletter Stub */}
      <Section delay={200} className="border-t border-slate-100 pt-12 mt-12">
        <div className="bg-slate-50 p-8 flex flex-col md:flex-row justify-between items-center gap-6 rounded-sm">
            <div>
                <h4 className="font-serif text-lg text-primary mb-2">Stay Updated</h4>
                <p className="text-slate-500 text-sm">Receive occasional updates on my latest research.</p>
            </div>
            <div className="w-full md:w-auto">
               <NewsletterForm />
            </div>
        </div>
      </Section>
    </div>
  );
}