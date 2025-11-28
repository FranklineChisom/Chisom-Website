'use client';

import React from 'react';
import { DataProvider } from '@/contexts/DataContext';
import { ToastProvider } from '@/contexts/ToastContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
      <DataProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </DataProvider>
  );
}