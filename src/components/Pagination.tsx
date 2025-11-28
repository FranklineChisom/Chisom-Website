import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-4 mt-12">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded-sm border transition-colors ${
          currentPage === 1
            ? 'border-slate-100 text-slate-300 cursor-not-allowed'
            : 'border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
        }`}
        aria-label="Previous Page"
      >
        <ChevronLeft size={20} />
      </button>
      
      <span className="text-sm font-medium text-slate-500 font-mono">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-sm border transition-colors ${
          currentPage === totalPages
            ? 'border-slate-100 text-slate-300 cursor-not-allowed'
            : 'border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
        }`}
        aria-label="Next Page"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default Pagination;