'use client';

import React, { useState } from 'react';
import { MailOpen, Trash2, CornerUpLeft, X, Clock, User, Mail, Send, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { ContactMessage } from '@/types';
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

export default function InboxManager() {
  usePageTitle('Inbox - Admin');
  const { messages, markMessageRead, markMessageUnread, deleteMessage } = useData();
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Modal State
  const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null);
  const [isReplyMode, setIsReplyMode] = useState(false);
  
  // Reply Form State
  const [replyTo, setReplyTo] = useState('');
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  const paginatedMessages = messages.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Open modal and optionally mark as read
  const handleOpenMessage = (msg: ContactMessage) => {
    setSelectedMsg(msg);
    setIsReplyMode(false);
    if (!msg.read) {
      markMessageRead(msg.id);
    }
  };

  const handleCloseModal = () => {
    setSelectedMsg(null);
    setIsReplyMode(false);
  };

  // Helper to mark unread from modal
  const handleMarkUnread = async (id: string) => {
    const success = await markMessageUnread(id);
    if (success) {
        showToast('Marked as unread', 'info');
        handleCloseModal();
    }
  };

  // Setup reply form
  const initReply = () => {
    if (!selectedMsg) return;
    setReplyTo(selectedMsg.email);
    setReplySubject(`Re: ${selectedMsg.subject}`);
    setReplyBody(`\n\n\nBest regards,\nFrankline Chisom Ebere`);
    setIsReplyMode(true);
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (window.confirm('Delete this message permanently?')) {
      const success = await deleteMessage(id);
      if (success) {
        showToast('Message deleted', 'success');
        if (selectedMsg?.id === id) handleCloseModal();
      }
    }
  };

  const handleSendReply = async () => {
    if (!selectedMsg) return;
    if (!replyBody.trim() || !replyTo.trim() || !replySubject.trim()) {
      showToast('All fields are required', 'error');
      return;
    }

    setIsSending(true);
    try {
      // In Next.js App Router, the API route is at /api/send-reply
      const response = await fetch('/api/send-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: replyTo,
          subject: replySubject,
          message: replyBody,
          originalMessage: {
            date: selectedMsg.date,
            name: selectedMsg.name,
            message: selectedMsg.message,
            email: selectedMsg.email
          }
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showToast('Reply sent successfully!', 'success');
        handleCloseModal();
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
      <div className="bg-white rounded-none shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left table-fixed">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-4 w-12 text-center"><MailOpen size={16} /></th>
                <th className="p-4 w-1/4">Sender</th>
                <th className="p-4 w-1/3">Subject</th>
                <th className="p-4 w-32">Date</th>
                <th className="p-4 w-20 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400 italic">No messages found.</td>
                </tr>
              ) : (
                paginatedMessages.map(msg => (
                  <tr 
                    key={msg.id} 
                    onClick={() => handleOpenMessage(msg)}
                    className={`group cursor-pointer transition-colors ${msg.read ? 'hover:bg-slate-50 text-slate-600' : 'bg-blue-50/20 hover:bg-blue-50 text-slate-900 font-bold'}`}
                  >
                    <td className="p-4 text-center">
                      {!msg.read ? <div className="w-2 h-2 rounded-full bg-primary mx-auto" /> : null}
                    </td>
                    <td className="p-4 truncate">
                      {msg.name} <span className="text-slate-400 font-normal text-xs ml-1">&lt;{msg.email}&gt;</span>
                    </td>
                    <td className="p-4 truncate">
                      {msg.subject} 
                      <span className="text-slate-400 font-normal text-xs ml-2">- {msg.message.substring(0, 30)}...</span>
                    </td>
                    <td className="p-4 text-slate-500 font-mono text-xs">{msg.date}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={(e) => handleDelete(msg.id, e)}
                        className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <AdminPagination total={messages.length} limit={ITEMS_PER_PAGE} page={page} setPage={setPage} />
      </div>

      {/* Message Modal */}
      {selectedMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div className="flex-1 pr-4">
                {isReplyMode ? (
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <CornerUpLeft size={18} className="text-primary"/> Reply to Message
                  </h3>
                ) : (
                  <>
                    <h3 className="text-xl font-serif text-slate-800 mb-1">{selectedMsg.subject}</h3>
                    <div className="text-sm text-slate-500 flex items-center gap-2">
                      <User size={14} /> 
                      <span className="font-medium text-slate-700">{selectedMsg.name}</span> 
                      <span className="text-slate-400">&lt;{selectedMsg.email}&gt;</span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                      <Clock size={12} /> {selectedMsg.date}
                    </div>
                  </>
                )}
              </div>
              <button 
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isReplyMode ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">To</label>
                    <input 
                      type="email" 
                      value={replyTo}
                      onChange={(e) => setReplyTo(e.target.value)}
                      className="w-full border border-slate-200 p-2 text-sm focus:border-primary focus:outline-none rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject</label>
                    <input 
                      type="text" 
                      value={replySubject}
                      onChange={(e) => setReplySubject(e.target.value)}
                      className="w-full border border-slate-200 p-2 text-sm focus:border-primary focus:outline-none rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Message</label>
                    <textarea 
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      rows={8}
                      autoFocus
                      className="w-full border border-slate-200 p-3 text-sm focus:border-primary focus:outline-none rounded-sm resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm prose-slate max-w-none text-slate-600">
                  <p className="whitespace-pre-wrap leading-relaxed">{selectedMsg.message}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
              {isReplyMode ? (
                <>
                  <button 
                    onClick={() => setIsReplyMode(false)}
                    className="text-slate-500 text-sm hover:text-slate-700 px-4 py-2"
                  >
                    Back to Message
                  </button>
                  <button 
                    onClick={handleSendReply}
                    disabled={isSending}
                    className="bg-primary text-white px-6 py-2 rounded-sm text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-70"
                  >
                    {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {isSending ? 'Sending...' : 'Send Reply'}
                  </button>
                </>
              ) : (
                <>
                  <div className="flex gap-2">
                    <button 
                        onClick={() => handleDelete(selectedMsg.id)}
                        className="text-red-400 hover:text-red-600 text-sm px-2 py-1 flex items-center gap-1 hover:bg-red-50 rounded transition-colors"
                    >
                        <Trash2 size={14} /> Delete
                    </button>
                    <button 
                        onClick={() => handleMarkUnread(selectedMsg.id)}
                        className="text-slate-400 hover:text-slate-600 text-sm px-2 py-1 flex items-center gap-1 hover:bg-slate-100 rounded transition-colors"
                    >
                        <Mail size={14} /> Mark Unread
                    </button>
                  </div>
                  <button 
                    onClick={initReply}
                    className="bg-primary text-white px-6 py-2 rounded-sm text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
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