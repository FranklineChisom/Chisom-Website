import React, { useState } from 'react';
import Section from '../components/Section';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import { ArrowRight, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { useSEO } from '../hooks/usePageTitle';

const ITEMS_PER_PAGE = 6;

const Newsletters: React.FC = () => {
  useSEO({
    title: 'Newsletter Archive',
    description: 'Browse past issues on law, policy, and the economic future of Africa.',
    url: 'https://franklinechisom.com/newsletters'
  });
  
  const { newsletters } = useData();
  const [currentPage, setCurrentPage] = useState(1);

  // Filter published, Sort by date descending
  const sortedNewsletters = newsletters
    .filter(n => n.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalPages = Math.ceil(sortedNewsletters.length / ITEMS_PER_PAGE);
  const currentItems = sortedNewsletters.slice(
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
        <div className="flex items-center gap-3 text-accent mb-4">
          <Mail size={24} />
          <span className="text-sm font-bold tracking-widest uppercase">Archive</span>
        </div>
        <h1 className="font-serif text-4xl md:text-5xl text-primary mb-8">Newsletter Archive</h1>
        <p className="text-xl text-slate-600 font-light leading-relaxed max-w-2xl mb-8">
          Browse past issues of my newsletter on law, policy, and African economics.
        </p>

        {/* Search Bar - Scoped to Newsletters */}
        <SearchBar 
          newsletters={sortedNewsletters} 
          scope="newsletter"
          placeholder="Search newsletters..."
        />
      </Section>

      <Section delay={100}>
        <div className="grid gap-12">
          {currentItems.length > 0 ? currentItems.map((item) => (
            <article key={item.id} className="group border-b border-slate-100 pb-12 last:border-0">
              <span className="text-sm text-slate-400 font-mono block mb-2">{item.date}</span>
              <Link to={`/newsletter/${item.slug || item.id}`}>
                <h2 className="font-serif text-2xl text-primary font-medium mb-3 group-hover:text-accent transition-colors">
                  {item.title}
                </h2>
              </Link>
              <p className="text-slate-600 leading-relaxed mb-4 max-w-3xl">
                {item.description}
              </p>
              <Link to={`/newsletter/${item.slug || item.id}`} className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-accent uppercase tracking-wider transition-colors">
                Read Issue <ArrowRight size={14} className="ml-1 transition-transform group-hover:translate-x-1" />
              </Link>
            </article>
          )) : (
            <p className="text-slate-500 italic">No newsletters archived yet.</p>
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
};

export default Newsletters;