import React, { useState, useMemo, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Cell, PieChart, Pie, Legend
} from 'recharts';
import { useData } from '../../contexts/DataContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Save, Globe, Activity, FileText, ExternalLink } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

// --- HELPER METRICS ---

const COLORS = ['#0f2f38', '#d4af37', '#64748b', '#94a3b8', '#cbd5e1'];

const Analytics: React.FC = () => {
  usePageTitle('Analytics - Admin');
  const { blogPosts, publications, newsletters, siteConfig, updateSiteConfig } = useData();
  const { showToast } = useToast();
  
  // External Dashboard State
  const [dashboardUrl, setDashboardUrl] = useState('');
  const [isEditingUrl, setIsEditingUrl] = useState(false);

  // Initialize from DB (Supabase)
  useEffect(() => {
    if (siteConfig.analyticsUrl) {
        setDashboardUrl(siteConfig.analyticsUrl);
    }
  }, [siteConfig.analyticsUrl]);

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

  // --- DATA PROCESSING ---

  // 1. Words Written Over Time (Area Chart)
  const productivityData = useMemo(() => {
    const allContent = [
      ...blogPosts.map(p => ({ date: new Date(p.date), words: p.content.split(/\s+/).length, type: 'Article' })),
      ...newsletters.map(n => ({ date: new Date(n.date), words: n.content.split(/\s+/).length, type: 'Newsletter' }))
    ].sort((a, b) => a.date.getTime() - b.date.getTime());

    const monthlyData: Record<string, number> = {};
    let cumulative = 0;

    allContent.forEach(item => {
      if (isNaN(item.date.getTime())) return;
      const key = item.date.toLocaleString('default', { month: 'short', year: '2-digit' });
      cumulative += item.words;
      monthlyData[key] = cumulative;
    });

    return Object.entries(monthlyData).map(([name, words]) => ({ name, words }));
  }, [blogPosts, newsletters]);

  // 2. Category Distribution (Radar Chart)
  const categoryRadarData = useMemo(() => {
    const counts: Record<string, number> = {};
    blogPosts.forEach(post => {
      const cat = post.category || 'Uncategorized';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    
    // Normalize for Radar (cap at max to keep shape nice)
    return Object.entries(counts).map(([subject, A]) => ({ subject, A, fullMark: 10 }));
  }, [blogPosts]);

  // 3. Publishing Day of Week (Bar Chart)
  const publishingDayData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = new Array(7).fill(0);

    [...blogPosts, ...newsletters, ...publications].forEach(item => {
        // @ts-ignore
        const dateStr = item.date || (item.year ? `${item.year}-01-01` : null);
        if (!dateStr) return;
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            counts[date.getDay()]++;
        }
    });

    return days.map((day, index) => ({ name: day, posts: counts[index] }));
  }, [blogPosts, newsletters, publications]);

  // 4. Content Mix (Pie Chart)
  const contentMixData = useMemo(() => [
    { name: 'Articles', value: blogPosts.length },
    { name: 'Publications', value: publications.length },
    { name: 'Newsletters', value: newsletters.length }
  ], [blogPosts, publications, newsletters]);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <h2 className="text-3xl font-serif text-slate-800">Analytics & Insights</h2>
        <div className="text-sm text-slate-500 font-mono">
            Total Words Written: <span className="text-primary font-bold">{productivityData.length > 0 ? productivityData[productivityData.length - 1].words.toLocaleString() : 0}</span>
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

export default Analytics;