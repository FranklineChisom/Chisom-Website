'use client';

import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import Pagination from '@/components/Pagination';
import SearchBar from '@/components/SearchBar';
import { Publication } from '@/types';

interface ResearchListProps {
  initialPublications: Publication[];
}

const ITEMS_PER_PAGE = 8;

const ResearchList: React.FC<ResearchListProps> = ({ initialPublications }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const featuredPubs = initialPublications.filter(p => p.featured);
  const otherPubs = initialPublications.filter(p => !p.featured);

  // Pagination Logic for other publications
  const totalPages = Math.ceil(otherPubs.length / ITEMS_PER_PAGE);
  const currentOtherPubs = otherPubs.slice(
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
    <div className="max-w-4xl mx-auto px-6 space-y-24">
      
      {/* Intro - SEO Optimized */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="font-serif text-4xl md:text-5xl text-primary mb-8">Research & Publications</h1>
        <p className="text-xl text-slate-600 font-light leading-relaxed max-w-3xl mb-8">
          My research philosophy centers on adaptive jurisprudence, examining how legal frameworks must evolve to meet the fluid demands of digital innovation, economic integration, and social justice without compromising the stability of the rule of law.
        </p>

        {/* Search Bar */}
        <SearchBar 
          publications={initialPublications} 
          scope="publication"
          placeholder="Search publications..."
        />
      </div>

      {/* Featured Works - SEO Optimized */}
      <div 
        className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-backwards"
        style={{ animationDelay: '100ms' }}
      >
        <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-8">Featured Works</h2>
        <div className="grid gap-8">
          {featuredPubs.length > 0 ? featuredPubs.map((pub) => (
            <div key={pub.id} className="bg-slate-50 p-8 rounded-none border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <span className="text-accent font-serif italic">{pub.venue}, {pub.year}</span>
                <span className="text-xs font-bold text-slate-400 border border-slate-200 px-2 py-1 rounded-none">{pub.type}</span>
              </div>
              <h3 className="font-serif text-2xl text-primary mb-4">{pub.title}</h3>
              <p className="text-slate-600 mb-6 leading-relaxed text-sm md:text-base">
                {pub.abstract}
              </p>
              <div className="flex items-center gap-4">
                {pub.link && (
                    <a href={pub.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
                    Read Publication <ExternalLink size={14} className="ml-1" />
                    </a>
                )}
                {pub.coAuthors && pub.coAuthors.length > 0 && (
                    <span className="text-sm text-slate-400">
                        Co-authored with {pub.coAuthors.join(", ")}
                    </span>
                )}
              </div>
            </div>
          )) : (
            <p className="text-slate-500 italic">No featured publications yet.</p>
          )}
        </div>
      </div>

      {/* List of Publications - SEO Optimized */}
      <div 
        id="publication-list"
        className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-backwards"
        style={{ animationDelay: '200ms' }}
      >
        <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-8">Selected Publications</h2>
        <div className="space-y-8">
          {currentOtherPubs.length > 0 ? currentOtherPubs.map((pub) => (
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

      {/* Interests - SEO Optimized */}
      <div 
        className="bg-primary text-white p-10 rounded-none animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-backwards"
        style={{ animationDelay: '300ms' }}
      >
        <h3 className="font-serif text-2xl mb-4">Research Interests</h3>
        <p className="text-slate-300 font-light leading-relaxed mb-4">
          I am actively exploring research collaborations and academic dialogue in the areas of:
        </p>
        <ul className="space-y-3">
            <li className="flex items-start">
                <span className="inline-block w-1.5 h-1.5 bg-accent mt-2.5 mr-3 flex-shrink-0"></span>
                <span className="text-white">International Financial Law: Investigating capital market harmonisation and economic integration under the AfCFTA.</span>
            </li>
            <li className="flex items-start">
                <span className="inline-block w-1.5 h-1.5 bg-accent mt-2.5 mr-3 flex-shrink-0"></span>
                <span className="text-white">Law & Technology: Analysing regulatory frameworks for the digital economy, including AI, NFTs, and data privacy.</span>
            </li>
            <li className="flex items-start">
                <span className="inline-block w-1.5 h-1.5 bg-accent mt-2.5 mr-3 flex-shrink-0"></span>
                <span className="text-white">Dispute Resolution: Examining the evolution of international arbitration standards and comparative procedural mechanisms.</span>
            </li>
        </ul>
      </div>
    </div>
  );
};

export default ResearchList;