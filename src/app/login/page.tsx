'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '@/contexts/DataContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useData();
  const router = useRouter();

  // Redirect if already authenticated (Client-side check)
  useEffect(() => {
    document.title = 'Admin Login | Frankline Chisom Ebere';
    
    // Check local state or cookie presence
    const hasSession = document.cookie.includes('admin_session=true');
    if (isAuthenticated || hasSession) {
        router.replace('/admin');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);
    
    try {
      const success = await login(email, password);
      if (success) {
        // Force a hard navigation to ensure middleware and server state sync up
        // Using window.location.href instead of router.push ensures a full page load
        // which triggers middleware and clears client-side cache issues.
        window.location.href = '/admin';
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Login error", err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // If already authenticated, show nothing or a loader while redirecting
  if (isAuthenticated) {
    return null; 
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-slate-50">
      <div className="bg-white p-8 rounded-none shadow-md max-w-sm w-full border border-slate-100">
        <h1 className="text-2xl font-serif text-primary mb-6 text-center">Admin Console</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-none p-3 focus:border-primary focus:outline-none transition-colors"
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
              className="w-full border border-slate-200 rounded-none p-3 focus:border-primary focus:outline-none transition-colors"
              placeholder="Enter Password"
              required
            />
          </div>
          {error && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded-sm border border-red-100">
              Invalid credentials. Please check your admin access.
            </div>
          )}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-primary text-white py-3 rounded-none hover:bg-slate-800 transition-colors disabled:opacity-70 font-medium"
          >
            {isLoading ? 'Authenticating...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}