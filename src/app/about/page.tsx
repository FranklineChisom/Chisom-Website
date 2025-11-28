import React from 'react';
import Image from 'next/image';
import Section from '@/components/Section';
import { Download } from 'lucide-react';
import { EXPERTISE } from '@/constants'; // Ensure constants are moved to src/constants.ts
import { supabase } from '@/lib/supabase';
import type { Metadata } from 'next';

// 1. SEO Replacement
export const metadata: Metadata = {
  title: 'About Me',
  description: 'Junior Research Fellow at Lex Lata Centre specializing in international financial law and African capital markets.',
  openGraph: {
    title: 'About Frankline Chisom Ebere',
    description: 'Junior Research Fellow at Lex Lata Centre specializing in international financial law.',
    url: 'https://franklinechisom.com/about',
  }
};

async function getAboutData() {
  const { data } = await supabase.from('site_config').select('*').single();
  return data;
}

export default async function About() {
  const siteConfig = await getAboutData();

  // Fallback if DB is empty
  const aboutImage = siteConfig?.about_image || '/images/Chisom.jpg';
  const name = siteConfig?.name || 'Frankline Chisom Ebere';

  return (
    <div className="max-w-5xl mx-auto px-6 space-y-20">
      <Section className="grid md:grid-cols-12 gap-12 items-start">
        {/* Image Column */}
        <div className="md:col-span-5 lg:col-span-4">
            <div className="aspect-[3/4] bg-slate-200 rounded-none overflow-hidden shadow-lg relative">
                {/* 2. Image Optimization */}
                <Image 
                    src={aboutImage} 
                    alt={name} 
                    width={400}
                    height={600}
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-in-out"
                    priority // Loads this image immediately
                />
            </div>
            <div className="mt-4 text-xs text-slate-400 font-mono text-center">
                {name}
            </div>
        </div>

        {/* Text Column */}
        <div className="md:col-span-7 lg:col-span-8">
            <h1 className="font-serif text-4xl md:text-5xl text-primary mb-8">About Me</h1>
            <div className="w-12 h-1 bg-primary mb-10"></div>
            
            <div className="prose prose-lg prose-slate text-slate-600 font-light leading-loose">
                <p>
                I am a Junior Research Fellow at the <strong>Lex Lata Centre for Int&apos;l Law & Comparative Constitutionalism in Africa</strong>, where my work focuses on researching regulatory fragmentation in African capital markets. I am deeply committed to the harmonization of the $2 trillion capital market among the 54 African states under the African Continental Free Trade Area (AfCFTA) protocols.
                </p>
                <p>
                My legal experience spans impactful roles at top-tier firms. I have served as a Legal Intern at <strong>G Elias</strong>, <strong>Broderick Bozimo & Company</strong>, and <strong>ALN Nigeria | Aluko & Oyebode</strong>. In these capacities, I have contributed to case strategy development for high-profile cases worth over $80 million, conducted extensive legal research, and assisted in the preparation of court processes.
                </p>
                <p>
                  Beyond technical scholarship, I am dedicated to the human dimension of the law. Through my leadership roles at the Ahmadu Bello University Law Clinic and the Federation of African Law Students, I have driven strategic initiatives focused on advocacy and access to justice. This work is supported by my fluency in English, French, Hausa, Zarma, and Igbo, which equips me with the cultural intelligence necessary to bridge diverse legal landscapes effectively.
                </p>
            </div>

            <div className="pt-8">
                <a 
                href="/resume/Frankline_Ebere_CV.pdf" 
                download
                className="inline-flex items-center px-6 py-3 border border-slate-200 text-slate-700 hover:border-primary hover:text-primary transition-colors rounded-none text-sm font-medium"
                >
                <Download size={18} className="mr-2" />
                Download Curriculum Vitae
                </a>
            </div>
        </div>
      </Section>

      {/* Expertise */}
      <Section delay={200} className="grid md:grid-cols-2 gap-12 pt-12 border-t border-slate-100">
        <div>
          <h3 className="font-serif text-xl text-primary mb-6">Areas of Interest</h3>
          <ul className="space-y-3">
            {EXPERTISE.map((item, idx) => (
              <li key={idx} className="flex items-center text-slate-700">
                <span className="w-1.5 h-1.5 bg-accent mt-0.5 mr-3"></span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-serif text-xl text-primary mb-6">Education & Honors</h3>
          <ul className="space-y-4 text-slate-600 text-sm">
            <li>
              <strong className="block text-slate-800">Bachelor of Laws (LL.B.) - In View</strong>
              Ahmadu Bello University, Zaria (Class of 2026)<br/>
              <span className="text-slate-500 text-xs">CGPA: 4.37/5.0</span>
            </li>
            <li>
              <strong className="block text-slate-800">Aspire Leaders Program</strong>
              Aspire Institute, Cambridge, MA, USA (2024)
            </li>
            <li>
              <strong className="block text-slate-800">Advanced Diploma, Business Administration</strong>
              Tekedia Institute, Boston, MA, USA (2022)
            </li>
             <li>
              <strong className="block text-slate-800">Notable Achievement</strong>
              Champion & Best Advocate, Shehu Wada, SAN National Business Rescue and Insolvency Moot Championship (2024)
            </li>
          </ul>
        </div>
      </Section>
    </div>
  );
}