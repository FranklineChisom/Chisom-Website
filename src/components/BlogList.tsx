'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, AlertCircle, Loader2 } from 'lucide-react';
import Section from '@/components/Section';
import Pagination from '@/components/Pagination';
import SearchBar from '@/components/SearchBar';
import { BlogPost } from '@/types';
import { useData } from '@/contexts/DataContext';

interface BlogListProps {
  initialPosts: BlogPost[];
}

const ITEMS_PER_PAGE = 5;

const BlogList: React.FC<BlogListProps> = ({ initialPosts }) => {
  const { addSubscriber } = useData();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [currentPage, setCurrentPage] = useState(1);

  const handleSubscribe = async () => {
    if(!email) return;
    setStatus('loading');
    const success = await addSubscriber(email);
    setTimeout(() => {
        if(success) setStatus('success');
        else setStatus('error');
    }, 500);
  };

  // Use initialPosts passed from server
  const publishedPosts = initialPosts.filter(post => post.published);

  const totalPages = Math.ceil(publishedPosts.length / ITEMS_PER_PAGE);
  const currentPosts = publishedPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 space-y-20">
      <Section>
        <h1 className="font-serif text-4xl md:text-5xl text-primary font-normal mb-8">Writings</h1>
        <p className="text-xl text-slate-600 font-light leading-relaxed max-w-2xl mb-8">
          Thoughts on law, policy, and the future of African markets.
        </p>
        
        <SearchBar 
          blogPosts={publishedPosts} 
          scope="blog"
          placeholder="Search articles..."
        />
      </Section>

      <Section delay={100}>
        <div className="grid gap-16">
          {currentPosts.length > 0 ? currentPosts.map((post) => (
            <article key={post.id} className="group flex flex-col md:grid md:grid-cols-4 gap-6 items-start">
              <div className="md:col-span-1 text-sm text-slate-400 font-mono pt-1">
                {post.date}
                <div className="mt-2 text-xs text-accent uppercase tracking-wider font-semibold">{post.category}</div>
              </div>
              <div className="md:col-span-3">
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

        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={handlePageChange} 
        />
      </Section>

      <Section delay={200} className="border-t border-slate-100 pt-12 mt-12">
        <div className="bg-slate-50 p-8 flex flex-col md:flex-row justify-between items-center gap-6 rounded-sm">
            <div>
                <h4 className="font-serif text-lg text-primary mb-2">Stay Updated</h4>
                <p className="text-slate-500 text-sm">Receive occasional updates on my latest research.</p>
            </div>
            <div className="flex flex-col w-full md:w-auto gap-2">
                {status === 'success' ? (
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 text-primary font-medium px-4 py-2 border border-primary/20 bg-primary/5 rounded">
                            <Check size={18} /> Subscribed!
                        </div>
                        <Link href={`/unsubscribe?email=${encodeURIComponent(email)}`} className="text-xs text-slate-400 mt-2 hover:text-primary underline">
                            Mistake? Unsubscribe here.
                        </Link>
                    </div>
                ) : status === 'loading' ? (
                      <div className="flex items-center gap-2 text-slate-500 px-4 py-2">
                         <Loader2 size={20} className="animate-spin" /> Checking...
                       </div>
                ) : status === 'error' ? (
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 text-yellow-600 font-medium px-4 py-2 border border-yellow-200 bg-yellow-50 rounded">
                            <AlertCircle size={18} /> Already Subscribed
                        </div>
                         <div className="flex gap-2 text-xs mt-2">
                             <button onClick={() => setStatus('idle')} className="text-primary hover:underline">Try again</button>
                             <Link href={`/unsubscribe?email=${encodeURIComponent(email)}`} className="text-slate-400 hover:text-primary underline">
                                Unsubscribe
                             </Link>
                         </div>
                    </div>
                ) : (
                    <div className="flex w-full md:w-auto gap-2">
                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="px-4 py-2 border border-slate-200 focus:outline-none focus:border-primary w-full md:w-64" 
                        />
                        <button onClick={handleSubscribe} className="bg-primary text-white px-6 py-2 font-medium hover:bg-slate-800 transition-colors">Subscribe</button>
                    </div>
                )}
            </div>
        </div>
      </Section>
    </div>
  );
};

export default BlogList;