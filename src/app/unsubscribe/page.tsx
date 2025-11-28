'use client'; // Added Directive

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; // Changed from react-router-dom
import Link from 'next/link'; // Changed from react-router-dom
import { useData } from '@/contexts/DataContext';
import Section from '@/components/Section';
import { CheckCircle, AlertCircle } from 'lucide-react';

const Unsubscribe: React.FC = () => {
  const searchParams = useSearchParams(); // Uses Next.js hook
  const { removeSubscriber } = useData();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'not-found' | 'loading'>('idle');

  useEffect(() => {
    // Basic Title Setting (Alternative to metadata for Client Comps)
    document.title = 'Unsubscribe | Frankline Chisom Ebere';
    
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!email) return;

    setStatus('loading');

    const success = await removeSubscriber(email);
    
    setTimeout(() => {
      if (success) {
        setStatus('success');
      } else {
        setStatus('not-found');
      }
    }, 500);
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-24 min-h-[60vh] flex flex-col justify-center">
      <Section>
        <div className="text-center mb-12">
           <h1 className="font-serif text-3xl text-primary mb-4">Newsletter Preferences</h1>
           <p className="text-slate-600">Manage your subscription status.</p>
        </div>

        <div className="bg-slate-50 p-8 rounded-sm shadow-sm border border-slate-100">
          {status === 'success' ? (
             <div className="text-center py-6">
                <CheckCircle className="mx-auto text-green-600 mb-4" size={48} />
                <h3 className="text-xl font-bold text-slate-800 mb-2">Unsubscribed Successfully</h3>
                <p className="text-slate-600 mb-6">
                  <span className="font-semibold">{email}</span> has been removed from our mailing list.
                </p>
                <p className="text-sm text-slate-500 mb-6">
                  We're sorry to see you go. You won't receive any more newsletters from us.
                </p>
                <Link href="/" className="text-primary font-medium hover:underline">Return to Home</Link>
             </div>
          ) : status === 'not-found' ? (
             <div className="text-center py-6">
                <AlertCircle className="mx-auto text-yellow-500 mb-4" size={48} />
                <h3 className="text-xl font-bold text-slate-800 mb-2">Email Not Found</h3>
                <p className="text-slate-600 mb-6">
                  We could not find <span className="font-semibold">{email}</span> in our subscriber list.
                </p>
                <p className="text-sm text-slate-500 mb-6">
                  This email address may have already been unsubscribed or was never subscribed to our newsletter.
                </p>
                <button 
                  onClick={() => setStatus('idle')} 
                  className="text-primary font-medium hover:underline mb-4 block mx-auto"
                >
                  Try a different email
                </button>
                <Link href="/" className="text-slate-400 text-sm hover:text-slate-600">Return to Home</Link>
             </div>
          ) : status === 'loading' ? (
             <div className="text-center py-6">
                <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500">Processing your request...</p>
             </div>
          ) : (
            <form onSubmit={handleUnsubscribe} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Confirm Email Address
                </label>
                <input 
                  type="email" 
                  id="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-200 px-4 py-3 focus:outline-none focus:border-primary transition-colors text-slate-800"
                  placeholder="name@example.com"
                  required
                />
                <p className="text-xs text-slate-500 mt-2">
                  Enter the email address you want to unsubscribe from our newsletter.
                </p>
              </div>
              <button 
                type="submit" 
                className="w-full bg-slate-800 text-white font-medium py-3 hover:bg-red-600 transition-colors"
              >
                Unsubscribe
              </button>
              <div className="text-center mt-4">
                 <Link href="/" className="text-sm text-slate-400 hover:text-slate-600">Cancel and return home</Link>
              </div>
            </form>
          )}
        </div>
      </Section>
    </div>
  );
};

export default Unsubscribe;