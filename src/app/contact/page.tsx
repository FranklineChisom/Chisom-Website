import React, { useState } from 'react';
import Section from '../components/Section';
import { useData } from '../contexts/DataContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { useSEO } from '../hooks/usePageTitle';

// Font Awesome Imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLocationDot, faFileLines, faCheck, faGraduationCap, faBookmark } from '@fortawesome/free-solid-svg-icons';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';

const Contact: React.FC = () => {
  useSEO({
    title: 'Contact',
    description: 'Get in touch for research collaborations, speaking engagements, or inquiries about international financial law.',
    url: 'https://franklinechisom.com/contact'
  });
  
  const { siteConfig, addMessage } = useData();
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'Research Inquiry', message: '' });
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    addMessage({
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        ...formData,
        read: false
    });

    setStatus('success');
    setFormData({ name: '', email: '', subject: 'Research Inquiry', message: '' });

    // Reset success message after 5 seconds
    setTimeout(() => setStatus('idle'), 5000);
  };

  const BoxIcon: React.FC<{ href: string; icon: React.ReactNode; label: string }> = ({ href, icon, label }) => (
    <a 
        href={href} 
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 text-slate-500 hover:text-primary group transition-all"
    >
        <div className="w-10 h-10 bg-slate-100 flex items-center justify-center rounded-none group-hover:bg-primary group-hover:text-white transition-all">
            {icon}
        </div>
        <span className="text-sm font-medium">{label}</span>
    </a>
  );

  return (
    <div className="max-w-5xl mx-auto px-6">
      
      <Section className="grid md:grid-cols-2 gap-16">
        
        {/* Info Column */}
        <div>
          <h1 className="font-serif text-4xl md:text-5xl text-primary mb-8">Let's Connect</h1>
          <p className="text-md text-slate-600 font-light leading-relaxed mb-12">
            I am always open to academic discourse, speaking engagements, or research collaborations on almost anything law and policy.
          </p>

          <div className="space-y-8">
            <div className="flex items-start">
              <FontAwesomeIcon icon={faLocationDot} className="text-accent mt-1 mr-4 w-6 h-6" />
              <div>
                <h4 className="font-medium text-primary">Location</h4>
                <p className="text-slate-500">Based in {siteConfig.location}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <FontAwesomeIcon icon={faEnvelope} className="text-accent mt-1 mr-4 w-6 h-6" />
              <div>
                <h4 className="font-medium text-primary">Email</h4>
                <a href={`mailto:${siteConfig.email}`} className="text-slate-500 hover:text-primary transition-colors">
                  {siteConfig.email}
                </a>
                <p className="text-xs text-slate-400 mt-1">I aim to respond within 2–5 business days.</p>
              </div>
            </div>

             <div className="pt-10 grid grid-cols-2 gap-y-4">
                <BoxIcon 
                  href={siteConfig.social.linkedin} 
                  icon={<FontAwesomeIcon icon={faLinkedin} className="w-5 h-5" />} 
                  label="LinkedIn" 
                />
                <BoxIcon 
                  href={siteConfig.social.scholar} 
                  icon={<FontAwesomeIcon icon={faGraduationCap} className="w-5 h-5" />} 
                  label="Google Scholar" 
                />
                {siteConfig.social.ssrn && (
                  <BoxIcon 
                    href={siteConfig.social.ssrn} 
                    icon={<FontAwesomeIcon icon={faBookmark} className="w-5 h-5" />} 
                    label="SSRN" 
                  />
                )}
             </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="bg-slate-50 p-8 md:p-10 rounded-none">
          {status === 'success' ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-500">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                      <FontAwesomeIcon icon={faCheck} className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-2xl text-primary">Message Sent</h3>
                  <p className="text-slate-600">Thank you for reaching out. I will get back to you shortly.</p>
                  <button onClick={() => setStatus('idle')} className="text-sm text-primary font-medium hover:underline mt-4">Send another message</button>
              </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                <label htmlFor="name" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Name</label>
                <input 
                    type="text" 
                    id="name" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white border border-slate-200 px-4 py-3 focus:outline-none focus:border-primary transition-colors text-slate-800 rounded-none"
                    placeholder="Your Name"
                    required
                />
                </div>
                <div>
                <label htmlFor="email" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email</label>
                <input 
                    type="email" 
                    id="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-white border border-slate-200 px-4 py-3 focus:outline-none focus:border-primary transition-colors text-slate-800 rounded-none"
                    placeholder="name@example.com"
                    required
                />
                </div>
                <div>
                <label htmlFor="subject" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Subject</label>
                <select 
                    id="subject" 
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    className="w-full bg-white border border-slate-200 px-4 py-3 focus:outline-none focus:border-primary transition-colors text-slate-800 rounded-none"
                >
                    <option>Research Inquiry</option>
                    <option>Speaking Engagement</option>
                    <option>Media/Press</option>
                    <option>Other</option>
                </select>
                </div>
                <div>
                <label htmlFor="message" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Message</label>
                <textarea 
                    id="message" 
                    rows={5}
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-white border border-slate-200 px-4 py-3 focus:outline-none focus:border-primary transition-colors text-slate-800 rounded-none"
                    placeholder="How can I help you?"
                    required
                ></textarea>
                </div>
                <button 
                type="submit" 
                className="w-full bg-primary text-white font-medium py-3 hover:bg-slate-800 transition-colors rounded-none"
                >
                Send Message
                </button>
            </form>
          )}
        </div>

      </Section>
    </div>
  );
};

export default Contact;