import React from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Mail } from 'lucide-react';
import Section from '@/components/Section';
import { supabase } from '@/lib/supabase';
import NewsletterForm from '@/components/NewsletterForm';
import { SITE_CONFIG, BLOG_POSTS, NEWSLETTERS } from '@/constants';
import { BlogPost, Newsletter, SiteConfig } from '@/types';

// Fetch data
async function getData() {
  const { data: dbConfig } = await supabase.from('site_config').select('*').single();
  
  const siteConfig: SiteConfig = dbConfig ? {
    name: dbConfig.name,
    role: dbConfig.role,
    tagline: dbConfig.tagline,
    focusText: dbConfig.focus_text,
    focusLink: dbConfig.focus_link,
    focusContent: dbConfig.focus_content,
    researchIntro: dbConfig.research_intro,
    researchInterests: dbConfig.research_interests,
    aboutImage: dbConfig.about_image,
    email: dbConfig.email,
    location: dbConfig.location,
    social: dbConfig.social,
    analyticsUrl: dbConfig.analytics_url
  } : SITE_CONFIG;

  const { data: dbPosts } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('date', { ascending: false })
    .limit(3);
    
  const recentPosts: BlogPost[] = dbPosts ? dbPosts.map((p: any) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    date: p.date,
    excerpt: p.excerpt,
    content: p.content,
    category: p.category,
    readTime: p.read_time,
    coverImage: p.cover_image,
    published: p.published
  })) : BLOG_POSTS.slice(0, 3);

  const { data: dbNewsletters } = await supabase
    .from('newsletters')
    .select('*')
    .eq('published', true)
    .order('date', { ascending: false })
    .limit(2);

  const recentNewsletters: Newsletter[] = dbNewsletters ? dbNewsletters.map((n: any) => ({
    id: n.id,
    slug: n.slug,
    title: n.title,
    date: n.date,
    description: n.description,
    content: n.content,
    coverImage: n.cover_image,
    published: n.published
  })) : NEWSLETTERS.slice(0, 2);

  return { siteConfig, recentPosts, recentNewsletters };
}

export default async function Home() {
  const { siteConfig, recentPosts, recentNewsletters } = await getData();

  // Structured Data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": siteConfig.name,
    "url": "https://franklinechisom.com",
    "jobTitle": siteConfig.role,
    "image": siteConfig.aboutImage,
    "worksFor": {
      "@type": "Organization",
      "name": "Lex Lata Centre for Int'l Law & Comparative Constitutionalism"
    },
    "sameAs": [
      siteConfig.social.linkedin,
      siteConfig.social.twitter,
      siteConfig.social.scholar,
      siteConfig.social.ssrn
    ].filter(Boolean)
  };

  return (
    <div className="space-y-24 md:space-y-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Hero Section */}
      <Section className="max-w-5xl mx-auto px-6">
        <h1 className="font-serif text-5xl md:text-7xl text-primary leading-[1.1] font-normal mb-10 tracking-tight">
          Law, Policy, and <br className="hidden md:block" />
          <span className="italic text-slate-600">African Markets</span>.
        </h1>
        
        <div className="max-w-2xl border-l-2 border-accent pl-8 py-2 mb-12">
          <p className="text-lg md:text-xl text-slate-600 font-light leading-relaxed">
            Bridging legal theory and economic reality to advance the harmonization of African trade and capital markets.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-5">
            <Link 
              href="/research" 
              className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-medium hover:bg-slate-800 transition-all rounded-none group shadow-lg shadow-primary/20"
            >
              Explore Research
              <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/about" 
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-slate-600 border border-slate-200 hover:border-primary hover:text-primary font-medium transition-all rounded-none"
            >
              About Me
            </Link>
        </div>
      </Section>

      {/* Focus Section */}
      <Section delay={200} className="bg-secondary py-20 border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4 block">Current Focus</span>
          <h2 className="font-serif text-3xl md:text-4xl text-primary leading-snug mb-8">
            &quot;{siteConfig.focusText}&quot;
          </h2>
          <Link href="/current-focus" className="inline-flex items-center text-primary font-medium hover:text-slate-800 transition-colors border-b border-primary/30 pb-1 hover:border-primary">
            Learn more about this project
            <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
      </Section>

      {/* Recent Writing */}
      <Section delay={300} className="max-w-4xl mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <h2 className="font-serif text-3xl text-primary">From the Blog</h2>
          <Link href="/blog" className="hidden md:inline-flex items-center text-sm text-slate-500 hover:text-primary transition-colors">
            View all articles <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>

        <div className="grid gap-12">
          {recentPosts.map((post) => (
            <article key={post.id} className="group">
              <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-8">
                <span className="text-sm text-slate-400 font-mono min-w-[120px]">{post.date}</span>
                <div>
                  <h3 className="text-xl font-medium text-slate-800 group-hover:text-primary transition-colors mb-2">
                    <Link href={`/blog/${post.slug || post.id}`}>{post.title}</Link>
                  </h3>
                  <p className="text-slate-600 leading-relaxed max-w-2xl mb-2">
                    {post.excerpt}
                  </p>
                  <Link href={`/blog/${post.slug || post.id}`} className="text-sm font-medium text-slate-400 group-hover:text-primary transition-colors inline-flex items-center">
                    Read Article <ArrowRight size={14} className="ml-1" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        
        <div className="mt-10 md:hidden">
          <Link href="/blog" className="inline-flex items-center text-sm text-slate-500 hover:text-primary">
            View all articles <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
      </Section>

      {/* Newsletter Section */}
      <Section delay={400} className="bg-primary text-white py-24 my-10">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-16">
          <div>
            <div className="flex items-center gap-3 text-accent mb-4">
              <Mail size={24} />
              <span className="text-sm font-bold tracking-widest uppercase">The Newsletter</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl leading-tight mb-6">
              Law, policy, and the economic future of Africa.
            </h2>
            <p className="text-slate-300 font-light leading-relaxed mb-8 text-lg">
              Join a growing community of students, academics and practitioners. I share fresh perspectives on law, policy, and markets in Africa.
            </p>
            
            <NewsletterForm />
            
          </div>
          
          <div className="border-t md:border-t-0 md:border-l border-white/10 md:pl-16 pt-10 md:pt-0">
            <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-8">Latest Issues</h3>
            <div className="space-y-8">
              {recentNewsletters.map(item => (
                <div key={item.id} className="group">
                  <span className="text-xs font-mono text-slate-400 block mb-1">{item.date}</span>
                  <Link href={`/newsletters/${item.slug || item.id}`} className="font-serif text-xl block mb-2 group-hover:text-accent transition-colors">
                    {item.title}
                  </Link>
                  <p className="text-slate-400 text-sm leading-relaxed mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  <Link href={`/newsletters/${item.slug || item.id}`} className="text-xs font-bold text-accent uppercase tracking-wider flex items-center group-hover:text-white transition-colors">
                    Read Issue <ArrowRight size={12} className="ml-1" />
                  </Link>
                </div>
              ))}
              {recentNewsletters.length === 0 && (
                <p className="text-slate-500 italic">No issues published yet.</p>
              )}
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5">
                <Link href="/newsletters" className="text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                    View Full Archive <ArrowRight size={14} />
                </Link>
            </div>
          </div>
        </div>
      </Section>

    </div>
  );
}