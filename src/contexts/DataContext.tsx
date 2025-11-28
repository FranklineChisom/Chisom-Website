'use client'; // Ensure this directive is here

import React, { createContext, useContext, useState, useEffect } from 'react';
import { BlogPost, Publication, SiteConfig, Newsletter, ContactMessage, Subscriber } from '../types';
import { SITE_CONFIG as DEFAULT_CONFIG, BLOG_POSTS as DEFAULT_POSTS, PUBLICATIONS as DEFAULT_PUBS, NEWSLETTERS as DEFAULT_NEWSLETTERS } from '../constants';
import { supabase, handleSupabaseError } from '../lib/supabase';

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
  messages: ContactMessage[];
  addMessage: (msg: ContactMessage) => Promise<boolean>;
  markMessageRead: (id: string) => Promise<boolean>;
  markMessageUnread: (id: string) => Promise<boolean>;
  deleteMessage: (id: string) => Promise<boolean>;
  subscribers: Subscriber[];
  addSubscriber: (email: string) => Promise<boolean>;
  removeSubscriber: (email: string) => Promise<boolean>;
  isAuthenticated: boolean;
  login: (password: string, email: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  
  // FIX: Initialize to false. Do NOT access localStorage here.
  // The correct state will be set by the useEffect below once the component mounts in the browser.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from Supabase on mount
  useEffect(() => {
    loadAllData();
    
    // Check for active Supabase session on mount
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkSession();

    // Listen for auth changes (login/logout/refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadSiteConfig(),
        loadBlogPosts(),
        loadPublications(),
        loadNewsletters(),
        loadMessages(),
        loadSubscribers()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Site Config
  const loadSiteConfig = async () => {
    const { data, error } = await supabase
      .from('site_config')
      .select('*')
      .single();

    if (error) {
      // Don't log error for empty table on fresh setup
      if (error.code !== 'PGRST116') {
         handleSupabaseError(error, 'Error loading site config');
      }
      setSiteConfig(DEFAULT_CONFIG);
      return;
    }

    if (data) {
      setSiteConfig({
        name: data.name,
        role: data.role,
        tagline: data.tagline,
        focusText: data.focus_text,
        focusLink: data.focus_link,
        focusContent: data.focus_content,
        researchIntro: data.research_intro,
        researchInterests: data.research_interests,
        aboutImage: data.about_image,
        email: data.email,
        location: data.location,
        social: data.social,
        analyticsUrl: data.analytics_url // Load from DB
      });
    }
  };

  const updateSiteConfig = async (config: SiteConfig): Promise<boolean> => {
    // Check if a row exists
    const { data: existing } = await supabase.from('site_config').select('id').single();
    
    let error;
    
    const payload = {
        name: config.name,
        role: config.role,
        tagline: config.tagline,
        focus_text: config.focusText,
        focus_link: config.focusLink,
        focus_content: config.focusContent,
        research_intro: config.researchIntro,
        research_interests: config.researchInterests,
        about_image: config.aboutImage,
        email: config.email,
        location: config.location,
        social: config.social,
        analytics_url: config.analyticsUrl, // Save to DB
        updated_at: new Date().toISOString()
    };

    if (existing) {
       const { error: updateError } = await supabase
        .from('site_config')
        .update(payload)
        .eq('id', existing.id);
       error = updateError;
    } else {
       const { error: insertError } = await supabase
        .from('site_config')
        .insert([payload]); // Insert as array
       error = insertError;
    }

    if (error) {
      handleSupabaseError(error, 'Error updating site config');
      return false;
    }

    setSiteConfig(config);
    return true;
  };

  // Blog Posts
  const loadBlogPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*');

    if (error) {
      handleSupabaseError(error, 'Error loading blog posts');
      setBlogPosts(DEFAULT_POSTS);
      return;
    }

    const posts = data.map(post => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      date: post.date,
      category: post.category,
      readTime: post.read_time,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.cover_image,
      published: post.published
    }));

    // Sort by date descending (newest first)
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setBlogPosts(posts);
  };

  const addBlogPost = async (post: BlogPost): Promise<boolean> => {
    const { error } = await supabase
      .from('blog_posts')
      .insert({
        id: post.id,
        slug: post.slug,
        title: post.title,
        date: post.date,
        category: post.category,
        read_time: post.readTime,
        excerpt: post.excerpt,
        content: post.content,
        cover_image: post.coverImage,
        published: post.published
      });

    if (error) {
      handleSupabaseError(error, 'Error adding blog post');
      return false;
    }

    const newPosts = [post, ...blogPosts];
    newPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setBlogPosts(newPosts);
    return true;
  };

  const updateBlogPost = async (post: BlogPost): Promise<boolean> => {
    const { error } = await supabase
      .from('blog_posts')
      .update({
        slug: post.slug,
        title: post.title,
        date: post.date,
        category: post.category,
        read_time: post.readTime,
        excerpt: post.excerpt,
        content: post.content,
        cover_image: post.coverImage,
        published: post.published,
        updated_at: new Date().toISOString()
      })
      .eq('id', post.id);

    if (error) {
      handleSupabaseError(error, 'Error updating blog post');
      return false;
    }

    const updatedPosts = blogPosts.map(p => p.id === post.id ? post : p);
    updatedPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setBlogPosts(updatedPosts);
    return true;
  };

  const deleteBlogPost = async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      handleSupabaseError(error, 'Error deleting blog post');
      return false;
    }

    setBlogPosts(blogPosts.filter(p => p.id !== id));
    return true;
  };

  // Publications
  const loadPublications = async () => {
    const { data, error } = await supabase
      .from('publications')
      .select('*');

    if (error) {
      handleSupabaseError(error, 'Error loading publications');
      setPublications(DEFAULT_PUBS);
      return;
    }

    const pubs = data.map(pub => ({
      id: pub.id,
      title: pub.title,
      year: pub.year,
      venue: pub.venue,
      type: pub.type,
      featured: pub.featured,
      abstract: pub.abstract,
      coAuthors: pub.co_authors,
      link: pub.link,
      published: pub.published
    }));

    pubs.sort((a, b) => {
        const yearA = parseInt(a.year) || 0;
        const yearB = parseInt(b.year) || 0;
        return yearB - yearA;
    });

    setPublications(pubs);
  };

  const addPublication = async (pub: Publication): Promise<boolean> => {
    const { error } = await supabase
      .from('publications')
      .insert({
        id: pub.id,
        title: pub.title,
        year: pub.year,
        venue: pub.venue,
        type: pub.type,
        featured: pub.featured || false,
        abstract: pub.abstract,
        co_authors: pub.coAuthors || [],
        link: pub.link,
        published: pub.published
      });

    if (error) {
      handleSupabaseError(error, 'Error adding publication');
      return false;
    }

    const newPubs = [pub, ...publications];
    newPubs.sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
    setPublications(newPubs);
    return true;
  };

  const updatePublication = async (pub: Publication): Promise<boolean> => {
    const { error } = await supabase
      .from('publications')
      .update({
        title: pub.title,
        year: pub.year,
        venue: pub.venue,
        type: pub.type,
        featured: pub.featured,
        abstract: pub.abstract,
        co_authors: pub.coAuthors,
        link: pub.link,
        published: pub.published,
        updated_at: new Date().toISOString()
      })
      .eq('id', pub.id);

    if (error) {
      handleSupabaseError(error, 'Error updating publication');
      return false;
    }

    const updatedPubs = publications.map(p => p.id === pub.id ? pub : p);
    updatedPubs.sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
    setPublications(updatedPubs);
    return true;
  };

  const deletePublication = async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('publications')
      .delete()
      .eq('id', id);

    if (error) {
      handleSupabaseError(error, 'Error deleting publication');
      return false;
    }

    setPublications(publications.filter(p => p.id !== id));
    return true;
  };

  // Newsletters
  const loadNewsletters = async () => {
    const { data, error } = await supabase
      .from('newsletters')
      .select('*');

    if (error) {
      handleSupabaseError(error, 'Error loading newsletters');
      setNewsletters(DEFAULT_NEWSLETTERS);
      return;
    }

    const newsletterData = data.map(n => ({
        id: n.id,
        slug: n.slug,
        title: n.title,
        date: n.date,
        description: n.description,
        content: n.content,
        coverImage: n.cover_image,
        published: n.published
    }));

    newsletterData.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setNewsletters(newsletterData);
  };

  const addNewsletter = async (item: Newsletter): Promise<boolean> => {
    const { error } = await supabase
      .from('newsletters')
      .insert({
          id: item.id,
          slug: item.slug,
          title: item.title,
          date: item.date,
          description: item.description,
          content: item.content,
          cover_image: item.coverImage,
          published: item.published
      });

    if (error) {
      handleSupabaseError(error, 'Error adding newsletter');
      return false;
    }

    const newNewsletters = [item, ...newsletters];
    newNewsletters.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setNewsletters(newNewsletters);
    return true;
  };

  const updateNewsletter = async (item: Newsletter): Promise<boolean> => {
    const { error } = await supabase
      .from('newsletters')
      .update({
        slug: item.slug,
        title: item.title,
        date: item.date,
        description: item.description,
        content: item.content,
        cover_image: item.coverImage,
        published: item.published,
        updated_at: new Date().toISOString()
      })
      .eq('id', item.id);

    if (error) {
      handleSupabaseError(error, 'Error updating newsletter');
      return false;
    }

    const updatedNewsletters = newsletters.map(n => n.id === item.id ? item : n);
    updatedNewsletters.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setNewsletters(updatedNewsletters);
    return true;
  };

  const deleteNewsletter = async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('newsletters')
      .delete()
      .eq('id', id);

    if (error) {
      handleSupabaseError(error, 'Error deleting newsletter');
      return false;
    }

    setNewsletters(newsletters.filter(n => n.id !== id));
    return true;
  };

  // Messages
  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      handleSupabaseError(error, 'Error loading messages');
      return;
    }

    setMessages(data);
  };

  const addMessage = async (msg: ContactMessage): Promise<boolean> => {
    const { error } = await supabase
      .from('messages')
      .insert(msg);

    if (error) {
      handleSupabaseError(error, 'Error adding message');
      return false;
    }

    setMessages([msg, ...messages]);
    return true;
  };

  const markMessageRead = async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', id);

    if (error) {
      handleSupabaseError(error, 'Error marking message as read');
      return false;
    }

    setMessages(messages.map(m => m.id === id ? { ...m, read: true } : m));
    return true;
  };

  const markMessageUnread = async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('messages')
      .update({ read: false })
      .eq('id', id);

    if (error) {
      handleSupabaseError(error, 'Error marking message as unread');
      return false;
    }

    setMessages(messages.map(m => m.id === id ? { ...m, read: false } : m));
    return true;
  };

  const deleteMessage = async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id);

    if (error) {
      handleSupabaseError(error, 'Error deleting message');
      return false;
    }

    setMessages(messages.filter(m => m.id !== id));
    return true;
  };

  // Subscribers
  const loadSubscribers = async () => {
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      handleSupabaseError(error, 'Error loading subscribers');
      return;
    }

    setSubscribers(data);
  };

  const addSubscriber = async (email: string): Promise<boolean> => {
    const normalizedEmail = email.trim().toLowerCase();

    const { data: existing, error: checkError } = await supabase
      .from('subscribers')
      .select('email')
      .eq('email', normalizedEmail)
      .maybeSingle(); 

    if (checkError) {
      console.error('Error checking subscriber:', checkError);
      return false;
    }

    if (existing) {
      return false;
    }

    const newSub: Subscriber = {
      id: Date.now().toString(),
      email: normalizedEmail,
      date: new Date().toISOString()
    };

    const { error: insertError } = await supabase
      .from('subscribers')
      .insert(newSub);

    if (insertError) {
      if (insertError.code === '23505') {
        return false;
      }
      handleSupabaseError(insertError, 'Error adding subscriber');
      return false;
    }

    setSubscribers([newSub, ...subscribers]);
    return true;
  };

  const removeSubscriber = async (email: string): Promise<boolean> => {
    const normalizedEmail = email.trim().toLowerCase();

    const { data: existing, error: checkError } = await supabase
      .from('subscribers')
      .select('email')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking subscriber:', checkError);
      return false;
    }

    if (!existing) {
      return false;
    }

    const { error: deleteError } = await supabase
      .from('subscribers')
      .delete()
      .eq('email', normalizedEmail);

    if (deleteError) {
      handleSupabaseError(deleteError, 'Error removing subscriber');
      return false;
    }

    setSubscribers(subscribers.filter(s => s.email.toLowerCase() !== normalizedEmail));
    return true;
  };

  // Authentication via Supabase
  const login = async (password: string, email: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      handleSupabaseError(error, 'Error authenticating');
      return false;
    }

    // Auth state changes are handled by the listener in useEffect
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    // Auth state changes are handled by the listener in useEffect
  };

  return (
    <DataContext.Provider value={{
      siteConfig, updateSiteConfig,
      blogPosts, addBlogPost, updateBlogPost, deleteBlogPost,
      publications, addPublication, updatePublication, deletePublication,
      newsletters, addNewsletter, updateNewsletter, deleteNewsletter,
      messages, addMessage, markMessageRead, markMessageUnread, deleteMessage,
      subscribers, addSubscriber, removeSubscriber,
      isAuthenticated, login, logout,
      isLoading
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