'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, Inbox, Send, FileText, Trash2, Edit3, Search, 
  ChevronLeft, ChevronRight, RefreshCw, MoreHorizontal, 
  CornerUpLeft, Check, X, Loader2, User, Paperclip
} from 'lucide-react';
import { ContactMessage, Draft, ResendEmail } from '@/types';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/contexts/ToastContext';
import { usePageTitle } from '@/hooks/usePageTitle';

// --- Types ---
type Folder = 'inbox' | 'sent' | 'drafts';

// --- Main Component ---
export default function InboxManager() {
  usePageTitle('Mail - Admin');
  const { 
    messages, sentEmails, drafts, 
    markMessageRead, markMessageReplied, deleteMessage, 
    saveDraft, deleteDraft, refreshSentEmails 
  } = useData();
  const { showToast } = useToast();

  // State
  const [activeFolder, setActiveFolder] = useState<Folder>('inbox');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Compose State
  const [composeData, setComposeData] = useState<{ id?: string, to: string, subject: string, body: string }>({
    to: '', subject: '', body: ''
  });
  const [isSending, setIsSending] = useState(false);

  // --- Handlers ---

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshSentEmails();
    // Assuming other data live-updates via Context/Supabase
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleCompose = (defaults?: Partial<typeof composeData>) => {
    setComposeData({ to: '', subject: '', body: '', ...defaults });
    setIsComposing(true);
    setSelectedId(null);
  };

  const handleSelectMessage = (id: string, msg?: ContactMessage) => {
    setSelectedId(id);
    setIsComposing(false);
    if (activeFolder === 'inbox' && msg && !msg.read) {
        markMessageRead(id);
    }
    // If selecting a draft, open compose mode
    if (activeFolder === 'drafts') {
        const draft = drafts.find(d => d.id === id);
        if (draft) {
            handleCompose({ id: draft.id, to: draft.recipient, subject: draft.subject, body: draft.message });
        }
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
                text: composeData.body
            })
        });
        const data = await res.json();
        
        if (data.success) {
            showToast('Email sent successfully', 'success');
            setIsComposing(false);
            if (composeData.id) await deleteDraft(composeData.id); // Delete draft after sending
            await refreshSentEmails(); // Refresh sent folder
        } else {
            throw new Error(data.error || 'Failed to send');
        }
    } catch (e: any) {
        showToast(e.message, 'error');
    } finally {
        setIsSending(false);
    }
  };

  const handleSaveDraft = async () => {
      // Use existing ID or create new one
      const id = composeData.id || `draft_${Date.now()}`;
      const draft: Draft = {
          id,
          recipient: composeData.to,
          subject: composeData.subject,
          message: composeData.body,
          updated_at: new Date().toISOString()
      };
      
      // Update state immediately to reflect ID if it was new
      setComposeData(prev => ({ ...prev, id }));

      const success = await saveDraft(draft);
      if (success) {
          showToast('Draft saved', 'success');
      } else {
          showToast('Failed to save draft', 'error');
      }
  };

  const handleDeleteCurrent = async () => {
      if (!selectedId) return;
      
      if (window.confirm('Are you sure you want to delete this?')) {
          let success = false;
          if (activeFolder === 'inbox') success = await deleteMessage(selectedId);
          if (activeFolder === 'drafts') success = await deleteDraft(selectedId);
          
          if (success) {
              showToast('Deleted', 'success');
              setSelectedId(null);
          }
      }
  };

  // --- Filtering ---
  
  const getListItems = () => {
      const lowerQ = searchQuery.toLowerCase();
      switch (activeFolder) {
          case 'inbox':
              return messages.filter(m => 
                  m.name.toLowerCase().includes(lowerQ) || 
                  m.subject.toLowerCase().includes(lowerQ)
              ).map(m => ({
                  id: m.id,
                  title: m.name,
                  subtitle: m.subject,
                  date: m.date,
                  read: m.read,
                  replied: m.replied,
                  raw: m
              }));
          case 'sent':
              return sentEmails.filter(e => 
                  e.to.some(t => t.toLowerCase().includes(lowerQ)) || 
                  e.subject.toLowerCase().includes(lowerQ)
              ).map(e => ({
                  id: e.id,
                  title: `To: ${e.to.join(', ')}`,
                  subtitle: e.subject,
                  date: new Date(e.created_at).toLocaleDateString(),
                  read: true,
                  replied: false,
                  raw: e
              }));
          case 'drafts':
              return drafts.filter(d => 
                  (d.recipient || '').toLowerCase().includes(lowerQ) || 
                  (d.subject || '').toLowerCase().includes(lowerQ)
              ).map(d => ({
                  id: d.id,
                  title: d.recipient || '(No Recipient)',
                  subtitle: d.subject || '(No Subject)',
                  date: new Date(d.updated_at).toLocaleDateString(),
                  read: true,
                  replied: false,
                  raw: d
              }));
          default: return [];
      }
  };

  const listItems = getListItems();
  const selectedItem = listItems.find(i => i.id === selectedId);

  return (
    <div className="flex h-[calc(100vh-100px)] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500">
      
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
                {messages.filter(m => !m.read).length > 0 && (
                    <span className="bg-primary text-white text-[10px] font-bold py-0.5 px-2 rounded-full">{messages.filter(m => !m.read).length}</span>
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
                {drafts.length > 0 && <span className="text-slate-400 font-normal text-xs">{drafts.length}</span>}
            </button>
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
                        onClick={() => handleSelectMessage(item.id, activeFolder === 'inbox' ? item.raw as ContactMessage : undefined)}
                        className={`p-4 border-b border-slate-100 cursor-pointer transition-all hover:bg-slate-50 ${selectedId === item.id ? 'bg-blue-50/50 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'} ${!item.read ? 'bg-slate-50' : ''}`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <h4 className={`text-sm truncate pr-2 flex items-center gap-1.5 ${!item.read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                {item.replied && <CornerUpLeft size={12} className="text-green-500 flex-shrink-0" />}
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
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                    <div className="flex gap-2 text-slate-400">
                        {/* Placeholder for future attachment features */}
                        <button className="p-2 hover:bg-slate-200 rounded-full transition-colors" title="Attach File (Coming Soon)">
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
                                    {activeFolder === 'inbox' && <span className="text-slate-400 font-normal ml-1">&lt;{(selectedItem.raw as ContactMessage).email}&gt;</span>}
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                    {activeFolder === 'sent' ? 'Sent on ' : 'Received on '}{selectedItem.date}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {activeFolder === 'inbox' && (
                            <button 
                                onClick={() => handleCompose({ to: (selectedItem.raw as ContactMessage).email, subject: `Re: ${selectedItem.subtitle}` })}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-primary hover:text-primary text-slate-700 rounded-md text-sm font-medium transition-all shadow-sm"
                            >
                                <CornerUpLeft size={16} /> Reply
                            </button>
                        )}
                        {activeFolder !== 'sent' && (
                            <button 
                                onClick={handleDeleteCurrent}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Delete"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Body */}
                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="prose prose-slate max-w-none text-sm leading-7 text-slate-700">
                        {activeFolder === 'inbox' && (selectedItem.raw as ContactMessage).message.split('\n').map((line, i) => (
                            <p key={i} className="mb-2">{line}</p>
                        ))}
                        
                        {(activeFolder === 'sent' || activeFolder === 'drafts') && (
                            <div className="whitespace-pre-wrap font-sans text-slate-700">
                                {(activeFolder === 'drafts' ? (selectedItem.raw as Draft).message : (selectedItem.raw as ResendEmail).text || 'No text content available.')}
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