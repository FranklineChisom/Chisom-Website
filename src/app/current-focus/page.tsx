'use client'; // 1. Directs Next.js to run this on the client

import React from 'react';
import Link from 'next/link'; // 2. Replaces react-router-dom
import { ArrowLeft, Target } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useData } from '@/contexts/DataContext'; // Updated path alias if needed
import Section from '@/components/Section';

const CurrentFocus: React.FC = () => {
  // Note: SEO is handled by the layout or metadata in a parent server component
  // For client components, we usually skip document.title manipulation or use a wrapper
  
  const { siteConfig } = useData();
  
  return (
    <div className="max-w-3xl mx-auto px-6 pt-8 pb-20">
      <Section>
        {/* 3. 'to' prop becomes 'href' */}
        <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-primary mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to Home
        </Link>
        
        <div className="flex items-center gap-3 text-accent mb-6">
          <Target size={24} />
          <span className="text-sm font-bold tracking-widest uppercase">Research Focus</span>
        </div>

        <h1 className="font-serif text-4xl md:text-5xl text-primary leading-tight mb-8">
          Current Research & <br/>Strategic Focus
        </h1>

        <div className="prose prose-lg prose-slate max-w-none font-light prose-headings:font-serif prose-headings:text-primary prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-li:marker:text-accent">
          <ReactMarkdown>{siteConfig.focusContent || "Content coming soon..."}</ReactMarkdown>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
           <p className="text-slate-500 italic text-sm">
             Interested in collaborating on these topics?
           </p>
           <Link 
             href="/contact" 
             className="px-6 py-3 bg-primary text-white font-medium hover:bg-slate-800 transition-colors"
           >
             Get in Touch
           </Link>
        </div>
      </Section>
    </div>
  );
};

export default CurrentFocus;