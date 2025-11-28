import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Lock, Search as SearchIcon } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import SearchBar from './SearchBar';

const NavLink: React.FC<{ to: string; children: React.ReactNode; onClick?: () => void }> = ({ to, children, onClick }) => {
  const location = useLocation();
  const isActive = to === "/" 
    ? location.pathname === "/"
    : location.pathname.startsWith(to);
  
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`text-sm tracking-wide transition-colors duration-300 ${
        isActive ? 'text-primary font-semibold' : 'text-slate-500 hover:text-primary'
      }`}
    >
      {children}
    </Link>
  );
};

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

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  
  let siteConfig, blogPosts, publications, newsletters;
  try {
    const data = useData();
    siteConfig = data.siteConfig;
    blogPosts = data.blogPosts;
    publications = data.publications;
    newsletters = data.newsletters;
  } catch (e) {
    siteConfig = { name: 'Frankline Chisom Ebere', role: '', social: { linkedin: '#', twitter: '#', facebook: '#', instagram: '#', scholar: '#', ssrn: '#'}, email: '' };
    blogPosts = [];
    publications = [];
    newsletters = [];
  }

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location]);

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (location.pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/90 backdrop-blur-sm border-b border-slate-100 py-4' : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <Link to="/" className="font-serif text-2xl font-bold text-primary ">
            Chisom
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/research">Research</NavLink>
            <NavLink to="/blog">Blog</NavLink>
            <NavLink to="/contact">Contact</NavLink>
            
            {/* Search Icon */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-slate-500 hover:text-primary transition-colors p-2"
              aria-label="Search"
              title="Search (Cmd+K)"
            >
              <SearchIcon size={20} />
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-primary"
              aria-label="Search"
            >
              <SearchIcon size={20} />
            </button>
            <button 
              className="text-primary"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-100 p-6 flex flex-col space-y-4 md:hidden shadow-lg animate-in slide-in-from-top-2">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/research">Research</NavLink>
            <NavLink to="/blog">Blog</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </div>
        )}

        {/* Global Search Overlay */}
        {isSearchOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setIsSearchOpen(false)}
          >
            <div 
              className="max-w-3xl mx-auto mt-32 px-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white p-6 rounded-lg shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-serif text-xl text-primary">Search</h3>
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X size={20} />
                  </button>
                </div>
                <SearchBar 
                  blogPosts={blogPosts}
                  publications={publications}
                  newsletters={newsletters}
                  placeholder="Search articles, publications, and newsletters..."
                />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-24 md:pt-32 pb-20">
        {children}
      </main>

      {/* Footer */}
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
              <Link to="/about" className="text-slate-500 hover:text-primary text-sm transition-colors">About Me</Link>
              <Link to="/research" className="text-slate-500 hover:text-primary text-sm transition-colors">Research & Publications</Link>
              <Link to="/blog" className="text-slate-500 hover:text-primary text-sm transition-colors">Blog</Link>
            </div>
          </div>
          <div className="col-span-1">
            <h5 className="font-sans font-semibold text-primary mb-4 text-sm uppercase tracking-wider">Connect</h5>
            <div className="flex flex-wrap gap-2 mb-8">
              <SocialIcon href={`mailto:${siteConfig.email}`}>
                <img src="../images/email.png" width="18" height="18" alt="Email"/>
              </SocialIcon>
              <SocialIcon href={siteConfig.social.linkedin}>
                <img src="../images/linkedin.png" width="23" height="23" alt="LinkedIn"/>
              </SocialIcon>
              <SocialIcon href={siteConfig.social.scholar}>
                <img src="../images/googlescholar.png" width="18" height="18" alt="Google Scholar"/>
              </SocialIcon>
              {siteConfig.social.ssrn && (
                <SocialIcon href={siteConfig.social.ssrn}>
                  <img src="../images/ssrn_icon.png" width="32" height="32" alt="SSRN"/>
                </SocialIcon>
              )}
            </div>
            <div className="flex justify-between items-center border-t border-slate-200 pt-6">
              <p className="text-slate-400 text-xs">
                &copy; {new Date().getFullYear()} {siteConfig.name}.
              </p>
              <Link to="/admin" className="text-slate-300 hover:text-primary transition-colors opacity-50 hover:opacity-100" aria-label="Admin Login">
                <Lock size={14} />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;