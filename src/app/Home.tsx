import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import Section from '../components/Section';
import { useData } from '../contexts/DataContext';
import SEO from '../components/SEO';

const Home: React.FC = () => {
  const { siteConfig, blogPosts, newsletters, addSubscriber } = useData();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Filter published, Sort by date (newest first), then take top 3
  const recentPosts = blogPosts
    .filter(p => p.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
  
  // Filter published, Get latest 2 newsletter issues
  const recentNewsletters = newsletters
    .filter(n => n.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 2);

  const handleSubscribe = async (e: React.FormEvent) => {
  e.preventDefault();
  if(!email) return;

  setStatus('loading');

  const success = await addSubscriber(email);
  
  setTimeout(() => {
      if(success) {
          setStatus('success');
      } else {
          setStatus('error');
      }
  }, 500);
};

  return (
    <div className="space-y-24 md:space-y-32">
      <SEO 
        description="Frankline Chisom Ebere researches regulatory fragmentation in African capital markets and AfCFTA protocols."
        keywords="Frankline Chisom Ebere, legal scholar, AfCFTA, African capital markets, international financial law"
        contentType="Person"
      />
      
      {/* Hero Section */}
      <Section className="max-w-5xl mx-auto px-6 pt-16 md:pt-24">
        <h1 className="font-serif text-5xl md:text-7xl text-primary leading-[1.1] font-medium mb-10 tracking-tight">
          Law, Policy, and <br className="hidden md:block" />
          <span className="italic text-slate-600">African Markets</span>.
        </h1>
        
        <div className="max-w-2xl border-l-2 border-accent pl-8 py-2 mb-12">
          <p className="text-lg md:text-xl text-slate-600 font-light leading-relaxed">
            Researching the functional harmonisation of capital markets and the regulatory frameworks essential for economic integration across the continent.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-5">
            <Link 
              to="/research" 
              className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-medium hover:bg-slate-800 transition-all rounded-none group shadow-lg shadow-primary/20"
            >
              Explore Research
              <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/about" 
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-slate-600 border border-slate-200 hover:border-primary hover:text-primary font-medium transition-all rounded-none"
            >
              About Me
            </Link>
        </div>
      </Section>

      {/* Focus Section */}
      <Section delay={200} className="bg-slate-50 py-20 border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4 block">Current Focus</span>
          <h2 className="font-serif text-3xl md:text-4xl text-primary leading-snug mb-8">
            "{siteConfig.focusText}"
          </h2>
          <Link to="/current-focus" className="inline-flex items-center text-primary font-medium hover:text-slate-800 transition-colors border-b border-primary/30 pb-1 hover:border-primary">
            Learn more about this project
            <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
      </Section>

      {/* Recent Writing */}
      <Section delay={300} className="max-w-4xl mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <h2 className="font-serif text-3xl text-primary">From the Blog</h2>
          <Link to="/blog" className="hidden md:inline-flex items-center text-sm text-slate-500 hover:text-primary transition-colors">
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
                    <Link to={`/blog/${post.slug || post.id}`}>{post.title}</Link>
                  </h3>
                  <p className="text-slate-600 leading-relaxed max-w-2xl mb-2">
                    {post.excerpt}
                  </p>
                  <Link to={`/blog/${post.slug || post.id}`} className="text-sm font-medium text-slate-400 group-hover:text-primary transition-colors inline-flex items-center">
                    Read Article <ArrowRight size={14} className="ml-1" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        
        <div className="mt-10 md:hidden">
          <Link to="/blog" className="inline-flex items-center text-sm text-slate-500 hover:text-primary">
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
              Join a growing community of students, academics and practitioners. I share fresh perspectives on law, policy, and markets in Africa and explore ideas that reach far beyond.
            </p>
            
            {status === 'success' ? (
               <div className="bg-white/10 border border-white/20 p-6 rounded-none text-center animate-in fade-in">
                   <CheckCircle className="mx-auto text-accent mb-3" size={32} />
                   <h4 className="font-bold text-lg mb-1">You're Subscribed!</h4>
                   <p className="text-slate-300 text-sm mb-4">Thank you for joining. Keep an eye on your inbox.</p>
                   <Link to={`/unsubscribe?email=${encodeURIComponent(email)}`} className="text-xs text-slate-400 hover:text-white underline">
                     Mistake? Unsubscribe here.
                   </Link>
               </div>
            ) : status === 'loading' ? (
                  <div className="bg-white/10 border border-white/20 p-6 rounded-none text-center">
                         <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-slate-300">  Checking subscription status...</p>
                  </div>
            ) : status === 'error' ? (
              <div className="bg-white/10 border border-white/20 p-6 rounded-none text-center animate-in fade-in">
                   <AlertCircle className="mx-auto text-yellow-500 mb-3" size={32} />
                   <h4 className="font-bold text-lg mb-1">Already Subscribed</h4>
                   <p className="text-slate-300 text-sm mb-4">The email <span className="font-semibold text-white">{email}</span> is already on the list.</p>
                   <div className="flex gap-4 justify-center text-xs">
                     <button onClick={() => setStatus('idle')} className="text-accent hover:underline">Try another email</button>
                     <span className="text-slate-500">|</span>
                     <Link to={`/unsubscribe?email=${encodeURIComponent(email)}`} className="text-slate-400 hover:text-white underline">
                       Unsubscribe
                     </Link>
                   </div>
               </div>
            ) : (
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
            )}
            
            {status === 'idle' && (
              <p className="text-xs text-slate-500 mt-4">No spam. <Link to="/unsubscribe" className="underline hover:text-slate-300">Unsubscribe anytime</Link>.</p>
            )}
          </div>
          
          <div className="border-t md:border-t-0 md:border-l border-white/10 md:pl-16 pt-10 md:pt-0">
            <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-8">Latest Issues</h3>
            <div className="space-y-8">
              {recentNewsletters.map(item => (
                <div key={item.id} className="group">
                  <span className="text-xs font-mono text-slate-400 block mb-1">{item.date}</span>
                  <Link to={`/newsletter/${item.slug || item.id}`} className="font-serif text-xl block mb-2 group-hover:text-accent transition-colors">
                    {item.title}
                  </Link>
                  <p className="text-slate-400 text-sm leading-relaxed mb-3">
                    {item.description}
                  </p>
                  <Link to={`/newsletter/${item.slug || item.id}`} className="text-xs font-bold text-accent uppercase tracking-wider flex items-center group-hover:text-white transition-colors">
                    Read Issue <ArrowRight size={12} className="ml-1" />
                  </Link>
                </div>
              ))}
              {recentNewsletters.length === 0 && (
                <p className="text-slate-500 italic">No issues published yet. Be the first to subscribe.</p>
              )}
            </div>
            
            {newsletters.filter(n => n.published).length > 0 && (
                <div className="mt-8 pt-6 border-t border-white/5">
                    <Link to="/newsletters" className="text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                        View Full Archive <ArrowRight size={14} />
                    </Link>
                </div>
            )}
          </div>
        </div>
      </Section>

    </div>
  );
};

export default Home;