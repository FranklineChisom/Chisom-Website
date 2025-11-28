'use client';

import React, { useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend 
} from 'recharts';

export default function AdminDashboard() {
  const { blogPosts, publications, subscribers, messages, newsletters } = useData();
  const unreadMessages = messages.filter(m => !m.read).length;

  const articleStats = useMemo(() => {
    const published = blogPosts.filter(p => p.published).length;
    return { total: blogPosts.length, published, drafts: blogPosts.length - published };
  }, [blogPosts]);

  const pubStats = useMemo(() => {
    const published = publications.filter(p => p.published).length;
    return { total: publications.length, published, drafts: publications.length - published };
  }, [publications]);

  const newsStats = useMemo(() => {
    const published = newsletters.filter(n => n.published).length;
    return { total: newsletters.length, published, drafts: newsletters.length - published };
  }, [newsletters]);

  const subscriberData = useMemo(() => {
    const timestamps = subscribers
      .map(s => new Date(s.date).getTime())
      .filter(t => !isNaN(t))
      .sort((a, b) => a - b);

    if (timestamps.length === 0) return [{ name: 'No Data', count: 0 }];

    const data = [];
    const now = Date.now();
    let current = new Date(timestamps[0]);
    current.setMonth(current.getMonth() - 1);
    current.setDate(1); 

    while (current.getTime() < now || data.length < 2) {
       const nextMonth = new Date(current);
       nextMonth.setMonth(current.getMonth() + 1);
       const count = timestamps.filter(t => t < nextMonth.getTime()).length;
       data.push({
         name: current.toLocaleString('default', { month: 'short', year: '2-digit' }),
         count: count
       });
       current.setMonth(current.getMonth() + 1);
       if (data.length > 48) break; 
    }
    return data;
  }, [subscribers]);

  const contentStatusData = useMemo(() => {
    return [
      { name: 'Articles', Published: articleStats.published, Drafts: articleStats.drafts },
      { name: 'Publications', Published: pubStats.published, Drafts: pubStats.drafts },
      { name: 'Newsletters', Published: newsStats.published, Drafts: newsStats.drafts },
    ];
  }, [articleStats, pubStats, newsStats]);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-serif text-slate-800">Overview</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {/* Stats Cards */}
        <div className="bg-white p-6 rounded-none shadow-sm border border-slate-100">
          <div className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Articles</div>
          <div className="text-4xl font-bold text-primary">{articleStats.total}</div>
          <div className="text-xs text-slate-500 mt-2 flex gap-2">
             <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{articleStats.published} Live</span>
             <span className="text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">{articleStats.drafts} Drafts</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-none shadow-sm border border-slate-100">
          <div className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Publications</div>
          <div className="text-4xl font-bold text-primary">{pubStats.total}</div>
          <div className="text-xs text-slate-500 mt-2 flex gap-2">
             <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{pubStats.published} Live</span>
             <span className="text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">{pubStats.drafts} Drafts</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-none shadow-sm border border-slate-100">
          <div className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Newsletters</div>
          <div className="text-4xl font-bold text-primary">{newsStats.total}</div>
          <div className="text-xs text-slate-500 mt-2 flex gap-2">
             <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{newsStats.published} Live</span>
             <span className="text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">{newsStats.drafts} Drafts</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-none shadow-sm border border-slate-100">
          <div className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Subscribers</div>
          <div className="text-4xl font-bold text-primary">{subscribers.length}</div>
        </div>
        <div className="bg-white p-6 rounded-none shadow-sm border border-slate-100">
          <div className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Inbox</div>
             <div className="text-4xl font-bold text-primary">{messages.length}</div>
             <div className="text-xs text-slate-500 mt-2 flex gap-2">
              {unreadMessages > 0 && <span className="text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">{unreadMessages} Unread</span>}
            </div>
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
            {blogPosts.length + publications.length + newsletters.length > 0 ? (
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
    </div>
  );
}