'use client';

import React from 'react';
import Link from 'next/link';
import Section from '@/components/Section';
import { ArrowLeft, Home, FileText, BookOpen } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <Section>
        <div className="mb-8 relative">
          <h1 className="font-serif text-9xl font-bold text-primary/5 select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
          </div>
        </div>

        <p className="text-slate-600 max-w-md mx-auto mb-10 text-lg font-light">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link 
            href="/" 
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-medium hover:bg-slate-800 transition-colors rounded-sm group"
          >
            <Home size={18} className="mr-2" />
            Return Home
          </Link>
        </div>

        <div className="border-t border-slate-100 pt-10 max-w-2xl mx-auto w-full">
          <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-6">Or try one of these</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/blog" className="flex items-center p-4 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 group text-left">
              <div className="bg-white p-2 rounded-sm mr-4 border border-slate-100 group-hover:border-primary/20 transition-colors">
                <FileText size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-slate-800 group-hover:text-primary transition-colors">Read Articles</h3>
                <p className="text-xs text-slate-500 mt-0.5">Latest thoughts on law & policy</p>
              </div>
            </Link>

            <Link href="/research" className="flex items-center p-4 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 group text-left">
              <div className="bg-white p-2 rounded-sm mr-4 border border-slate-100 group-hover:border-primary/20 transition-colors">
                <BookOpen size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-slate-800 group-hover:text-primary transition-colors">Explore Research</h3>
                <p className="text-xs text-slate-500 mt-0.5">Publications and academic work</p>
              </div>
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}