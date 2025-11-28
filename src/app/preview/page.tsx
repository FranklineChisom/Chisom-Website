'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Mail, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Section from '../components/Section';
import { usePageTitle } from '../hooks/usePageTitle';
import { supabase } from '../lib/supabase';

// 1. Create the inner component that uses useSearchParams
const PreviewContent: React.FC = () => {
  usePageTitle('Live Preview');
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const type = searchParams.get('type') as 'blog' | 'newsletter';
  const id = searchParams.get('id');

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !type) {
        setErrorMsg('Invalid URL parameters. Missing ID or Type.');
        setLoading(false);
        return;
      }

      try {
        const tableName = type === 'blog' ? 'blog_posts' : 'newsletters';
        const { data: result, error: err } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', id)
          .single();

        if (err) throw err;
        if (!result) throw new Error("No data found.");

        const formattedData = type === 'blog' ? {
            ...result,
            readTime: result.read_time,
            coverImage: result.cover_image
        } : {
            ...result,
            coverImage: result.cover_image
        };

        setData(formattedData);
      } catch (err: any) {
        setErrorMsg(err.message || 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, type]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 size={32} className="animate-spin text-primary mb-4" />
        <p className="text-slate-500 font-serif">Generating preview...</p>
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-8 max-w-md text-center border-t-2 border-red-500 shadow-xl">
            <h3 className="text-xl font-serif text-slate-800 mb-2">Preview Failed</h3>
            <p className="text-red-600 mb-6 bg-red-50 p-3 text-sm font-mono">{errorMsg}</p>
            <button onClick={() => window.close()} className="text-slate-500 hover:text-slate-800 underline decoration-dotted">
                Close Window
            </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Improved Floating Banner */}
      <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-10 fade-in duration-700">
        <div className="bg-slate-900/90 backdrop-blur-md text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/10">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            <div className="flex flex-col">
                <span className="text-sm font-medium">Draft Preview</span>
            </div>
            <div className="h-8 w-px bg-white/20 mx-2"></div>
            <button 
                onClick={() => window.close()}
                className="text-xs hover:text-accent transition-colors font-medium"
            >
                Close
            </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pt-20 pb-32">
        <Section>
          {/* Header Context */}
          <div className="mb-8 pb-8 border-b border-slate-100 flex justify-between items-center">
             <button 
                onClick={() => window.close()} 
                className="group flex items-center text-sm text-slate-400 hover:text-primary transition-colors"
             >
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center mr-3 group-hover:bg-primary group-hover:text-white transition-all">
                    <ArrowLeft size={14} />
                </div>
                Back to Editor
             </button>
             <span className="text-xs font-mono text-slate-300 uppercase tracking-widest">
                {type === 'blog' ? 'Blog Post' : 'Newsletter Issue'}
             </span>
          </div>
          
          <div className="mb-6 flex flex-wrap gap-4 text-sm text-slate-400 font-mono">
              <span className="flex items-center gap-2">
                  <Calendar size={14} /> {data.date || 'No Date'}
              </span>
              
              {type === 'blog' && (
                <>
                  <span className="flex items-center gap-2">
                      <Clock size={14} /> {data.readTime || '5 min read'}
                  </span>
                  <span className="text-accent font-semibold uppercase tracking-wider px-2 py-0.5 border border-slate-100 rounded-none text-xs">
                      {data.category || 'Uncategorized'}
                  </span>
                </>
              )}

              {type === 'newsletter' && (
                <span className="flex items-center gap-2 text-accent">
                    <Mail size={14} /> Newsletter
                </span>
              )}
          </div>

          <h1 className="font-serif text-4xl md:text-6xl text-primary leading-tight mb-10">
            {data.title || 'Untitled Draft'}
          </h1>

          {data.coverImage && (
            <div className="mb-12 group relative">
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500"></div>
              <img 
                src={data.coverImage} 
                alt="Cover" 
                className="w-full h-auto object-cover max-h-[500px] shadow-sm"
              />
            </div>
          )}

          <div className="prose prose-lg prose-slate max-w-none font-light prose-headings:font-serif prose-headings:text-primary prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-img:shadow-lg">
            <ReactMarkdown>{data.content || '*Start writing your content...*'}</ReactMarkdown>
          </div>
        </Section>
      </div>
    </>
  );
};

// 2. Export the parent component with Suspense
const PreviewPage: React.FC = () => {
  return (
    <div className="relative bg-white min-h-screen">
      <Suspense fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
          <Loader2 size={32} className="animate-spin text-primary mb-4" />
          <p className="text-slate-500 font-serif">Loading preview...</p>
        </div>
      }>
        <PreviewContent />
      </Suspense>
    </div>
  );
};

export default PreviewPage;