'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // 1. Next.js hooks
import Link from 'next/link';
import { ArrowLeft, Calendar, Mail, Check, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useData } from '@/contexts/DataContext';
import Section from '@/components/Section';

const NewsletterPost: React.FC = () => {
  const params = useParams(); // 2. Get params from Next.js hook
  const router = useRouter(); // 3. For programmatic navigation
  const id = params?.slug as string; // Access the dynamic segment safely

  const { newsletters, addSubscriber, isLoading } = useData();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const post = newsletters.find(n => n.slug === id || n.id === id);

  // 4. Handle Loading & Redirects
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading newsletter...</p>
        </div>
      </div>
    );
  }

  if (!isLoading && !post) {
    router.replace('/'); // 5. Use router.replace instead of <Navigate>
    return null;
  }

  if (!post) return null;

  const handleSubscribe = async () => {
    if(!email) return;
    setStatus('loading');
    const success = await addSubscriber(email);
    setTimeout(() => {
        if(success) {
            setStatus('success');
        } else {
            setStatus('error');
        }
    }, 500);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 pt-8 pb-20">
      <Section>
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
          <div className="mb-10">
            {/* Optimized standard image tag for now, can upgrade to next/image later */}
            <img 
              src={post.coverImage} 
              alt={post.title} 
              className="w-full h-auto object-cover max-h-[500px] rounded-none shadow-sm"
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
             <div className="flex flex-col gap-4">
                {status === 'success' ? (
                     <div>
                        <div className="flex items-center gap-2 text-primary font-medium w-full py-2">
                            <Check size={20} /> Thanks for subscribing!
                        </div>
                        <Link href={`/unsubscribe?email=${encodeURIComponent(email)}`} className="text-xs text-slate-400 hover:text-primary underline ml-7">
                             Mistake? Unsubscribe here.
                        </Link>
                     </div>
                ): status === 'loading' ? (
                    <div className="flex items-center gap-2 text-slate-500 py-2">
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        Checking subscription...
                    </div>
                ) : status === 'error' ? (
                     <div>
                         <div className="flex items-center gap-2 text-yellow-600 font-medium w-full py-2">
                            <AlertCircle size={20} /> You are already subscribed.
                         </div>
                         <div className="flex gap-4 ml-7 text-xs">
                             <button onClick={() => setStatus('idle')} className="text-primary hover:underline">Try another email</button>
                             <Link href={`/unsubscribe?email=${encodeURIComponent(email)}`} className="text-slate-400 hover:text-primary underline">
                                Unsubscribe
                             </Link>
                         </div>
                     </div>
                ) : (
                    <div className="flex gap-2">
                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="px-4 py-2 border border-slate-200 focus:outline-none focus:border-primary w-full md:w-64 bg-white" 
                            />
                        <button onClick={handleSubscribe} className="bg-primary text-white px-6 py-2 font-medium hover:bg-slate-800 transition-colors">Join</button>
                    </div>
                )}
             </div>
        </div>
      </Section>
    </div>
  );
};

export default NewsletterPost;