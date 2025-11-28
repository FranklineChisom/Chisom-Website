'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lock } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

const SocialIcon: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="w-10 h-10 bg-primary text-white flex items-center justify-center hover:bg-slate-800 transition-all duration-300 rounded-none"
  >
    {children}
  </a>
);

const Footer: React.FC = () => {
  const pathname = usePathname();
  const { siteConfig } = useData();

  // Don't render Footer on Admin pages
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="bg-slate-50 border-t border-slate-100 py-16">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="col-span-1">
          <h4 className="font-serif text-lg font-bold text-primary mb-4">{siteConfig.name}</h4>
          <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-4">
            {siteConfig.role}
          </p>
          <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
            {siteConfig.tagline}
          </p>
        </div>
        <div className="col-span-1">
          <h5 className="font-sans font-semibold text-primary mb-4 text-sm uppercase tracking-wider">Navigation</h5>
          <div className="flex flex-col space-y-3">
            <Link href="/about" className="text-slate-500 hover:text-primary text-sm transition-colors">About Me</Link>
            <Link href="/research" className="text-slate-500 hover:text-primary text-sm transition-colors">Research & Publications</Link>
            <Link href="/blog" className="text-slate-500 hover:text-primary text-sm transition-colors">Blog</Link>
          </div>
        </div>
        <div className="col-span-1">
          <h5 className="font-sans font-semibold text-primary mb-4 text-sm uppercase tracking-wider">Connect</h5>
          <div className="flex flex-wrap gap-2 mb-8">
            <SocialIcon href={`mailto:${siteConfig.email}`}>
              <img src="/images/email.png" width="18" height="18" alt="Email"/>
            </SocialIcon>
            <SocialIcon href={siteConfig.social.linkedin}>
              <img src="/images/linkedin.png" width="23" height="23" alt="LinkedIn"/>
            </SocialIcon>
            <SocialIcon href={siteConfig.social.scholar}>
              <img src="/images/googlescholar.png" width="18" height="18" alt="Google Scholar"/>
            </SocialIcon>
            {siteConfig.social.ssrn && (
              <SocialIcon href={siteConfig.social.ssrn}>
                <img src="/images/ssrn_icon.png" width="32" height="32" alt="SSRN"/>
              </SocialIcon>
            )}
          </div>
          <div className="flex justify-between items-center border-t border-slate-200 pt-6">
            <p className="text-slate-400 text-xs">
              &copy; {new Date().getFullYear()} {siteConfig.name}.
            </p>
            <Link href="/admin" className="text-slate-300 hover:text-primary transition-colors opacity-50 hover:opacity-100" aria-label="Admin Login">
              <Lock size={14} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;