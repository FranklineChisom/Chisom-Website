"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { BlogPost, Publication, Newsletter } from "../types";
import Link from "next/link";

interface SearchResult {
  type: "blog" | "publication" | "newsletter";
  item: BlogPost | Publication | Newsletter;
  score: number;
}

interface SearchBarProps {
  blogPosts?: BlogPost[];
  publications?: Publication[];
  newsletters?: Newsletter[];
  placeholder?: string;
  scope?: "all" | "blog" | "publication" | "newsletter";
}

const SearchBar: React.FC<SearchBarProps> = ({
  blogPosts = [],
  publications = [],
  newsletters = [],
  placeholder = "Search...",
  scope = "all"
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const performSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search Blog Posts
    if (scope === "all" || scope === "blog") {
      blogPosts.forEach(post => {
        let score = 0;
        if (post.title.toLowerCase().includes(lowerQuery)) score += 10;
        if (post.excerpt.toLowerCase().includes(lowerQuery)) score += 3;
        if (post.content.toLowerCase().includes(lowerQuery)) score += 1;
        if (score > 0) searchResults.push({ type: "blog", item: post, score });
      });
    }

    // Search Publications
    if (scope === "all" || scope === "publication") {
      publications.forEach(pub => {
        let score = 0;
        if (pub.title.toLowerCase().includes(lowerQuery)) score += 10;
        if (pub.venue.toLowerCase().includes(lowerQuery)) score += 4;
        if (pub.abstract && pub.abstract.toLowerCase().includes(lowerQuery))
          score += 2;
        if (score > 0)
          searchResults.push({ type: "publication", item: pub, score });
      });
    }

    // Search Newsletters
    if (scope === "all" || scope === "newsletter") {
      newsletters.forEach(news => {
        let score = 0;
        if (news.title.toLowerCase().includes(lowerQuery)) score += 10;
        if (news.description.toLowerCase().includes(lowerQuery)) score += 3;
        if (news.content.toLowerCase().includes(lowerQuery)) score += 1;
        if (score > 0)
          searchResults.push({ type: "newsletter", item: news, score });
      });
    }

    searchResults.sort((a, b) => b.score - a.score);
    setResults(searchResults.slice(0, 10));
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => performSearch(query), 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const regex = new RegExp(`(${highlight})`, "gi");
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-accent/30 text-primary font-medium">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
          size={20}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3 border border-slate-200 rounded-none focus:outline-none focus:border-primary transition-colors text-slate-800 bg-white"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {isOpen && query && (
        <div className="top-full left-0 right-0 mt-2 block border border-slate-200 rounded-none shadow-lg max-h-96 overflow-y-auto z-50 bg-white relative">
          {results.length > 0 ? (
            <ul>
              {results.map(result => {
                if (result.type === "blog") {
                  const item = result.item as BlogPost;
                  return (
                    <li key={`blog-${item.id}`}>
                      <Link
                        href={`/blog/${item.slug}`}
                        className="block px-6 py-4 hover:bg-slate-50 border-b border-slate-100"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase text-accent bg-accent/10 px-1.5 py-0.5">
                            Blog
                          </span>
                          <span className="text-xs text-slate-400">
                            {item.date}
                          </span>
                        </div>
                        <h4 className="font-medium text-slate-800">
                          {highlightText(item.title, query)}
                        </h4>
                      </Link>
                    </li>
                  );
                } else if (result.type === "newsletter") {
                  const item = result.item as Newsletter;
                  return (
                    <li key={`news-${item.id}`}>
                      <Link
                        href={`/newsletter/${item.slug}`}
                        className="block px-6 py-4 hover:bg-slate-50 border-b border-slate-100"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase text-green-600 bg-green-50 px-1.5 py-0.5">
                            Newsletter
                          </span>
                          <span className="text-xs text-slate-400">
                            {item.date}
                          </span>
                        </div>
                        <h4 className="font-medium text-slate-800">
                          {highlightText(item.title, query)}
                        </h4>
                      </Link>
                    </li>
                  );
                } else {
                  const item = result.item as Publication;
                  return (
                    <li key={`pub-${item.id}`}>
                      <a
                        href={item.link || "#"}
                        target={item.link ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className={`block px-6 py-4 border-b border-slate-100 ${
                          item.link
                            ? "hover:bg-slate-50 cursor-pointer"
                            : "cursor-default"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase text-blue-600 bg-blue-50 px-1.5 py-0.5">
                            Publication
                          </span>
                          <span className="text-xs text-slate-400">
                            {item.year}
                          </span>
                        </div>
                        <h4 className="font-medium text-slate-800">
                          {highlightText(item.title, query)}
                        </h4>
                        <p className="text-xs text-slate-500 italic">
                          {item.venue}
                        </p>
                      </a>
                    </li>
                  );
                }
              })}
            </ul>
          ) : (
            <div className="px-6 py-8 text-center text-slate-500">
              <p>No results found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
