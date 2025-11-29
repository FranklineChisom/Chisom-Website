'use client';

import React, { useState, useMemo } from 'react';
import { Copy, Trash2, Check, ChevronLeft, ChevronRight, Users, Loader2 } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/contexts/ToastContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import Modal from '@/components/Modal';

const AdminPagination: React.FC<{ 
    total: number, 
    limit: number, 
    page: number, 
    setPage: (p: number) => void 
}> = ({ total, limit, page, setPage }) => {
    const totalPages = Math.ceil(total / limit);
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/30">
            <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
                <button 
                    onClick={() => setPage(page - 1)} 
                    disabled={page === 1}
                    className={`p-1 rounded-md border transition-all ${
                        page === 1
                            ? 'border-slate-100 text-slate-300 cursor-not-allowed'
                            : 'border-slate-200 text-slate-600 hover:border-primary hover:text-primary bg-white shadow-sm'
                    }`}
                >
                    <ChevronLeft size={16} />
                </button>
                <button 
                    onClick={() => setPage(page + 1)} 
                    disabled={page === totalPages}
                    className={`p-1 rounded-md border transition-all ${
                        page === totalPages
                            ? 'border-slate-100 text-slate-300 cursor-not-allowed'
                            : 'border-slate-200 text-slate-600 hover:border-primary hover:text-primary bg-white shadow-sm'
                    }`}
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default function SubscriberManager() {
  usePageTitle('Subscribers - Admin');
    const { subscribers, removeSubscriber } = useData();
    const { showToast } = useToast();
    const [page, setPage] = useState(1);
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, email: string | null }>({ isOpen: false, email: null });
    const [isRemoving, setIsRemoving] = useState(false);
    const ITEMS_PER_PAGE = 20;

    const sortedSubscribers = useMemo(() => {
        return [...subscribers].sort((a, b) => a.email.localeCompare(b.email));
    }, [subscribers]);

    const emailList = sortedSubscribers.map(s => s.email).join(', ');
    const paginatedSubs = sortedSubscribers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const handleCopy = () => {
      if (!emailList) return;
      navigator.clipboard.writeText(emailList).then(() => {
        setCopyStatus('copied');
        showToast('Email list copied to clipboard', 'info');
        setTimeout(() => setCopyStatus('idle'), 2000);
      });
    };

    const confirmRemove = (email: string) => {
        setDeleteModal({ isOpen: true, email });
    };

    const handleRemove = async () => {
        if (deleteModal.email) {
            setIsRemoving(true);
            try {
                const success = await removeSubscriber(deleteModal.email);
                setDeleteModal({ isOpen: false, email: null });
                if (success) showToast('Subscriber removed', 'success');
                else showToast('Failed to remove subscriber', 'error');
            } finally {
                setIsRemoving(false);
            }
        }
    }

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-serif text-slate-800">Subscribers</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage your newsletter audience</p>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                    <Users size={18} className="text-primary" />
                    <span className="font-bold text-slate-800">{subscribers.length}</span>
                    <span className="text-slate-400 text-sm">Total</span>
                </div>
            </div>

            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => !isRemoving && setDeleteModal({ isOpen: false, email: null })}
                title="Remove Subscriber?"
                type="danger"
                actions={
                    <>
                        <button 
                            onClick={() => setDeleteModal({ isOpen: false, email: null })} 
                            disabled={isRemoving}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleRemove} 
                            disabled={isRemoving}
                            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70"
                        >
                            {isRemoving && <Loader2 size={14} className="animate-spin" />}
                            {isRemoving ? 'Removing...' : 'Remove'}
                        </button>
                    </>
                }
            >
                <p>Are you sure you want to remove <strong>{deleteModal.email}</strong> from your subscriber list?</p>
            </Modal>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Export Panel */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/60 flex flex-col h-[500px]">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-slate-700">Export List</h4>
                    <button 
                      onClick={handleCopy}
                      className="flex items-center gap-2 text-xs font-medium text-primary hover:text-slate-800 transition-colors bg-primary/5 px-3 py-1.5 rounded-md border border-primary/10 hover:bg-primary/10"
                      title="Copy all emails to clipboard"
                    >
                      {copyStatus === 'copied' ? (
                        <>
                          <Check size={14} className="text-green-600" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={14} /> Copy Emails
                        </>
                      )}
                    </button>
                  </div>
                  <div className="relative flex-1">
                      <textarea 
                          readOnly
                          className="w-full h-full border border-slate-200 rounded-md p-4 text-sm font-mono text-slate-600 focus:outline-none bg-slate-50/50 resize-none"
                          value={emailList}
                      />
                      {subscribers.length === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center text-slate-400 italic pointer-events-none">
                              List is empty.
                          </div>
                      )}
                  </div>
              </div>

              {/* Management Panel */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 flex flex-col h-[500px] overflow-hidden">
                 <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100">
                    <h4 className="font-medium text-slate-700">Manage Subscribers</h4>
                 </div>
                 <div className="flex-1 overflow-y-auto">
                    {subscribers.length === 0 ? (
                       <div className="p-12 text-center text-slate-400 italic">No subscribers found.</div>
                    ) : (
                       <ul className="divide-y divide-slate-100">
                          {paginatedSubs.map(sub => (
                             <li key={sub.id} className="flex justify-between items-center px-6 py-3 hover:bg-slate-50 transition-colors text-sm group">
                                <span className="text-slate-700 font-medium">{sub.email}</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-slate-400 font-mono hidden sm:inline">{new Date(sub.date).toLocaleDateString()}</span>
                                    <button 
                                    onClick={() => confirmRemove(sub.email)}
                                    className="text-red-600 p-1.5 hover:bg-red-50 rounded-md transition-all opacity-60 group-hover:opacity-100"
                                    title="Remove Subscriber"
                                    >
                                    <Trash2 size={14} />
                                    </button>
                                </div>
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