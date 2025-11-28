/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search as SearchIcon } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import SearchBar from "@/components/SearchBar";

// Helper for Nav Links
const NavLink: React.FC<{
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}> = ({ href, children, onClick }) => {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`text-sm tracking-wide transition-colors duration-300 ${
        isActive
          ? "text-primary font-semibold"
          : "text-slate-500 hover:text-primary"
      }`}
    >
      {children}
    </Link>
  );
};

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  // Safe data access
  let blogPosts: any = [],
    publications: any = [],
    newsletters: any = [];
  try {
    const data = useData();
    blogPosts = data.blogPosts;
    publications = data.publications;
    newsletters = data.newsletters;
  } catch (e) {
    // Fail silently during initial render or if context missing
  }

  // Scroll Listener
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  // Keyboard shortcut (Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Don't render Navbar on Admin pages
  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/90 backdrop-blur-sm border-b border-slate-100 py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="font-serif text-2xl font-bold text-primary">
            Chisom
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/about">About</NavLink>
            <NavLink href="/research">Research</NavLink>
            <NavLink href="/blog">Blog</NavLink>
            <NavLink href="/contact">Contact</NavLink>

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
            <NavLink href="/">Home</NavLink>
            <NavLink href="/about">About</NavLink>
            <NavLink href="/research">Research</NavLink>
            <NavLink href="/blog">Blog</NavLink>
            <NavLink href="/contact">Contact</NavLink>
          </div>
        )}
      </header>

      {/* Global Search Overlay */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="max-w-3xl mx-auto mt-32 px-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-white p-6 rounded-lg shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-serif text-xl text-primary">Search</h3>
                <button
                  type={"button"}
                  onClick={() => setIsSearchOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={20} /> Close
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
    </>
  );
};

export default Navbar;
