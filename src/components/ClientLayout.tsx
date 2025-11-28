'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ClientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  
  // Check if we are on an admin route
  // We use optional chaining in case pathname is null during initial render
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    // For admin pages, render children directly without the public site shell
    // This allows the AdminLayout to take full control of the screen
    return <>{children}</>;
  }

  // For public pages, render the standard website layout
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 md:pt-32 pb-20">
        {children}
      </main>
      <Footer />
    </>
  );
};

export default ClientLayout;