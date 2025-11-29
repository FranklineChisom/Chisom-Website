'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { BlogPost, Publication, SiteConfig, Newsletter, ContactMessage, Subscriber, Draft, SentEmail } from '../types';
import { SITE_CONFIG as DEFAULT_CONFIG } from '../constants';
import { supabase } from '../lib/supabase';

interface DataContextType {
  siteConfig: SiteConfig;
  updateSiteConfig: (config: SiteConfig) => Promise<boolean>;
  
  blogPosts: BlogPost[];
  addBlogPost: (post: BlogPost) => Promise<boolean>;
  updateBlogPost: (post: BlogPost) => Promise<boolean>;
  deleteBlogPost: (id: string) => Promise<boolean>;
  
  publications: Publication[];
  addPublication: (pub: Publication) => Promise<boolean>;
  updatePublication: (pub: Publication) => Promise<boolean>;
  deletePublication: (id: string) => Promise<boolean>;
  
  newsletters: Newsletter[];
  addNewsletter: (item: Newsletter) => Promise<boolean>;
  updateNewsletter: (item: Newsletter) => Promise<boolean>;
  deleteNewsletter: (id: string) => Promise<boolean>;
  
  // Inbox & Email
  messages: ContactMessage[];
  sentEmails: SentEmail[];
  drafts: Draft[];
  addMessage: (msg: ContactMessage) => Promise<boolean>;
  markMessageRead: (id: string) => Promise<boolean>;
  markMessageUnread: (id: string) => Promise<boolean>;
  markMessageReplied: (id: string) => Promise<boolean>;
  saveDraft: (draft: Draft) => Promise<boolean>;
  
  // Trash Management
  moveToTrash: (id: string, type: 'message' | 'sent' | 'draft') => Promise<boolean>;
  restoreFromTrash: (id: string, type: 'message' | 'sent' | 'draft') => Promise<boolean>;
  deletePermanently: (id: string, type: 'message' | 'sent' | 'draft') => Promise<boolean>;
  
  refreshSentEmails: () => Promise<void>;
  
  subscribers: Subscriber[];
  addSubscriber: (email: string) => Promise<boolean>;
  removeSubscriber: (email: string) => Promise<boolean>;
  
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  
  // Email Client Data
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Initial Mount: Check Auth & Load Public Data
  useEffect(() => {
    const checkAuth = () => {
      const storedAuth = localStorage.getItem('isAuthenticated');
      const hasCookie = document.cookie.split(';').some((item) => item.trim().startsWith('admin_session='));
      
      if (storedAuth === 'true' || hasCookie) {
        setIsAuthenticated(true);
      }
    };
    
    checkAuth();
    loadPublicData();
  }, []);

