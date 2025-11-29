'use client';

import React, { Suspense } from 'react';
import Section from '@/components/Section';
import { Loader2 } from 'lucide-react';
import UnsubscribeContent from '@/components/UnsubscribeContent';

const UnsubscribePage: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto px-6 py-24 min-h-[60vh] flex flex-col justify-center">
      <Section>
        <div className="text-center mb-12">
           <h1 className="font-serif text-3xl text-primary mb-4">Newsletter Preferences</h1>
           <p className="text-slate-600">Manage your subscription status.</p>
        </div>

        <div className="bg-slate-50 p-8 rounded-sm shadow-sm border border-slate-100">
          <Suspense fallback={
            <div className="text-center py-10">
              <Loader2 className="animate-spin mx-auto text-primary mb-4" size={32} />
              <p className="text-slate-500">Loading...</p>
            </div>
          }>
            <UnsubscribeContent />
          </Suspense>
        </div>
      </Section>
    </div>
  );
};

export default UnsubscribePage;