'use client';

import React, { useState } from 'react';
import { 
  Mail, Inbox, Send, FileText, Trash2, Edit3, Search, 
  ChevronLeft, ChevronRight, RefreshCw, MoreHorizontal, 
  CornerUpLeft, Check, X, Loader2, User, Paperclip, 
  RotateCcw, AlertOctagon, CheckCircle2, MailOpen
} from 'lucide-react';
import { ContactMessage, Draft, SentEmail } from '@/types';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/contexts/ToastContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import MediaLibrary from '@/components/MediaLibrary';
import { formatDistanceToNow, format, isValid, parseISO } from 'date-fns';

// --- Types ---
type Folder = 'inbox' | 'sent' | 'drafts' | 'trash';

interface ListItem {
    id: string;
    title: string;
    subtitle: string;
    date: string;
    read: boolean;
    replied: boolean;
    status?: 'sent' | 'failed'; // For sent emails
    raw: ContactMessage | Draft | SentEmail;
    type: 'message' | 'sent' | 'draft';
}

interface ComposeState {
    id?: string;
    to: string;
    subject: string;
    body: string;
    attachments: string[];
}

// --- Helper for Date Formatting ---
const formatMessageDate = (dateString?: string) => {
    if (!dateString) return '';
    
    // Handle both ISO strings and potentially older locales
    let date = new Date(dateString);
    if (!isValid(date)) return 'Invalid Date';

    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    // If less than 24 hours, show relative time (e.g., "5 mins ago")
    if (diffInHours < 24) {
        return formatDistanceToNow(date, { addSuffix: true });
    }
    
    // Otherwise show date (e.g., "Oct 24, 2025")
    return format(date, 'MMM d, yyyy');
};

