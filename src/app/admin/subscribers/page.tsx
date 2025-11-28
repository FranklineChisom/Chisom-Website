'use client';

import React, { useState } from 'react';
import { Copy, Trash2, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/contexts/ToastContext';
import { usePageTitle } from '@/hooks/usePageTitle';

const AdminPagination: React.FC<{ 
    total: number, 
    limit: number, 
    page: number, 
    setPage: (p: number) => void 
}> = ({ total, limit, page, setPage }) => {
    const totalPages = Math.ceil(total / limit);
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-end space-x-2 p-4 border-t border-slate-100 bg-slate-50">
            <button 
                onClick={() => setPage(page - 1)} 
                disabled={page === 1}
                className={`p-1 rounded-none ${page === 1 ? 'text-slate-300' : 'text-slate-600 hover:bg-slate-200'}`}
            >
                <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-slate-500 font-medium">Page {page} of {totalPages}</span>
            <button 
                onClick={() => setPage(page + 1)} 
                disabled={page === totalPages}
                className={`p-1 rounded-none ${page === totalPages ? 'text-slate-300' : 'text-slate-600 hover:bg-slate-200'}`}
            >
                <ChevronRight size={16} />
            </button>
        </div>
    );
};

export default function SubscriberManager() {
  usePageTitle('Subscribers - Admin');
    const { subscribers, removeSubscriber } = useData();
    const { showToast } = useToast();
    const [page, setPage] = useState(1);
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
    const ITEMS_PER_PAGE = 20;

    const emailList = subscribers.map(s => s.email).join(', ');
    const paginatedSubs = subscribers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const handleCopy = () => {
      if (!emailList) return;
      navigator.clipboard.writeText(emailList).then(() => {
        setCopyStatus('copied');
        showToast('Email list copied to clipboard', 'info');
        setTimeout(() => setCopyStatus('idle'), 2000);
      });
    };

    const handleRemove = async (email: string) => {
        if(window.confirm(`Remove ${email} from subscribers?`)) {
            const success = await removeSubscriber(email);
            if (success) showToast('Subscriber removed', 'success');
            else showToast('Failed to remove subscriber', 'error');
        }
    }

    return (
        <div>
            <h2 className="text-3xl font-serif text-slate-800 mb-8">Subscribers</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Export Panel */}
              <div className="bg-white p-8 rounded-none shadow-sm border border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-slate-600">
                        Total Subscribers: <span className="font-bold text-primary">{subscribers.length}</span>
                    </p>
                    <button 
                      onClick={handleCopy}
                      className="flex items-center gap-2 text-xs font-medium text-primary hover:text-slate-800 transition-colors bg-primary/5 px-3 py-1.5 rounded-md border border-primary/10"
                      title="Copy all emails to clipboard"
                    >
                      {copyStatus === 'copied' ? (
                        <>
                          <Check size={14} className="text-green-600" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={14} /> Copy List
                        </>
                      )}
                    </button>
                  </div>
                  <div className="relative">
                      <textarea 
                          readOnly
                          className="w-full h-40 border border-slate-200 rounded-lg p-4 text-sm font-mono text-slate-600 focus:outline-none bg-slate-50"
                          value={emailList}
                      />
                      {subscribers.length === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center text-slate-400 italic pointer-events-none">
                              No subscribers yet.
                          </div>
                      )}
                  </div>
              </div>

              {/* Management Panel */}
              <div className="bg-white p-8 rounded-none shadow-sm border border-slate-100 flex flex-col h-[500px]">
                 <h4 className="font-serif text-lg text-primary mb-4">Manage List</h4>
                 <div className="flex-1 overflow-y-auto border border-slate-100 rounded-none mb-2">
                    {subscribers.length === 0 ? (
                       <div className="p-8 text-center text-slate-400 italic">No subscribers found.</div>
                    ) : (
                       <ul className="divide-y divide-slate-100">
                          {paginatedSubs.map(sub => (
                             <li key={sub.id} className="flex justify-between items-center p-3 hover:bg-slate-50 text-sm">
                                <span className="text-slate-700">{sub.email}</span>
                                <button 
                                  onClick={() => handleRemove(sub.email)}
                                  className="text-red-400 hover:text-red-600 p-1"
                                  title="Remove Subscriber"
                                >
                                   <Trash2 size={14} />
                                </button>
                             </li>
                          ))}
                       </ul>
                    )}
                 </div>
                 <AdminPagination total={subscribers.length} limit={ITEMS_PER_PAGE} page={page} setPage={setPage} />
              </div>
            </div>
        </div>
    );
}