'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useData } from '@/contexts/DataContext';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const UnsubscribeContent: React.FC = () => {
  const searchParams = useSearchParams();
  const { removeSubscriber } = useData();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'not-found' | 'loading'>('idle');

  useEffect(() => {
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

  if (status === 'success') {
    return (
       <div className="text-center py-6">
          <CheckCircle className="mx-auto text-green-600 mb-4" size={48} />
          <h3 className="text-xl font-bold text-slate-800 mb-2">Unsubscribed Successfully</h3>
          <p className="text-slate-600 mb-6">
            <span className="font-semibold">{email}</span> has been removed from our mailing list.
          </p>
          <p className="text-sm text-slate-500 mb-6">
            We&apos;re sorry to see you go. You won&apos;t receive any more newsletters from us.
          </p>
          <Link href="/" className="text-primary font-medium hover:underline">Return to Home</Link>
       </div>
    );
  }

  if (status === 'not-found') {
    return (
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
    );
  }

  if (status === 'loading') {
    return (
       <div className="text-center py-6">
          <Loader2 className="animate-spin mx-auto text-primary mb-4" size={48} />
          <p className="text-slate-500">Processing your request...</p>
       </div>
    );
  }

  return (
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
  );
};

export default UnsubscribeContent;