'use client';

import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useData } from '@/contexts/DataContext'; // Import the context hook
import Pagination from '@/components/Pagination';
import Section from '@/components/Section'; // Optional wrapper for consistency
import { usePageTitle } from '@/hooks/usePageTitle';

const ITEMS_PER_PAGE = 8;

export default function ResearchPage() {
  usePageTitle('Research');
  const { publications } = useData(); // Fetch data from context
  const [currentPage, setCurrentPage] = useState(1);

  // Safety check: Ensure publications is an array (defaults to [] in context, but good practice)
  const safePublications = publications || [];

  // Pagination Logic
  const totalPages = Math.ceil(safePublications.length / ITEMS_PER_PAGE);
  const currentPubs = safePublications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 pt-8 pb-20">
      <Section>
        <h1 className="font-serif text-4xl md:text-5xl text-primary mb-8">Research</h1>
        <p className="text-xl text-slate-600 font-light leading-relaxed max-w-2xl mb-12">
          Selected publications, book chapters, and policy papers.
        </p>

        <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-8">Publications List</h2>
        
        <div className="space-y-8">
          {currentPubs.length > 0 ? currentPubs.map((pub) => (
            <div key={pub.id} className="group border-l-2 border-transparent hover:border-primary pl-4 transition-all">
              {pub.link ? (
                <a href={pub.link} target="_blank" rel="noopener noreferrer" className="block group-hover:opacity-80 transition-opacity">
                    <h4 className="font-medium text-lg text-slate-800 flex items-center gap-2">
                        {pub.title}
                        <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </h4>
                </a>
              ) : (
                <h4 className="font-medium text-lg text-slate-800">{pub.title}</h4>
              )}
              
              <div className="flex flex-wrap gap-2 text-sm text-slate-500 mt-1">
                <span>{pub.year}</span>
                <span>•</span>
                <span className="italic font-serif">{pub.venue}</span>
                {pub.type && <span className="bg-slate-100 px-2 py-0.5 rounded text-xs ml-2">{pub.type}</span>}
              </div>
            </div>
          )) : (
            <p className="text-slate-500 italic">No publications found.</p>
          )}
        </div>
        
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={handlePageChange} 
        />
      </Section>
    </div>
  );
}