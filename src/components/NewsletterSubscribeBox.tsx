'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, AlertCircle } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

const NewsletterSubscribeBox: React.FC = () => {
  const { addSubscriber } = useData();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscribe = async () => {
    if(!email) return;
    setStatus('loading');
    const success = await addSubscriber(email);
    setTimeout(() => {
        if(success) setStatus('success');
        else setStatus('error');
    }, 500);
  };

  return (
    <div className="flex flex-col gap-4">
    {status === 'success' ? (
            <div>
            <div className="flex items-center gap-2 text-primary font-medium w-full py-2">
                <Check size={20} /> Thanks for subscribing!
            </div>
            <Link href={`/unsubscribe?email=${encodeURIComponent(email)}`} className="text-xs text-slate-400 hover:text-primary underline ml-7">
                    Mistake? Unsubscribe here.
            </Link>
            </div>
    ): status === 'loading' ? (
        <div className="flex items-center gap-2 text-slate-500 py-2">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            Checking subscription...
        </div>
    ) : status === 'error' ? (
            <div>
                <div className="flex items-center gap-2 text-yellow-600 font-medium w-full py-2">
                <AlertCircle size={20} /> You are already subscribed.
                </div>
                <div className="flex gap-4 ml-7 text-xs">
                    <button onClick={() => setStatus('idle')} className="text-primary hover:underline">Try another email</button>
                    <Link href={`/unsubscribe?email=${encodeURIComponent(email)}`} className="text-slate-400 hover:text-primary underline">
                    Unsubscribe
                    </Link>
                </div>
            </div>
    ) : (
        <div className="flex gap-2">
            <input 
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="px-4 py-2 border border-slate-200 focus:outline-none focus:border-primary w-full md:w-64 bg-white" 
                />
            <button onClick={handleSubscribe} className="bg-primary text-white px-6 py-2 font-medium hover:bg-slate-800 transition-colors">Join</button>
        </div>
    )}
    </div>
  );
};

export default NewsletterSubscribeBox;