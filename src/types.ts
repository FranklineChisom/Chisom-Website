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
  analyticsUrl?: string;
}

export interface SocialConfig {
  linkedin: string;
  twitter: string;
  scholar: string;
  ssrn?: string;
  facebook?: string;
  instagram?: string;
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
  deleted_at?: string | null;
  attachments?: string[];
  created_at?: string; // Added this to fix the build error
}

export interface Subscriber {
  id: string;
  email: string;
  date: string;
}

// --- EMAIL CLIENT TYPES ---

export interface Draft {
  id: string;
  recipient: string;
  subject: string;
  message: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface SentEmail {
  id: string;
  recipient: string;
  subject: string;
  html?: string;
  text: string;
  status: 'sent' | 'failed';
  created_at: string;
  deleted_at?: string | null;
  attachments?: string[];
}

export interface ResendEmail {
  id: string;
  from: string;
  to: string[];
  subject: string;
  html?: string;
  text?: string;
  created_at: string;
}