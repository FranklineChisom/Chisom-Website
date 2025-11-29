'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Mail, Inbox, Send, FileText, Trash2, Edit3, Search, 
  ChevronLeft, ChevronRight, RefreshCw, MoreHorizontal, 
  CornerUpLeft, Check, X, Loader2, User, Paperclip, 
  RotateCcw, AlertOctagon, CheckCircle2, MailOpen, File,
  Menu, Square, CheckSquare
} from 'lucide-react';
import { ContactMessage, Draft, SentEmail } from '@/types';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/contexts/ToastContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import MediaLibrary from '@/components/MediaLibrary';
import MarkdownEditor from '@/components/MarkdownEditor'; // Using Rich Text Editor
import { formatDistanceToNow, format, isValid } from 'date-fns';

// --- Types & Interfaces ---
type Folder = 'inbox' | 'sent' | 'drafts' | 'trash';

interface ListItem {
    id: string;
    title: string;
    subtitle: string;
    date: string;
    read: boolean;
    replied: boolean;
    status?: 'sent' | 'failed'; 
    raw: ContactMessage | Draft | SentEmail;
    type: 'message' | 'sent' | 'draft';
    timestamp: number;
}

interface ComposeState {
    id?: string;
    to: string;
    subject: string;
    body: string;
    attachments: string[];
}

// --- Helpers ---
const formatMessageDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (!isValid(date)) return 'Invalid Date';
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    if (diffInHours < 24) return formatDistanceToNow(date, { addSuffix: true });
    return format(date, 'MMM d, yyyy');
};

const getRawDate = (item: any): number => {
    const d = item.created_at || item.date || item.updated_at;
    return new Date(d || 0).getTime();
};