  // 2. Effect: Load Privileged Data when Authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadPrivilegedData();
      localStorage.setItem('isAuthenticated', 'true');
    }
  }, [isAuthenticated]);

  // --- DATA LOADERS ---

  const loadPublicData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadSiteConfig(),
        loadBlogPosts(),
        loadPublications(),
        loadNewsletters()
      ]);
    } catch (error) {
      console.error('Error loading public data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPrivilegedData = async () => {
    try {
      await Promise.all([
        loadMessages(),
        loadSubscribers(),
        refreshSentEmails(),
        loadDrafts()
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  // --- FETCHERS ---

  const loadSiteConfig = async () => {
    const { data } = await supabase.from('site_config').select('*').single();
    if (data) setSiteConfig({ ...data, focusText: data.focus_text, focusLink: data.focus_link, focusContent: data.focus_content, researchIntro: data.research_intro, researchInterests: data.research_interests, aboutImage: data.about_image, analyticsUrl: data.analytics_url });
  };

  const loadBlogPosts = async () => {
    const { data } = await supabase.from('blog_posts').select('*');
    if (data) setBlogPosts(data.map(p => ({ ...p, readTime: p.read_time, coverImage: p.cover_image })));
  };

  const loadPublications = async () => {
    const { data } = await supabase.from('publications').select('*');
    if (data) setPublications(data.map(p => ({ ...p, coAuthors: p.co_authors })));
  };

  const loadNewsletters = async () => {
    const { data } = await supabase.from('newsletters').select('*');
    if (data) setNewsletters(data.map(n => ({ ...n, coverImage: n.cover_image })));
  };

  const loadMessages = async () => {
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
    if (data) setMessages(data);
  };

  const loadSubscribers = async () => {
    const { data } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false });
    if (data) setSubscribers(data);
  };

  const refreshSentEmails = async () => {
    // Now fetch from Supabase table instead of Resend API directly for better data persistence
    const { data, error } = await supabase.from('sent_emails').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setSentEmails(data);
    }
  };

  const loadDrafts = async () => {
    const { data } = await supabase.from('drafts').select('*').order('updated_at', { ascending: false });
    if (data) setDrafts(data);
  };

  // --- CRUD OPERATIONS ---

  const updateSiteConfig = async (config: SiteConfig): Promise<boolean> => {
    const { data: existing } = await supabase.from('site_config').select('id').single();
    const payload = {
        name: config.name, role: config.role, tagline: config.tagline,
        focus_text: config.focusText, focus_link: config.focusLink, focus_content: config.focusContent,
        research_intro: config.researchIntro, research_interests: config.researchInterests,
        about_image: config.aboutImage, email: config.email, location: config.location,
        social: config.social, analytics_url: config.analyticsUrl, updated_at: new Date().toISOString()
    };
    const { error } = existing 
        ? await supabase.from('site_config').update(payload).eq('id', existing.id)
        : await supabase.from('site_config').insert([payload]);
    
    if (!error) setSiteConfig(config);
    return !error;
  };

  // --- Content Handlers (Blog, Pubs, Newsletter) omitted for brevity as they are unchanged ---
  // Re-implementing simplified versions to satisfy interface
  const addBlogPost = async (post: BlogPost) => { const { error } = await supabase.from('blog_posts').insert({ ...post, read_time: post.readTime, cover_image: post.coverImage }); if(!error) loadBlogPosts(); return !error; };
  const updateBlogPost = async (post: BlogPost) => { const { error } = await supabase.from('blog_posts').update({ ...post, read_time: post.readTime, cover_image: post.coverImage, updated_at: new Date().toISOString() }).eq('id', post.id); if(!error) loadBlogPosts(); return !error; };
  const deleteBlogPost = async (id: string) => { const { error } = await supabase.from('blog_posts').delete().eq('id', id); if(!error) loadBlogPosts(); return !error; };
  
  const addPublication = async (pub: Publication) => { const { error } = await supabase.from('publications').insert({ ...pub, co_authors: pub.coAuthors }); if(!error) loadPublications(); return !error; };
  const updatePublication = async (pub: Publication) => { const { error } = await supabase.from('publications').update({ ...pub, co_authors: pub.coAuthors, updated_at: new Date().toISOString() }).eq('id', pub.id); if(!error) loadPublications(); return !error; };
  const deletePublication = async (id: string) => { const { error } = await supabase.from('publications').delete().eq('id', id); if(!error) loadPublications(); return !error; };

  const addNewsletter = async (item: Newsletter) => { const { error } = await supabase.from('newsletters').insert({ ...item, cover_image: item.coverImage }); if(!error) loadNewsletters(); return !error; };
  const updateNewsletter = async (item: Newsletter) => { const { error } = await supabase.from('newsletters').update({ ...item, cover_image: item.coverImage, updated_at: new Date().toISOString() }).eq('id', item.id); if(!error) loadNewsletters(); return !error; };
  const deleteNewsletter = async (id: string) => { const { error } = await supabase.from('newsletters').delete().eq('id', id); if(!error) loadNewsletters(); return !error; };

  // --- Messages ---
  const addMessage = async (msg: ContactMessage) => {
    const { error } = await supabase.from('messages').insert(msg);
    return !error;
  };

  const markMessageRead = async (id: string) => {
    const { error } = await supabase.from('messages').update({ read: true }).eq('id', id);
    if (!error) setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
    return !error;
  };

  const markMessageUnread = async (id: string) => {
    const { error } = await supabase.from('messages').update({ read: false }).eq('id', id);
    if (!error) setMessages(prev => prev.map(m => m.id === id ? { ...m, read: false } : m));
    return !error;
  };

  const markMessageReplied = async (id: string) => {
    const { error } = await supabase.from('messages').update({ replied: true }).eq('id', id);
    if (!error) setMessages(prev => prev.map(m => m.id === id ? { ...m, replied: true } : m));
    return !error;
  };

  // --- Drafts ---
  const saveDraft = async (draft: Draft) => {
    const exists = drafts.some(d => d.id === draft.id);
    const payload = { ...draft, updated_at: new Date().toISOString() };
    const { error } = exists 
        ? await supabase.from('drafts').update(payload).eq('id', draft.id)
        : await supabase.from('drafts').insert(payload);
    
    if (!error) loadDrafts();
    return !error;
  };

  // --- TRASH & DELETION LOGIC ---

  const moveToTrash = async (id: string, type: 'message' | 'sent' | 'draft'): Promise<boolean> => {
    const table = type === 'message' ? 'messages' : type === 'sent' ? 'sent_emails' : 'drafts';
    const { error } = await supabase.from(table).update({ deleted_at: new Date().toISOString() }).eq('id', id);
    
    if (!error) {
        if (type === 'message') loadMessages();
        if (type === 'sent') refreshSentEmails();
        if (type === 'draft') loadDrafts();
    }
    return !error;
  };

  const restoreFromTrash = async (id: string, type: 'message' | 'sent' | 'draft'): Promise<boolean> => {
    const table = type === 'message' ? 'messages' : type === 'sent' ? 'sent_emails' : 'drafts';
    const { error } = await supabase.from(table).update({ deleted_at: null }).eq('id', id);
    
    if (!error) {
        if (type === 'message') loadMessages();
        if (type === 'sent') refreshSentEmails();
        if (type === 'draft') loadDrafts();
    }
    return !error;
  };

  const deletePermanently = async (id: string, type: 'message' | 'sent' | 'draft'): Promise<boolean> => {
    const table = type === 'message' ? 'messages' : type === 'sent' ? 'sent_emails' : 'drafts';
    const { error } = await supabase.from(table).delete().eq('id', id);
    
    if (!error) {
        if (type === 'message') setMessages(prev => prev.filter(m => m.id !== id));
        if (type === 'sent') setSentEmails(prev => prev.filter(e => e.id !== id));
        if (type === 'draft') setDrafts(prev => prev.filter(d => d.id !== id));
    }
    return !error;
  };

  // --- Subscribers ---
  const addSubscriber = async (email: string) => {
    const { error } = await supabase.from('subscribers').insert({ id: Date.now().toString(), email: email.toLowerCase(), date: new Date().toISOString() });
    return !error;
  };

  const removeSubscriber = async (email: string) => {
    const { error } = await supabase.from('subscribers').delete().eq('email', email.toLowerCase());
    if (!error) setSubscribers(prev => prev.filter(s => s.email.toLowerCase() !== email.toLowerCase()));
    return !error;
  };

  // --- Auth ---
  const login = async (email: string, password: string) => {
    const { data } = await supabase.from('admin_auth').select('password_hash, admin_email').single();
    if (!data) return false;
    
    if (password === data.password_hash && email.toLowerCase() === data.admin_email?.toLowerCase()) {
      setIsAuthenticated(true);
      document.cookie = `admin_session=true; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    document.cookie = 'admin_session=; path=/; max-age=0;';
  };

  return (
    <DataContext.Provider value={{
      siteConfig, updateSiteConfig,
      blogPosts, addBlogPost, updateBlogPost, deleteBlogPost,
      publications, addPublication, updatePublication, deletePublication,
      newsletters, addNewsletter, updateNewsletter, deleteNewsletter,
      messages, sentEmails, drafts,
      addMessage, markMessageRead, markMessageUnread, markMessageReplied, saveDraft, 
      moveToTrash, restoreFromTrash, deletePermanently, refreshSentEmails,
      subscribers, addSubscriber, removeSubscriber,
      isAuthenticated, login, logout, isLoading
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within a DataProvider");
  return context;
};