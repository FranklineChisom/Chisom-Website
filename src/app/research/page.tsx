'use client';

import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Publication } from '@/types';
import Pagination from '@/components/Pagination';

interface ResearchListProps {
  publications: Publication[];
}

const ITEMS_PER_PAGE = 8;

export default function ResearchList({ publications }: ResearchListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination Logic
  const totalPages = Math.ceil(publications.length / ITEMS_PER_PAGE);
  const currentPubs = publications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const listElement = document.getElementById('publication-list');
    if (listElement) {
        listElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="publication-list">
      <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-8">Selected Publications</h2>
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
            </div>
          </div>
        )) : (
          <p className="text-slate-500 italic">No other publications listed.</p>
        )}
      </div>
      
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={handlePageChange} 
      />
    </div>
  );
}