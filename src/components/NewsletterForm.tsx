'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

const NewsletterForm: React.FC = () => {
  const { addSubscriber } = useData();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');

    const success = await addSubscriber(email);
    
    // Add a small delay for better UX
    setTimeout(() => {
        if (success) {
            setStatus('success');
        } else {
            setStatus('error');
        }
    }, 500);
  };

  if (status === 'success') {
    return (
       <div className="bg-white/10 border border-white/20 p-6 rounded-none text-center animate-in fade-in">
           <CheckCircle className="mx-auto text-accent mb-3" size={32} />
           <h4 className="font-bold text-lg mb-1">You&apos;re Subscribed!</h4>
           <p className="text-slate-300 text-sm mb-4">Thank you for joining. Keep an eye on your inbox.</p>
           <Link href={`/unsubscribe?email=${encodeURIComponent(email)}`} className="text-xs text-slate-400 hover:text-white underline">
             Mistake? Unsubscribe here.
           </Link>
       </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="bg-white/10 border border-white/20 p-6 rounded-none text-center animate-in fade-in">
           <AlertCircle className="mx-auto text-yellow-500 mb-3" size={32} />
           <h4 className="font-bold text-lg mb-1">Already Subscribed</h4>
           <p className="text-slate-300 text-sm mb-4">The email <span className="font-semibold text-white">{email}</span> is already on the list.</p>
           <div className="flex gap-4 justify-center text-xs">
             <button onClick={() => setStatus('idle')} className="text-accent hover:underline">Try another email</button>
             <span className="text-slate-500">|</span>
             <Link href={`/unsubscribe?email=${encodeURIComponent(email)}`} className="text-slate-400 hover:text-white underline">
               Unsubscribe
             </Link>
           </div>
       </div>
    );
  }

  if (status === 'loading') {
    return (
        <div className="bg-white/10 border border-white/20 p-6 rounded-none text-center">
               <Loader2 className="animate-spin mx-auto mb-3 text-white" size={24} />
            <p className="text-slate-300">Checking subscription status...</p>
        </div>
    );
  }

  return (
    <>
        <form className="flex flex-col sm:flex-row gap-4" onSubmit={handleSubscribe}>
        <input 
            type="email" 
            placeholder="your@email.com" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-accent w-full rounded-none"
        />
        <button type="submit" className="bg-accent text-primary font-bold px-8 py-3 hover:bg-white transition-colors rounded-none">
            Subscribe
        </button>
        </form>
        <p className="text-xs text-slate-500 mt-4">No spam. <Link href="/unsubscribe" className="underline hover:text-slate-300">Unsubscribe anytime</Link>.</p>
    </>
  );
};

export default NewsletterForm;