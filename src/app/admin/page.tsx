'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { useData } from '@/contexts/DataContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { supabase } from '@/lib/supabase';
import { Activity, FileText, Globe, ExternalLink, Save, Loader2, Mail } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

const COLORS = ['#0f2f38', '#d4af37', '#64748b', '#94a3b8', '#cbd5e1'];

export default function AdminDashboard() {
  usePageTitle('Analytics - Admin');
  const { siteConfig, updateSiteConfig } = useData();
  const { showToast } = useToast();
  
  // State for dashboard metrics
  const [isLoading, setIsLoading] = useState(true);
  const [counts, setCounts] = useState({
    articles: { total: 0, published: 0, drafts: 0 },
    publications: { total: 0, published: 0, drafts: 0 },
    newsletters: { total: 0, published: 0, drafts: 0 },
    subscribers: 0,
    messages: { total: 0, unread: 0 }
  });
  
  // State for chart data
  const [subscriberData, setSubscriberData] = useState<any[]>([]);
  const [productivityData, setProductivityData] = useState<any[]>([]);
  const [categoryRadarData, setCategoryRadarData] = useState<any[]>([]);
  const [publishingDayData, setPublishingDayData] = useState<any[]>([]);

  // External Dashboard State
  const [dashboardUrl, setDashboardUrl] = useState('');
  const [isEditingUrl, setIsEditingUrl] = useState(false);

  useEffect(() => {
    if (siteConfig.analyticsUrl) {
        setDashboardUrl(siteConfig.analyticsUrl);
    }
  }, [siteConfig.analyticsUrl]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Counts (Optimized: HEAD requests only where possible)
      const [
        { count: totalPosts }, { count: pubPosts },
        { count: totalPubs }, { count: pubPubs },
        { count: totalNews }, { count: pubNews },
        { count: totalSubs },
        { count: totalMsgs }, { count: unreadMsgs }
      ] = await Promise.all([
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('published', true),
        supabase.from('publications').select('*', { count: 'exact', head: true }),
        supabase.from('publications').select('*', { count: 'exact', head: true }).eq('published', true),
        supabase.from('newsletters').select('*', { count: 'exact', head: true }),
        supabase.from('newsletters').select('*', { count: 'exact', head: true }).eq('published', true),
        supabase.from('subscribers').select('*', { count: 'exact', head: true }),
        supabase.from('messages').select('*', { count: 'exact', head: true }),
        supabase.from('messages').select('*', { count: 'exact', head: true }).eq('read', false),
      ]);

      setCounts({
        articles: { total: totalPosts || 0, published: pubPosts || 0, drafts: (totalPosts || 0) - (pubPosts || 0) },
        publications: { total: totalPubs || 0, published: pubPubs || 0, drafts: (totalPubs || 0) - (pubPubs || 0) },
        newsletters: { total: totalNews || 0, published: pubNews || 0, drafts: (totalNews || 0) - (pubNews || 0) },
        subscribers: totalSubs || 0,
        messages: { total: totalMsgs || 0, unread: unreadMsgs || 0 }
      });

      // 2. Fetch Lightweight Data for Charts (Select only specific columns)
      
      // Subscriber Growth (Date only)
      const { data: subDates } = await supabase.from('subscribers').select('date').order('date', { ascending: true });
      
      // Productivity & Categories (Date, Content-length, Category)
      // Note: We fetch content length if possible, or full content if function not available. 
      // Optimizing by fetching content is expensive, but necessary for "Word Count" unless we store word_count in DB.
      // Assuming we must fetch content:
      const { data: postMeta } = await supabase.from('blog_posts').select('date, content, category');
      const { data: newsletterMeta } = await supabase.from('newsletters').select('date, content');
      const { data: pubMeta } = await supabase.from('publications').select('year');

      // --- Process Subscriber Data ---
      if (subDates && subDates.length > 0) {
        const subChartData = processSubscriberGrowth(subDates);
        setSubscriberData(subChartData);
      } else {
        setSubscriberData([{ name: 'No Data', count: 0 }]);
      }

      // --- Process Productivity (Word Count) ---
      const allContent = [
        ...(postMeta || []).map(p => ({ date: new Date(p.date), words: p.content?.split(/\s+/).length || 0 })),
        ...(newsletterMeta || []).map(n => ({ date: new Date(n.date), words: n.content?.split(/\s+/).length || 0 }))
      ].sort((a, b) => a.date.getTime() - b.date.getTime());

      const monthlyWords: Record<string, number> = {};
      let cumulative = 0;
      allContent.forEach(item => {
        if (isNaN(item.date.getTime())) return;
        const key = item.date.toLocaleString('default', { month: 'short', year: '2-digit' });
        cumulative += item.words;
        monthlyWords[key] = cumulative;
      });
      setProductivityData(Object.entries(monthlyWords).map(([name, words]) => ({ name, words })));

      // --- Process Categories ---
      const catCounts: Record<string, number> = {};
      (postMeta || []).forEach(p => {
        const cat = p.category || 'Uncategorized';
        catCounts[cat] = (catCounts[cat] || 0) + 1;
      });
      setCategoryRadarData(Object.entries(catCounts).map(([subject, A]) => ({ subject, A, fullMark: 10 })));

      // --- Process Publishing Days ---
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayCounts = new Array(7).fill(0);
      [...(postMeta || []), ...(newsletterMeta || [])].forEach(item => {
         const d = new Date(item.date);
         if(!isNaN(d.getTime())) dayCounts[d.getDay()]++;
      });
      // For pubs, year only usually doesn't give day, skipping pubs for day chart or assume Jan 1
      setPublishingDayData(days.map((day, index) => ({ name: day, posts: dayCounts[index] })));

    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      showToast("Failed to load dashboard statistics", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const processSubscriberGrowth = (data: any[]) => {
      const timestamps = data.map(s => new Date(s.date).getTime()).filter(t => !isNaN(t));
      if (timestamps.length === 0) return [];
      
      const chart = [];
      const now = Date.now();
      let current = new Date(timestamps[0]);
      current.setMonth(current.getMonth() - 1);
      current.setDate(1); 

      while (current.getTime() < now || chart.length < 2) {
         const nextMonth = new Date(current);
         nextMonth.setMonth(current.getMonth() + 1);
         const count = timestamps.filter(t => t < nextMonth.getTime()).length;
         chart.push({
           name: current.toLocaleString('default', { month: 'short', year: '2-digit' }),
           count: count
         });
         current.setMonth(current.getMonth() + 1);
         if (chart.length > 48) break; 
      }
      return chart;
  };

  const handleSaveUrl = async () => {
    const success = await updateSiteConfig({
        ...siteConfig,
        analyticsUrl: dashboardUrl
    });

    if (success) {
        setIsEditingUrl(false);
        showToast('Dashboard URL saved to database!', 'success');
    } else {
        showToast('Failed to save URL', 'error');
    }
  };

  // Memoize Content Mix for Chart
  const contentMixData = useMemo(() => [
    { name: 'Articles', value: counts.articles.total },
    { name: 'Publications', value: counts.publications.total },
    { name: 'Newsletters', value: counts.newsletters.total }
  ], [counts]);

  const contentStatusData = [
      { name: 'Articles', Published: counts.articles.published, Drafts: counts.articles.drafts },
      { name: 'Publications', Published: counts.publications.published, Drafts: counts.publications.drafts },
      { name: 'Newsletters', Published: counts.newsletters.published, Drafts: counts.newsletters.drafts },
  ];

  if (isLoading) {
      return (
          <div className="h-[60vh] flex items-center justify-center">
              <div className="text-center text-slate-400">
                  <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" />
                  <p>Loading analytics...</p>
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <h2 className="text-3xl font-serif text-slate-800">Overview</h2>
        <div className="text-sm text-slate-500 font-mono">
            Total Words Written: <span className="text-primary font-bold">{productivityData.length > 0 ? productivityData[productivityData.length - 1].words.toLocaleString() : 0}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {/* Messages Card - Modified to show Unread as primary metric */}
        <div className="bg-white p-6 rounded-none shadow-sm border border-slate-100 relative group overflow-hidden">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          </div>
          <div className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Unread Messages</div>
          <div className="text-4xl font-bold text-primary">{counts.messages.unread}</div>
          <div className="text-xs text-slate-500 mt-2 flex gap-2 items-center">
             <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{counts.messages.total} Total Messages</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="bg-white p-6 rounded-none shadow-sm border border-slate-100">
          <div className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Articles</div>
          <div className="text-4xl font-bold text-primary">{counts.articles.total}</div>
          <div className="text-xs text-slate-500 mt-2 flex gap-2">
             <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{counts.articles.published} Live</span>
             <span className="text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">{counts.articles.drafts} Drafts</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-none shadow-sm border border-slate-100">
          <div className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Publications</div>
          <div className="text-4xl font-bold text-primary">{counts.publications.total}</div>
          <div className="text-xs text-slate-500 mt-2 flex gap-2">
             <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{counts.publications.published} Live</span>
             <span className="text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">{counts.publications.drafts} Drafts</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-none shadow-sm border border-slate-100">
          <div className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Newsletters</div>
          <div className="text-4xl font-bold text-primary">{counts.newsletters.total}</div>
          <div className="text-xs text-slate-500 mt-2 flex gap-2">
             <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{counts.newsletters.published} Live</span>
             <span className="text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">{counts.newsletters.drafts} Drafts</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-none shadow-sm border border-slate-100">
          <div className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Subscribers</div>
          <div className="text-4xl font-bold text-primary">{counts.subscribers}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-none shadow-sm border border-slate-100 min-h-[300px]">
          <h3 className="font-serif text-lg text-primary mb-6">Subscriber Growth</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={subscriberData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f2f38" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0f2f38" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Area type="monotone" dataKey="count" stroke="#0f2f38" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-none shadow-sm border border-slate-100 min-h-[300px]">
          <h3 className="font-serif text-lg text-primary mb-6">Content Status</h3>
          <div className="h-64 w-full flex items-center justify-center">
            {counts.articles.total + counts.publications.total + counts.newsletters.total > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contentStatusData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  <Legend />
                  <Bar dataKey="Published" stackId="a" fill="#0f2f38" barSize={40} />
                  <Bar dataKey="Drafts" stackId="a" fill="#d4af37" barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 italic">Add content to see stats</p>
            )}
          </div>
        </div>
      </div>

      {/* --- SECTION 1: CONTENT STRATEGY --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Radar: Topic Balance */}
        <div className="bg-white p-6 rounded-none shadow-sm border border-slate-100 flex flex-col">
            <h3 className="font-serif text-lg text-primary mb-4 flex items-center gap-2">
                <Activity size={18} /> Topic Balance
            </h3>
            <div className="flex-1 min-h-[250px]">
                {categoryRadarData.length > 2 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={categoryRadarData}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                            <Radar name="Categories" dataKey="A" stroke="#d4af37" fill="#d4af37" fillOpacity={0.6} />
                            <Tooltip />
                        </RadarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">
                        Need at least 3 categories for Radar chart
                    </div>
                )}
            </div>
        </div>

        {/* Bar: Publishing Schedule */}
        <div className="bg-white p-6 rounded-none shadow-sm border border-slate-100 flex flex-col">
            <h3 className="font-serif text-lg text-primary mb-4 flex items-center gap-2">
                <FileText size={18} /> Publishing Habits
            </h3>
            <div className="flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={publishingDayData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', fontSize: '12px' }}
                            cursor={{ fill: '#f8fafc' }}
                        />
                        <Bar dataKey="posts" fill="#0f2f38" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Pie: Content Mix */}
        <div className="bg-white p-6 rounded-none shadow-sm border border-slate-100 flex flex-col">
            <h3 className="font-serif text-lg text-primary mb-4">Content Mix</h3>
            <div className="flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={contentMixData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {contentMixData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* --- SECTION 2: PRODUCTIVITY --- */}
      <div className="bg-white p-6 rounded-none shadow-sm border border-slate-100">
        <h3 className="font-serif text-lg text-primary mb-6">Cumulative Writing Volume (Words)</h3>
        <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={productivityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorWords" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0f2f38" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#0f2f38" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="words" stroke="#0f2f38" fillOpacity={1} fill="url(#colorWords)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* --- SECTION 3: EXTERNAL INTEGRATION --- */}
      <div className="bg-slate-50 p-8 border border-slate-200 rounded-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
                <h3 className="font-serif text-2xl text-primary flex items-center gap-2">
                    <Globe size={24} className="text-accent" /> 
                    Web Analytics Integration
                </h3>
                <p className="text-slate-500 text-sm mt-1 max-w-xl">
                    Embed a public dashboard from Google Analytics, Looker Studio, Plausible, or Vercel Analytics here.
                </p>
            </div>
            <button 
                onClick={() => setIsEditingUrl(!isEditingUrl)}
                className="text-sm text-primary hover:underline flex items-center gap-1"
            >
                {isEditingUrl ? 'Cancel' : 'Configure URL'}
            </button>
        </div>

        {isEditingUrl && (
            <div className="bg-white p-4 mb-6 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Dashboard Embed URL</label>
                <div className="flex gap-2">
                    <input 
                        type="url" 
                        value={dashboardUrl}
                        onChange={(e) => setDashboardUrl(e.target.value)}
                        placeholder="https://lookerstudio.google.com/embed/reporting/..."
                        className="flex-1 border border-slate-200 p-2 text-sm focus:outline-none focus:border-primary"
                    />
                    <button 
                        onClick={handleSaveUrl}
                        className="bg-primary text-white px-4 py-2 text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
                    >
                        <Save size={14} /> Save
                    </button>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                    Note: Ensure the URL allows embedding (X-Frame-Options). Google Looker Studio works best.
                </p>
            </div>
        )}

        <div className="w-full aspect-video bg-white border border-slate-200 rounded-sm overflow-hidden relative">
            {siteConfig.analyticsUrl ? (
                <iframe 
                    src={siteConfig.analyticsUrl} 
                    className="w-full h-full border-0"
                    title="External Analytics"
                    loading="lazy"
                    allowFullScreen
                />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-100/50">
                    <ExternalLink size={48} className="mb-4 opacity-20" />
                    <p className="font-medium">No Dashboard Configured</p>
                    <button 
                        onClick={() => setIsEditingUrl(true)} 
                        className="mt-4 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm hover:border-primary hover:text-primary transition-colors"
                    >
                        Connect Google Analytics / Looker
                    </button>
                </div>
            )}
        </div>
      </div>

    </div>
  );
};