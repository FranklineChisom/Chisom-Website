export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  coverImage?: string;
  published: boolean;
}

export interface Newsletter {
  id: string;
  slug: string;
  title: string;
  date: string;
  description: string;
  content: string;
  coverImage?: string;
  published: boolean;
}

export interface Publication {
  id: string;
  title: string;
  year: string;
  venue: string;
  type: 'Journal Article' | 'Book Chapter' | 'Policy Paper';
  link?: string;
  featured?: boolean;
  abstract?: string;
  coAuthors?: string[];
  published: boolean;
}

export interface ResearchInterest {
  title: string;
  description: string;
}

export interface SocialConfig {
  linkedin: string;
  twitter: string;
  scholar: string;
  ssrn?: string;
  facebook?: string;
  instagram?: string;
}

export interface SiteConfig {
  name: string;
  role: string;
  tagline: string;
  focusText: string;
  focusLink: string;
  focusContent: string;
  researchIntro: string;
  researchInterests: string;
  aboutImage: string;
  email: string;
  location: string;
  social: SocialConfig;
  analyticsUrl?: string; // NEW FIELD
}

export interface ContactMessage {
  id: string;
  date: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  replied?: boolean;
}

export interface Subscriber {
  id: string;
  email: string;
  date: string;
}