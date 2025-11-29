'use client';

import React, { useState } from 'react';
import { MailOpen, Mail, Trash2, CornerUpLeft, Clock, User, Send, Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ContactMessage } from '@/types';
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
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
            <span className="text-xs text-slate-500">Showing page {page} of {totalPages}</span>
            <div className="flex gap-2">
                <button 
                    onClick={() => setPage(page - 1)} 
                    disabled={page === 1}
                    className={`p-1.5 rounded-md border transition-all ${
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
                    className={`p-1.5 rounded-md border transition-all ${
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

export default function InboxManager() {
  usePageTitle('Inbox - Admin');
  const { messages, markMessageRead, markMessageUnread, deleteMessage } = useData();
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Modal State
  const [viewModal, setViewModal] = useState<{ isOpen: boolean, msg: ContactMessage | null }>({ isOpen: false, msg: null });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, id: string | null }>({ isOpen: false, id: null });
  const [isReplyMode, setIsReplyMode] = useState(false);
  
  // Reply Form State
  const [replyTo, setReplyTo] = useState('');
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  const paginatedMessages = messages.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleOpenMessage = (msg: ContactMessage) => {
    setViewModal({ isOpen: true, msg });
    setIsReplyMode(false);
    if (!msg.read) {
      markMessageRead(msg.id);
    }
  };

  const handleCloseViewModal = () => {
    setViewModal({ isOpen: false, msg: null });
    setIsReplyMode(false);
  };

  const handleToggleReadStatus = async (msg: ContactMessage, e: React.MouseEvent) => {
    e.stopPropagation();
    if (msg.read) {
        await markMessageUnread(msg.id);
        showToast('Marked as unread', 'info');
    } else {
        await markMessageRead(msg.id);
        showToast('Marked as read', 'success');
    }
  };

  const initReply = () => {
    if (!viewModal.msg) return;
    setReplyTo(viewModal.msg.email);
    setReplySubject(`Re: ${viewModal.msg.subject}`);
    setReplyBody(`\n\n\nBest regards,\nFrankline Chisom Ebere`);
    setIsReplyMode(true);
  };

  const confirmDelete = (id: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      setDeleteModal({ isOpen: true, id });
  }

  const handleDelete = async () => {
      if (deleteModal.id) {
        const success = await deleteMessage(deleteModal.id);
        setDeleteModal({ isOpen: false, id: null });
        if (success) {
            showToast('Message deleted', 'success');
            if (viewModal.msg?.id === deleteModal.id) handleCloseViewModal();
        } else {
            showToast('Failed to delete message', 'error');
        }
      }
  };

  const handleSendReply = async () => {
    if (!viewModal.msg) return;
    if (!replyBody.trim() || !replyTo.trim() || !replySubject.trim()) {
      showToast('All fields are required', 'error');
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/send-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: replyTo,
          subject: replySubject,
          message: replyBody,
          originalMessage: {
            date: viewModal.msg.date,
            name: viewModal.msg.name,
            message: viewModal.msg.message,
            email: viewModal.msg.email
          }
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showToast('Reply sent successfully!', 'success');
        handleCloseViewModal();
      } else {
        throw new Error(result.error || 'Failed to send');
      }
    } catch (error) {
      console.error('Reply Error:', error);
      showToast('Failed to send reply.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-serif text-slate-800 mb-8">Inbox</h2>

      {/* Messages Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden animate-in fade-in duration-500">
        <div className="overflow-x-auto">
          <table className="w-full text-left table-fixed border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-5 w-14 text-center"><MailOpen size={16} /></th>
                <th className="p-5 w-1/4">Sender</th>
                <th className="p-5 w-1/3">Subject</th>
                <th className="p-5 w-32">Date</th>
                <th className="p-5 w-32 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedMessages.map(msg => (
                  <tr 
                    key={msg.id} 
                    onClick={() => handleOpenMessage(msg)}
                    className={`group cursor-pointer transition-all hover:bg-slate-50/80 ${msg.read ? 'text-slate-600' : 'bg-blue-50/30 text-slate-900 font-medium'}`}
                  >
                    <td className="p-5 text-center">
                      {!msg.read ? <div className="w-2 h-2 rounded-full bg-primary mx-auto shadow-sm" /> : null}
                    </td>
                    <td className="p-5 truncate">
                      <div className="font-medium">{msg.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5 truncate">{msg.email}</div>
                    </td>
                    <td className="p-5 truncate">
                      <span className={msg.read ? 'font-normal' : 'font-semibold'}>{msg.subject}</span>
                      <span className="text-slate-400 font-normal text-xs ml-2 block truncate mt-1 opacity-80">{msg.message.substring(0, 40)}...</span>
                    </td>
                    <td className="p-5 text-slate-500 font-mono text-xs">{msg.date}</td>
                    <td className="p-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                            <button
                                onClick={(e) => handleToggleReadStatus(msg, e)}
                                className={`p-2 rounded-full transition-colors ${msg.read ? 'text-slate-300 hover:text-primary hover:bg-primary/5' : 'text-primary bg-primary/5 hover:bg-primary/10'}`}
                                title={msg.read ? "Mark as unread" : "Mark as read"}
                            >
                                {msg.read ? <Mail size={16} /> : <MailOpen size={16} />}
                            </button>
                            <button 
                                onClick={(e) => confirmDelete(msg.id, e)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                title="Delete"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </td>
                  </tr>
                ))}
                 {messages.length === 0 && (
                    <tr>
                        <td colSpan={5} className="p-12 text-center text-slate-400 italic">
                            No messages found.
                        </td>
                    </tr>
                )}
            </tbody>
          </table>
        </div>
        <AdminPagination total={messages.length} limit={ITEMS_PER_PAGE} page={page} setPage={setPage} />
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        title="Delete Message?"
        type="danger"
        actions={
            <>
                <button onClick={() => setDeleteModal({ isOpen: false, id: null })} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md text-sm font-medium transition-colors">Cancel</button>
                <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors shadow-sm">Delete Permanently</button>
            </>
        }
      >
        <p>Are you sure you want to delete this message? This action cannot be undone.</p>
      </Modal>

      {/* Message View/Reply Modal - Using custom content inside generic Modal wrapper logic or sticking to the custom overlay for complex layout? 
          Let's use a custom full-screen-ish overlay for the message view as it's complex, but styled consistently.
      */}
      {viewModal.isOpen && viewModal.msg && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 transition-opacity duration-300 animate-in fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCloseViewModal}></div>
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10 transform transition-all scale-100">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div className="flex-1 pr-4">
                {isReplyMode ? (
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <CornerUpLeft size={18} className="text-primary"/> Reply to Message
                  </h3>
                ) : (
                  <>
                    <h3 className="text-xl font-serif text-slate-800 mb-1 leading-tight">{viewModal.msg.subject}</h3>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-2 py-1 rounded-md border border-slate-100 shadow-sm">
                            <User size={14} className="text-primary" /> 
                            <span className="font-medium">{viewModal.msg.name}</span> 
                            <span className="text-slate-400 mx-1">|</span>
                            <span className="text-slate-500">{viewModal.msg.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Clock size={12} /> {viewModal.msg.date}
                        </div>
                    </div>
                  </>
                )}
              </div>
              <button 
                onClick={handleCloseViewModal}
                className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
              {isReplyMode ? (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">To</label>
                    <input 
                      type="email" 
                      value={replyTo}
                      onChange={(e) => setReplyTo(e.target.value)}
                      className="w-full border border-slate-200 p-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none rounded-md bg-slate-50/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Subject</label>
                    <input 
                      type="text" 
                      value={replySubject}
                      onChange={(e) => setReplySubject(e.target.value)}
                      className="w-full border border-slate-200 p-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none rounded-md bg-slate-50/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Message</label>
                    <textarea 
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      rows={8}
                      autoFocus
                      className="w-full border border-slate-200 p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none rounded-md bg-slate-50/50 resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm prose-slate max-w-none text-slate-600 leading-loose">
                  <p className="whitespace-pre-wrap">{viewModal.msg.message}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
              {isReplyMode ? (
                <>
                  <button 
                    onClick={() => setIsReplyMode(false)}
                    className="text-slate-500 text-sm hover:text-slate-700 px-4 py-2 font-medium"
                  >
                    Cancel Reply
                  </button>
                  <button 
                    onClick={handleSendReply}
                    disabled={isSending}
                    className="bg-primary text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-slate-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-70"
                  >
                    {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {isSending ? 'Sending...' : 'Send Reply'}
                  </button>
                </>
              ) : (
                <>
                   <div className="flex gap-2">
                    <button 
                        onClick={() => confirmDelete(viewModal.msg?.id || '')}
                        className="text-red-500 hover:text-red-700 text-sm px-3 py-1.5 flex items-center gap-1.5 hover:bg-red-50 rounded-md transition-colors font-medium"
                    >
                        <Trash2 size={14} /> Delete
                    </button>
                  </div>
                  <button 
                    onClick={initReply}
                    className="bg-primary text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-slate-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <CornerUpLeft size={16} /> Reply
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}