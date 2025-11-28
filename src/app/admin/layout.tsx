'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, FileText, BookOpen, Settings, LogOut, 
  Menu, X, Mail, Inbox, Users 
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';

// --- Login Component (Internal) ---
const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const { login } = useData();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Calling login with email, password to match DataContext signature
    const success = await login(email, password);
    if (success) {
      router.refresh(); // Refresh to update auth state
      router.push('/admin'); // Redirect to the main admin page (Overview)
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-none shadow-md max-w-sm w-full">
        <h1 className="text-2xl font-serif text-primary mb-6 text-center">Admin Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-none p-2 focus:border-primary focus:outline-none"
              placeholder="admin@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-none p-2 focus:border-primary focus:outline-none"
              placeholder="Enter Admin Password"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">Invalid email or password</p>}
          <button type="submit" className="w-full bg-primary text-white py-2 rounded-none hover:bg-slate-800 transition-colors">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Nav Helper ---
const AdminLink = ({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick?: () => void }) => {
  const pathname = usePathname();
  const isActive = href === '/admin' 
    ? (pathname === '/admin' || pathname === '/admin/') 
    : pathname.startsWith(href);
  
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`flex items-center space-x-3 px-4 py-3 rounded-none transition-colors ${
        isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

// --- Main Layout ---
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout } = useData();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 1. Auth Protection
  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-primary text-white p-4 flex justify-between items-center z-20 shadow-md">
        <div className="font-serif font-bold">Admin Console</div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        w-64 bg-primary text-slate-400 flex flex-col fixed h-full z-10 transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        pt-16 md:pt-0
      `}>
        <div className="p-6 hidden md:block">
          <Link href="/" className="text-white font-serif text-xl font-medium hover:text-accent transition-colors">
            Frankline Chisom
          </Link>
          <div className="text-xs uppercase tracking-widest mt-1 opacity-50">Admin Console</div>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <AdminLink href="/admin" icon={<LayoutDashboard size={18} />} label="Overview" onClick={() => setIsSidebarOpen(false)} />
          {/* Analytics link removed as it's now part of Overview */}
          <AdminLink href="/admin/inbox" icon={<Inbox size={18} />} label="Inbox" onClick={() => setIsSidebarOpen(false)} />
          <AdminLink href="/admin/subscribers" icon={<Users size={18} />} label="Subscribers" onClick={() => setIsSidebarOpen(false)} />
          <AdminLink href="/admin/blog" icon={<FileText size={18} />} label="Articles" onClick={() => setIsSidebarOpen(false)} />
          <AdminLink href="/admin/publications" icon={<BookOpen size={18} />} label="Publications" onClick={() => setIsSidebarOpen(false)} />
          <AdminLink href="/admin/newsletter" icon={<Mail size={18} />} label="Newsletter" onClick={() => setIsSidebarOpen(false)} />
          <AdminLink href="/admin/settings" icon={<Settings size={18} />} label="Profile Settings" onClick={() => setIsSidebarOpen(false)} />
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-2 text-slate-400 hover:text-white transition-colors w-full">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-12 pt-20 md:pt-12 transition-all">
        {children}
      </main>
    </div>
  );
}