// --- Main Component ---
export default function InboxManager() {
  usePageTitle('Mail - Admin');
  const { 
    messages, sentEmails, drafts, 
    markMessageRead, markMessageUnread, markMessageReplied, 
    saveDraft, deleteDraft, refreshSentEmails,
    moveToTrash, restoreFromTrash, deletePermanently
  } = useData();
  const { showToast } = useToast();

  // State
  const [activeFolder, setActiveFolder] = useState<Folder>('inbox');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  // Compose State
  const [composeData, setComposeData] = useState<ComposeState>({
    to: '', subject: '', body: '', attachments: []
  });
  const [isSending, setIsSending] = useState(false);

  // --- Handlers ---

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshSentEmails();
    // Assuming other data live-updates via Context/Supabase
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleCompose = (defaults?: Partial<ComposeState>) => {
    setComposeData({ to: '', subject: '', body: '', attachments: [], ...defaults });
    setIsComposing(true);
    setSelectedId(null);
  };

  const handleSelectItem = (item: ListItem) => {
    setSelectedId(item.id);
    setIsComposing(false);
    
    // Mark as read if it's an inbox message
    if (item.type === 'message' && !item.read && activeFolder !== 'trash') {
        markMessageRead(item.id);
    }
    
    // If selecting a draft in Drafts folder, open compose
    if (activeFolder === 'drafts' && item.type === 'draft') {
        const draft = item.raw as Draft;
        handleCompose({ id: draft.id, to: draft.recipient, subject: draft.subject, body: draft.message });
    }
  };

  const handleSend = async () => {
    if (!composeData.to || !composeData.subject || !composeData.body) {
        showToast('Please fill all fields', 'error');
        return;
    }
    setIsSending(true);
    
    try {
        const res = await fetch('/api/resend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: composeData.to,
                subject: composeData.subject,
                html: composeData.body.replace(/\n/g, '<br/>'),
                text: composeData.body,
                attachments: composeData.attachments
            })
        });
        const data = await res.json();
        
        if (data.success) {
            showToast('Email sent successfully', 'success');
            setIsComposing(false);
            if (composeData.id) await deletePermanently(composeData.id, 'draft'); // Cleanup draft
            await refreshSentEmails(); 
        } else {
            throw new Error(data.error?.message || data.error || 'Failed to send');
        }
    } catch (e: any) {
        showToast(e.message || 'Failed to send email', 'error');
    } finally {
        setIsSending(false);
    }
  };

  const handleSaveDraft = async () => {
      const id = composeData.id || `draft_${Date.now()}`;
      const draft: Draft = {
          id,
          recipient: composeData.to,
          subject: composeData.subject,
          message: composeData.body,
          updated_at: new Date().toISOString()
      };
      
      setComposeData(prev => ({ ...prev, id }));
      const success = await saveDraft(draft);
      if (success) showToast('Draft saved', 'success');
      else showToast('Failed to save draft', 'error');
  };

  const handleDelete = async () => {
      if (!selectedItem) return;
      
      if (activeFolder === 'trash') {
          if (window.confirm('Delete permanently? This cannot be undone.')) {
              const success = await deletePermanently(selectedItem.id, selectedItem.type);
              if (success) {
                  showToast('Deleted permanently', 'success');
                  setSelectedId(null);
              }
          }
      } else {
          const success = await moveToTrash(selectedItem.id, selectedItem.type);
          if (success) {
              showToast('Moved to Trash', 'success');
              setSelectedId(null);
          }
      }
  };

  const handleRestore = async () => {
      if (!selectedItem || activeFolder !== 'trash') return;
      const success = await restoreFromTrash(selectedItem.id, selectedItem.type);
      if (success) {
          showToast('Restored', 'success');
          setSelectedId(null);
      }
  };

  const handleMarkUnread = async () => {
      if (!selectedItem || selectedItem.type !== 'message') return;
      await markMessageUnread(selectedItem.id);
      showToast('Marked as unread', 'success');
      setSelectedId(null); // Deselect to show list view change
  };

  const handleAttach = (url: string) => {
      setComposeData(prev => ({
          ...prev,
          attachments: [...prev.attachments, url]
      }));
      setShowMediaLibrary(false);
  };

  const removeAttachment = (index: number) => {
      setComposeData(prev => ({
          ...prev,
          attachments: prev.attachments.filter((_, i) => i !== index)
      }));
  };

  // --- Filtering & Sorting ---
  
  const getListItems = (): ListItem[] => {
      const lowerQ = searchQuery.toLowerCase();
      
      // FIX: Robust search that handles null/undefined fields
      const filterText = (t: string | null | undefined) => (t || '').toLowerCase().includes(lowerQ);

      // Helper to map data to list items
      const mapMessage = (m: ContactMessage): ListItem => ({
          id: m.id, title: m.name || 'Unknown', subtitle: m.subject || '(No Subject)', 
          date: formatMessageDate(m.date || m['created_at']), // Prioritize date field, fallback to created_at
          read: m.read, replied: !!m.replied, raw: m, type: 'message'
      });
      const mapSent = (e: SentEmail): ListItem => ({
          id: e.id, title: `To: ${e.recipient}`, subtitle: e.subject || '(No Subject)', 
          date: formatMessageDate(e.created_at),
          read: true, replied: false, status: e.status, raw: e, type: 'sent'
      });
      const mapDraft = (d: Draft): ListItem => ({
          id: d.id, title: d.recipient || '(No Recipient)', subtitle: d.subject || '(No Subject)',
          date: formatMessageDate(d.updated_at), 
          read: true, replied: false, raw: d, type: 'draft'
      });

      let items: ListItem[] = [];

      switch (activeFolder) {
          case 'inbox':
              items = messages.filter(m => !m.deleted_at && (filterText(m.name) || filterText(m.subject))).map(mapMessage);
              break;
          case 'sent':
              items = sentEmails.filter(e => !e.deleted_at && (filterText(e.recipient) || filterText(e.subject))).map(mapSent);
              break;
          case 'drafts':
              items = drafts.filter(d => !d.deleted_at && (filterText(d.recipient) || filterText(d.subject))).map(mapDraft);
              break;
          case 'trash':
              const trashedMessages = messages.filter(m => m.deleted_at).map(mapMessage);
              const trashedSent = sentEmails.filter(e => e.deleted_at).map(mapSent);
              const trashedDrafts = drafts.filter(d => d.deleted_at).map(mapDraft);
              items = [...trashedMessages, ...trashedSent, ...trashedDrafts]
                  .filter(i => filterText(i.title) || filterText(i.subtitle));
              break;
      }
      
      // Sort by the raw date object to ensure correctness even if formatted string differs
      return items.sort((a, b) => {
          const dateA = new Date(a.raw['created_at'] || a.raw['date'] || a.raw['updated_at'] || 0).getTime();
          const dateB = new Date(b.raw['created_at'] || b.raw['date'] || b.raw['updated_at'] || 0).getTime();
          return dateB - dateA;
      });
  };

  const listItems = getListItems();
  const selectedItem = listItems.find(i => i.id === selectedId);

  return (
    <div className="flex h-[calc(100vh-100px)] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500 relative">
      
      {/* Media Library Modal */}
      {showMediaLibrary && (
        <MediaLibrary 
            onSelect={handleAttach} 
            onClose={() => setShowMediaLibrary(false)} 
        />
      )}

      {/* Sidebar - Folders */}
      <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-4">
            <button 
                onClick={() => handleCompose()}
                className="w-full bg-primary text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-slate-800 transition-colors shadow-sm"
            >
                <Edit3 size={18} /> Compose
            </button>
        </div>
        <nav className="flex-1 px-3 space-y-1">
            <button 
                onClick={() => { setActiveFolder('inbox'); setSelectedId(null); setIsComposing(false); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${activeFolder === 'inbox' ? 'bg-white text-primary shadow-sm ring-1 ring-slate-100' : 'text-slate-600 hover:bg-slate-200/50'}`}
            >
                <div className="flex items-center gap-3"><Inbox size={18} /> Inbox</div>
                {messages.filter(m => !m.read && !m.deleted_at).length > 0 && (
                    <span className="bg-primary text-white text-[10px] font-bold py-0.5 px-2 rounded-full">{messages.filter(m => !m.read && !m.deleted_at).length}</span>
                )}
            </button>
            <button 
                onClick={() => { setActiveFolder('sent'); setSelectedId(null); setIsComposing(false); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${activeFolder === 'sent' ? 'bg-white text-primary shadow-sm ring-1 ring-slate-100' : 'text-slate-600 hover:bg-slate-200/50'}`}
            >
                <div className="flex items-center gap-3"><Send size={18} /> Sent</div>
            </button>
            <button 
                onClick={() => { setActiveFolder('drafts'); setSelectedId(null); setIsComposing(false); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${activeFolder === 'drafts' ? 'bg-white text-primary shadow-sm ring-1 ring-slate-100' : 'text-slate-600 hover:bg-slate-200/50'}`}
            >
                <div className="flex items-center gap-3"><FileText size={18} /> Drafts</div>
                {drafts.filter(d => !d.deleted_at).length > 0 && <span className="text-slate-400 font-normal text-xs">{drafts.filter(d => !d.deleted_at).length}</span>}
            </button>
            <div className="pt-4 mt-2 border-t border-slate-200/60">
                <button 
                    onClick={() => { setActiveFolder('trash'); setSelectedId(null); setIsComposing(false); }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${activeFolder === 'trash' ? 'bg-white text-red-600 shadow-sm ring-1 ring-red-100' : 'text-slate-600 hover:bg-red-50 hover:text-red-600'}`}
                >
                    <div className="flex items-center gap-3"><Trash2 size={18} /> Trash</div>
                </button>
            </div>
        </nav>
      </div>

      {/* Message List */}
      <div className="w-80 border-r border-slate-200 flex flex-col bg-white">
        <div className="p-4 border-b border-slate-100 flex gap-2">
            <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-primary transition-all"
                />
            </div>
            <button onClick={handleRefresh} className={`p-2 text-slate-500 hover:text-primary hover:bg-slate-50 rounded-md transition-colors ${isRefreshing ? 'animate-spin' : ''}`}>
                <RefreshCw size={18} />
            </button>
        </div>
        <div className="flex-1 overflow-y-auto">
            {listItems.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm flex flex-col items-center">
                    <Inbox size={32} className="mb-2 opacity-20" />
                    <span>No messages</span>
                </div>
            ) : (
                listItems.map(item => (
                    <div 
                        key={item.id}
                        onClick={() => handleSelectItem(item)}
                        className={`p-4 border-b border-slate-100 cursor-pointer transition-all hover:bg-slate-50 ${selectedId === item.id ? 'bg-blue-50/50 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'} ${!item.read ? 'bg-slate-50' : ''}`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <h4 className={`text-sm truncate pr-2 flex items-center gap-1.5 ${!item.read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                {item.replied && <CornerUpLeft size={12} className="text-green-500 flex-shrink-0" />}
                                {item.status === 'sent' && <CheckCircle2 size={12} className="text-green-500 flex-shrink-0" />}
                                {item.status === 'failed' && <AlertOctagon size={12} className="text-red-500 flex-shrink-0" />}
                                {item.title}
                            </h4>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">{item.date}</span>
                        </div>
                        <p className={`text-xs truncate ${!item.read ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>{item.subtitle}</p>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* Reading Pane / Compose Pane */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {isComposing ? (
            // --- COMPOSE VIEW ---
            <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                    <h3 className="font-serif text-lg text-slate-800">New Message</h3>
                    <div className="flex gap-2">
                        <button onClick={handleSaveDraft} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md text-sm font-medium transition-colors">
                            Save Draft
                        </button>
                        <button onClick={() => setIsComposing(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>
                <div className="p-6 flex-1 flex flex-col gap-4 overflow-y-auto">
                    <div className="flex items-center gap-4">
                        <label className="w-16 text-sm font-medium text-slate-500">To:</label>
                        <input 
                            type="email" 
                            value={composeData.to}
                            onChange={e => setComposeData({...composeData, to: e.target.value})}
                            className="flex-1 border-b border-slate-200 py-2 focus:border-primary focus:outline-none text-sm bg-transparent transition-colors"
                            placeholder="recipient@example.com"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="w-16 text-sm font-medium text-slate-500">Subject:</label>
                        <input 
                            type="text" 
                            value={composeData.subject}
                            onChange={e => setComposeData({...composeData, subject: e.target.value})}
                            className="flex-1 border-b border-slate-200 py-2 focus:border-primary focus:outline-none text-sm font-medium bg-transparent transition-colors"
                            placeholder="Subject line"
                        />
                    </div>
                    <textarea 
                        value={composeData.body}
                        onChange={e => setComposeData({...composeData, body: e.target.value})}
                        className="flex-1 resize-none mt-4 p-4 border border-slate-200 rounded-md focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-sm leading-relaxed transition-shadow"
                        placeholder="Type your message here..."
                    />
                    
                    {/* Attachments List */}
                    {composeData.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {composeData.attachments.map((url, i) => (
                                <div key={i} className="flex items-center gap-2 bg-slate-100 text-xs px-2 py-1 rounded-md text-slate-600">
                                    <span className="truncate max-w-[150px]">{url.split('/').pop()}</span>
                                    <button onClick={() => removeAttachment(i)} className="text-slate-400 hover:text-red-500"><X size={12} /></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                    <div className="flex gap-2 text-slate-400">
                        <button 
                            onClick={() => setShowMediaLibrary(true)}
                            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-primary" 
                            title="Attach File"
                        >
                            <Paperclip size={18} />
                        </button>
                    </div>
                    <button 
                        onClick={handleSend}
                        disabled={isSending}
                        className="bg-primary text-white px-8 py-2.5 rounded-md font-medium hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-70 shadow-sm hover:shadow-md transform active:scale-95"
                    >
                        {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        {isSending ? 'Sending...' : 'Send Message'}
                    </button>
                </div>
            </div>
        ) : selectedItem ? (
            // --- READING VIEW ---
            <div className="flex flex-col h-full animate-in fade-in duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/30">
                    <div>
                        <h2 className="text-2xl font-serif text-slate-900 mb-4 leading-tight">{selectedItem.subtitle}</h2>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center text-slate-500 border border-slate-200 shadow-sm">
                                <User size={20} />
                            </div>
                            <div>
                                <div className="font-bold text-slate-800 text-sm">
                                    {selectedItem.title}
                                    {selectedItem.type === 'message' && <span className="text-slate-400 font-normal ml-1">&lt;{(selectedItem.raw as ContactMessage).email}&gt;</span>}
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                                    {activeFolder === 'sent' ? 'Sent on ' : 'Received on '}{selectedItem.date}
                                    
                                    {/* Status Indicators for Sent Emails */}
                                    {selectedItem.status === 'sent' && <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] font-medium"><CheckCircle2 size={10} /> Sent</span>}
                                    {selectedItem.status === 'failed' && <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] font-medium"><AlertOctagon size={10} /> Failed</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {activeFolder === 'inbox' && (
                            <>
                                <button 
                                    onClick={handleMarkUnread}
                                    className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-md transition-colors"
                                    title="Mark as Unread"
                                >
                                    <MailOpen size={20} />
                                </button>
                                <button 
                                    onClick={() => handleCompose({ to: (selectedItem.raw as ContactMessage).email, subject: `Re: ${selectedItem.subtitle}` })}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-primary hover:text-primary text-slate-700 rounded-md text-sm font-medium transition-all shadow-sm"
                                >
                                    <CornerUpLeft size={16} /> Reply
                                </button>
                            </>
                        )}
                        
                        {activeFolder === 'trash' ? (
                            <button 
                                onClick={handleRestore}
                                className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                title="Restore"
                            >
                                <RotateCcw size={20} />
                            </button>
                        ) : null}

                        <button 
                            onClick={handleDelete}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title={activeFolder === 'trash' ? "Delete Permanently" : "Move to Trash"}
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                </div>
                
                {/* Body */}
                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="prose prose-slate max-w-none text-sm leading-7 text-slate-700">
                        {selectedItem.type === 'message' && (selectedItem.raw as ContactMessage).message.split('\n').map((line, i) => (
                            <p key={i} className="mb-2">{line}</p>
                        ))}
                        
                        {(selectedItem.type === 'sent' || selectedItem.type === 'draft') && (
                            <div className="whitespace-pre-wrap font-sans text-slate-700">
                                {(selectedItem.type === 'draft' ? (selectedItem.raw as Draft).message : (selectedItem.raw as SentEmail).text || 'No text content available.')}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        ) : (
            // --- EMPTY STATE ---
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 bg-slate-50/30">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Mail size={32} className="text-slate-400" />
                </div>
                <p className="text-sm font-medium">Select an item to read</p>
            </div>
        )}
      </div>
    </div>
  );
}