// --- Custom Hook for Keyboard Shortcuts ---
const useKeyboardShortcuts = (handlers: { [key: string]: () => void }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      
      const key = e.key.toLowerCase();
      if (handlers[key]) {
        e.preventDefault();
        handlers[key]();
      }
      if ((e.metaKey || e.ctrlKey) && key === 'a' && handlers['select_all']) {
        e.preventDefault();
        handlers['select_all']();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
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
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [isComposing, setIsComposing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Mobile sidebar toggle

  const [composeData, setComposeData] = useState<ComposeState>({
    to: '', subject: '', body: '', attachments: []
  });
  const [isSending, setIsSending] = useState(false);

  // --- Data Processing (Memoized for Performance) ---
  const listItems: ListItem[] = useMemo(() => {
      const lowerQ = searchQuery.toLowerCase();
      const filterText = (t: string | null | undefined) => (t || '').toLowerCase().includes(lowerQ);

      const mapMessage = (m: ContactMessage): ListItem => ({
          id: m.id, title: m.name || 'Unknown', subtitle: m.subject || '(No Subject)', 
          date: formatMessageDate(m.date || m.created_at),
          read: m.read, replied: !!m.replied, raw: m, type: 'message',
          timestamp: getRawDate(m)
      });
      const mapSent = (e: SentEmail): ListItem => ({
          id: e.id, title: `To: ${e.recipient}`, subtitle: e.subject || '(No Subject)', 
          date: formatMessageDate(e.created_at),
          read: true, replied: false, status: e.status, raw: e, type: 'sent',
          timestamp: getRawDate(e)
      });
      const mapDraft = (d: Draft): ListItem => ({
          id: d.id, title: d.recipient || '(No Recipient)', subtitle: d.subject || '(No Subject)',
          date: formatMessageDate(d.updated_at), 
          read: true, replied: false, raw: d, type: 'draft',
          timestamp: getRawDate(d)
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
              items = [...messages.filter(m => m.deleted_at).map(mapMessage), ...sentEmails.filter(e => e.deleted_at).map(mapSent), ...drafts.filter(d => d.deleted_at).map(mapDraft)].filter(i => filterText(i.title) || filterText(i.subtitle));
              break;
      }
      return items.sort((a, b) => b.timestamp - a.timestamp);
  }, [messages, sentEmails, drafts, activeFolder, searchQuery]);

  const selectedItem = useMemo(() => listItems.find(i => i.id === selectedId), [listItems, selectedId]);

  // --- Handlers ---

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshSentEmails();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleCompose = useCallback((defaults?: Partial<ComposeState>) => {
    setComposeData({ to: '', subject: '', body: '', attachments: [], ...defaults });
    setIsComposing(true);
    setSelectedId(null);
    setMobileMenuOpen(false); // Close mobile menu if open
  }, []);

  const handleSelectItem = useCallback((item: ListItem) => {
    setSelectedId(item.id);
    setIsComposing(false);
    
    // Auto-mark as read for messages in Inbox
    if (item.type === 'message' && !item.read && activeFolder !== 'trash') {
        markMessageRead(item.id);
    }
    
    // Auto-load draft into composer
    if (activeFolder === 'drafts' && item.type === 'draft') {
        const draft = item.raw as Draft;
        handleCompose({ id: draft.id, to: draft.recipient, subject: draft.subject, body: draft.message });
    }
  }, [activeFolder, handleCompose, markMessageRead]);

  // Bulk Selection Handlers
  const toggleCheck = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const next = new Set(checkedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setCheckedIds(next);
  };

  const toggleSelectAll = () => {
      if (checkedIds.size === listItems.length) setCheckedIds(new Set());
      else setCheckedIds(new Set(listItems.map(i => i.id)));
  };

  // Bulk Actions
  const handleBulkDelete = async () => {
      if (checkedIds.size === 0 && !selectedId) return;
      const idsToDelete = checkedIds.size > 0 ? Array.from(checkedIds) : [selectedId!];
      
      if (!window.confirm(`Are you sure you want to delete ${idsToDelete.length} item(s)?`)) return;

      const deleteFunc = activeFolder === 'trash' ? deletePermanently : moveToTrash;
      
      // We need to know the type for each ID. In a real app, optimize this look up.
      // Here we iterate visible listItems.
      for (const id of idsToDelete) {
          const item = listItems.find(i => i.id === id);
          if (item) await deleteFunc(item.id, item.type);
      }
      
      setCheckedIds(new Set());
      setSelectedId(null);
      showToast(activeFolder === 'trash' ? 'Deleted permanently' : 'Moved to trash', 'success');
  };

  const handleBulkMarkRead = async (status: boolean) => {
      const idsToMark = checkedIds.size > 0 ? Array.from(checkedIds) : (selectedId ? [selectedId] : []);
      for (const id of idsToMark) {
          const item = listItems.find(i => i.id === id);
          if (item && item.type === 'message') {
              status ? markMessageRead(item.id) : markMessageUnread(item.id);
          }
      }
      setCheckedIds(new Set());
      showToast(status ? 'Marked as read' : 'Marked as unread', 'success');
  };

  // Sending Logic
  const handleSend = async () => {
    if (!composeData.to || !composeData.subject) {
        showToast('Recipient and Subject are required', 'error');
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
                html: composeData.body.replace(/\n/g, '<br/>'), // Basic conversion, Markdown editor handles HTML better usually
                text: composeData.body,
                attachments: composeData.attachments
            })
        });
        const data = await res.json();
        if (data.success) {
            showToast('Email sent successfully', 'success');
            setIsComposing(false);
            if (composeData.id) await deletePermanently(composeData.id, 'draft');
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
  };

  // Keyboard Shortcuts Config
  useKeyboardShortcuts({
      'arrowdown': () => {
          if (!selectedId && listItems.length > 0) handleSelectItem(listItems[0]);
          else {
              const idx = listItems.findIndex(i => i.id === selectedId);
              if (idx < listItems.length - 1) handleSelectItem(listItems[idx + 1]);
          }
      },
      'arrowup': () => {
          const idx = listItems.findIndex(i => i.id === selectedId);
          if (idx > 0) handleSelectItem(listItems[idx - 1]);
      },
      'delete': handleBulkDelete,
      'backspace': handleBulkDelete,
      'c': () => handleCompose(),
      'r': () => {
          if (selectedItem && selectedItem.type === 'message') {
              handleCompose({ to: (selectedItem.raw as ContactMessage).email, subject: `Re: ${selectedItem.subtitle}` });
          }
      },
      'select_all': toggleSelectAll
  });

  return (
    <div className="flex h-[calc(100vh-100px)] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
      
      {showMediaLibrary && (
        <MediaLibrary onSelect={(url) => {
            setComposeData(prev => ({ ...prev, attachments: [...prev.attachments, url] }));
            setShowMediaLibrary(false);
        }} onClose={() => setShowMediaLibrary(false)} />
      )}

      {/* --- Sidebar (Folders) --- */}
      {/* Mobile Drawer Overlay */}
      <div className={`absolute inset-0 bg-black/50 z-20 md:hidden transition-opacity ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setMobileMenuOpen(false)} />
      
      <div className={`absolute md:relative z-30 w-64 bg-slate-50 border-r border-slate-200 flex flex-col h-full transition-transform duration-300 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-4">
            <button onClick={() => handleCompose()} className="w-full bg-primary text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-slate-800 transition-colors shadow-sm active:scale-95">
                <Edit3 size={18} /> Compose
            </button>
        </div>
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            <FolderButton 
                active={activeFolder === 'inbox'} 
                onClick={() => { setActiveFolder('inbox'); setMobileMenuOpen(false); setSelectedId(null); setIsComposing(false); }} 
                icon={<Inbox size={18} />} 
                label="Inbox" 
                count={messages.filter(m => !m.read && !m.deleted_at).length} 
            />
            <FolderButton 
                active={activeFolder === 'sent'} 
                onClick={() => { setActiveFolder('sent'); setMobileMenuOpen(false); setSelectedId(null); setIsComposing(false); }} 
                icon={<Send size={18} />} 
                label="Sent" 
            />
            <FolderButton 
                active={activeFolder === 'drafts'} 
                onClick={() => { setActiveFolder('drafts'); setMobileMenuOpen(false); setSelectedId(null); setIsComposing(false); }} 
                icon={<FileText size={18} />} 
                label="Drafts" 
                count={drafts.filter(d => !d.deleted_at).length}
                countColor="text-slate-400"
            />
            <div className="pt-4 mt-2 border-t border-slate-200/60">
                <FolderButton 
                    active={activeFolder === 'trash'} 
                    onClick={() => { setActiveFolder('trash'); setMobileMenuOpen(false); setSelectedId(null); setIsComposing(false); }} 
                    icon={<Trash2 size={18} />} 
                    label="Trash" 
                    variant="danger"
                />
            </div>
        </nav>
      </div>

      {/* --- List View --- */}
      <div className={`w-full md:w-80 border-r border-slate-200 flex flex-col bg-white ${selectedId || isComposing ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-100 flex gap-2 items-center">
            <button className="md:hidden mr-2 text-slate-500" onClick={() => setMobileMenuOpen(true)}>
                <Menu size={20} />
            </button>
            <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-primary transition-all" />
            </div>
            <button onClick={handleRefresh} className={`p-2 text-slate-500 hover:text-primary hover:bg-slate-50 rounded-md transition-colors ${isRefreshing ? 'animate-spin' : ''}`}><RefreshCw size={18} /></button>
        </div>
        
        {/* Bulk Actions Bar */}
        {(checkedIds.size > 0 || selectedId) && (
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs animate-in slide-in-from-top-1">
                <span className="font-medium text-slate-600">{checkedIds.size || 1} selected</span>
                <div className="flex gap-2">
                    {activeFolder !== 'trash' && (
                        <>
                            <button onClick={() => handleBulkMarkRead(true)} className="p-1.5 hover:bg-white hover:text-primary rounded border border-transparent hover:border-slate-200" title="Mark Read"><MailOpen size={14} /></button>
                            <button onClick={() => handleBulkMarkRead(false)} className="p-1.5 hover:bg-white hover:text-primary rounded border border-transparent hover:border-slate-200" title="Mark Unread"><Mail size={14} /></button>
                        </>
                    )}
                    <button onClick={handleBulkDelete} className="p-1.5 hover:bg-red-50 text-red-600 rounded border border-transparent hover:border-red-100" title="Delete"><Trash2 size={14} /></button>
                </div>
            </div>
        )}

        <div className="flex-1 overflow-y-auto">
            {listItems.length === 0 ? <div className="p-12 text-center text-slate-400 text-sm flex flex-col items-center"><Inbox size={32} className="mb-2 opacity-20" /><span>No messages</span></div> : listItems.map(item => (
                <div key={item.id} onClick={() => handleSelectItem(item)} className={`group relative p-4 border-b border-slate-100 cursor-pointer transition-all hover:bg-slate-50 ${selectedId === item.id ? 'bg-blue-50/50 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'} ${!item.read ? 'bg-slate-50' : ''}`}>
                    
                    {/* Checkbox Overlay */}
                    <div className="absolute left-2 top-4 opacity-70 group-hover:opacity-100 transition-opacity z-10" onClick={(e) => e.stopPropagation()}>
                        <button onClick={(e) => toggleCheck(item.id, e)} className="text-slate-400 hover:text-primary">
                            {checkedIds.has(item.id) ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
                        </button>
                    </div>

                    <div className="flex justify-between items-start mb-1 pl-4 group-hover:pl-6 transition-all duration-200">
                        <h4 className={`text-sm truncate pr-2 flex items-center gap-1.5 ${!item.read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                            {item.replied && <CornerUpLeft size={12} className="text-green-500 flex-shrink-0" />}
                            {item.status === 'sent' && <CheckCircle2 size={12} className="text-green-500 flex-shrink-0" />}
                            {item.status === 'failed' && <AlertOctagon size={12} className="text-red-500 flex-shrink-0" />}
                            {item.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">{item.date}</span>
                    </div>
                    <p className={`text-xs truncate pl-4 group-hover:pl-6 transition-all duration-200 ${!item.read ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>{item.subtitle}</p>
                </div>
            ))}
        </div>
      </div>

      {/* --- Reading Pane / Composer --- */}
      <div className={`flex-1 flex flex-col bg-white min-w-0 ${!selectedId && !isComposing ? 'hidden md:flex' : 'flex'}`}>
        {isComposing ? (
            <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                    <h3 className="font-serif text-lg text-slate-800">New Message</h3>
                    <div className="flex gap-2">
                        <button onClick={handleSaveDraft} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md text-sm font-medium transition-colors">Save Draft</button>
                        <button onClick={() => setIsComposing(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
                    </div>
                </div>
                <div className="p-6 flex-1 flex flex-col gap-4 overflow-y-auto">
                    <div className="flex items-center gap-4">
                        <label className="w-16 text-sm font-medium text-slate-500">To:</label>
                        <input type="email" value={composeData.to} onChange={e => setComposeData({...composeData, to: e.target.value})} className="flex-1 border-b border-slate-200 py-2 focus:border-primary focus:outline-none text-sm bg-transparent transition-colors" placeholder="recipient@example.com" />
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="w-16 text-sm font-medium text-slate-500">Subject:</label>
                        <input type="text" value={composeData.subject} onChange={e => setComposeData({...composeData, subject: e.target.value})} className="flex-1 border-b border-slate-200 py-2 focus:border-primary focus:outline-none text-sm font-medium bg-transparent transition-colors" placeholder="Subject line" />
                    </div>
                    
                    {/* Rich Text Editor Replacement */}
                    <div className="flex-1 mt-4">
                        <MarkdownEditor 
                            value={composeData.body}
                            onChange={val => setComposeData({...composeData, body: val})}
                            label="Message Body"
                            rows={15}
                        />
                    </div>
                    
                    {composeData.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {composeData.attachments.map((url, i) => (
                                <div key={i} className="flex items-center gap-2 bg-slate-100 text-xs px-2 py-1 rounded-md text-slate-600">
                                    <span className="truncate max-w-[150px]">{url.split('/').pop()}</span>
                                    <button onClick={() => setComposeData(prev => ({ ...prev, attachments: prev.attachments.filter((_, idx) => idx !== i) }))} className="text-slate-400 hover:text-red-500"><X size={12} /></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                    <button onClick={() => setShowMediaLibrary(true)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 flex items-center gap-2 text-sm" title="Attach File">
                        <Paperclip size={18} /> Attach
                    </button>
                    <button onClick={handleSend} disabled={isSending} className="bg-primary text-white px-8 py-2.5 rounded-md font-medium hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-70 shadow-sm hover:shadow-md transform active:scale-95">
                        {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} {isSending ? 'Sending...' : 'Send Message'}
                    </button>
                </div>
            </div>
        ) : selectedItem ? (
            <div className="flex flex-col h-full animate-in fade-in duration-300">
                {/* Message Header */}
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30 sticky top-0 z-10 backdrop-blur-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                            <button className="md:hidden mr-2 p-1 bg-white border border-slate-200 rounded-md text-slate-500" onClick={() => setSelectedId(null)}>
                                <ChevronLeft size={16} />
                            </button>
                            <h2 className="text-xl md:text-2xl font-serif text-slate-900 leading-tight">{selectedItem.subtitle}</h2>
                        </div>
                        
                        {/* Toolbar */}
                        <div className="flex gap-2">
                            {activeFolder === 'inbox' && (
                                <>
                                    <button onClick={() => handleBulkMarkRead(false)} className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-md transition-colors" title="Mark as Unread"><MailOpen size={20} /></button>
                                    <button onClick={() => handleCompose({ to: (selectedItem.raw as ContactMessage).email, subject: `Re: ${selectedItem.subtitle}` })} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-primary hover:text-primary text-slate-700 rounded-md text-sm font-medium transition-all shadow-sm"><CornerUpLeft size={16} /> Reply</button>
                                </>
                            )}
                            {activeFolder === 'trash' ? <button onClick={() => restoreFromTrash(selectedId!, selectedItem.type)} className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors" title="Restore"><RotateCcw size={20} /></button> : null}
                            <button onClick={handleBulkDelete} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title={activeFolder === 'trash' ? "Delete Permanently" : "Move to Trash"}><Trash2 size={20} /></button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center text-slate-500 border border-slate-200 shadow-sm"><User size={20} /></div>
                        <div>
                            <div className="font-bold text-slate-800 text-sm">
                                {selectedItem.title}
                                {selectedItem.type === 'message' && <span className="text-slate-400 font-normal ml-1">&lt;{(selectedItem.raw as ContactMessage).email}&gt;</span>}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                                {activeFolder === 'sent' ? 'Sent on ' : 'Received on '}{selectedItem.date}
                                {selectedItem.status === 'sent' && <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] font-medium"><CheckCircle2 size={10} /> Sent</span>}
                                {selectedItem.status === 'failed' && <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] font-medium"><AlertOctagon size={10} /> Failed</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Message Body */}
                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="prose prose-slate max-w-none text-sm leading-7 text-slate-700">
                        {/* Rendering logic based on type */}
                        {selectedItem.type === 'message' && (selectedItem.raw as ContactMessage).message.split('\n').map((line, i) => <p key={i} className="mb-2 min-h-[1em]">{line}</p>)}
                        {(selectedItem.type === 'sent' || selectedItem.type === 'draft') && (
                            <div className="whitespace-pre-wrap font-sans text-slate-700">
                                {(selectedItem.type === 'draft' ? (selectedItem.raw as Draft).message : (selectedItem.raw as SentEmail).text || 'No text content available.')}
                            </div>
                        )}
                    </div>
                    {/* Render Attachments */}
                    {(selectedItem.raw.attachments && selectedItem.raw.attachments.length > 0) && (
                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Paperclip size={14} /> {selectedItem.raw.attachments.length} Attachment{selectedItem.raw.attachments.length !== 1 ? 's' : ''}
                            </h5>
                            <div className="flex flex-wrap gap-3">
                                {selectedItem.raw.attachments.map((att, i) => (
                                    <a 
                                      key={i} 
                                      href={att} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 hover:border-primary transition-colors group"
                                    >
                                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-slate-100 text-primary">
                                            <File size={16} />
                                        </div>
                                        <span className="text-sm text-slate-600 font-medium max-w-[200px] truncate">
                                            {att.startsWith('[File:') ? att : att.split('/').pop()}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 bg-slate-50/30">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 border border-slate-200"><Mail size={32} className="text-slate-400" /></div>
                <p className="text-sm font-medium text-slate-500">Select a conversation to start reading</p>
                <p className="text-xs mt-2">Use <kbd className="font-mono bg-white px-1 border rounded">C</kbd> to compose</p>
            </div>
        )}
      </div>
    </div>
  );
}

// Sub-component for Cleaner JSX
const FolderButton = ({ active, onClick, icon, label, count, variant = 'default', countColor = 'bg-primary text-white' }: any) => (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${active 
        ? (variant === 'danger' ? 'bg-red-50 text-red-600 shadow-sm ring-1 ring-red-100' : 'bg-white text-primary shadow-sm ring-1 ring-slate-100') 
        : (variant === 'danger' ? 'hover:bg-red-50 text-red-600' : 'text-slate-600 hover:bg-slate-200/50')
    }`}>
        <div className="flex items-center gap-3">{icon} {label}</div>
        {count > 0 && <span className={`${countColor.includes('bg-') ? countColor + ' text-[10px] font-bold py-0.5 px-2 rounded-full' : countColor + ' text-xs'}`}>{count}</span>}
    </button>
);