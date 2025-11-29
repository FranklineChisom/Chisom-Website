import { BlogPost, Publication, Newsletter } from './types';

export const SITE_CONFIG = {
  name: "Frankline Chisom Ebere",
  role: "Law Student | Researcher | Thinker",
  tagline: "Bridging legal theory and economic reality to advance the harmonization of African trade and capital markets.",
  focusText: "Currently researching regulatory fragmentation in African capital markets and AfCFTA for the harmonisation of the $2 trillion capital market among the 54 African states as a Junior Research Fellow at Lex Lata Centre.",
  focusLink: "/current-focus",
  focusContent: `### The Challenge of Market Harmonization

My current research at the **Lex Lata Centre for International Law & Comparative Constitutionalism** focuses on a critical paradox in the African economic landscape: while the political will for integration exists under the **AfCFTA**, the regulatory infrastructure remains deeply fragmented.

#### Key Areas of Investigation

1. **Regulatory Arbitrage**: How disparate capital market rules create loopholes that hinder cross-border investment.
2. **Dispute Resolution Mechanisms**: The efficacy of current AfCFTA protocols in resolving state-investor disputes.
3. **Digital Protocols**: The intersection of fintech regulation and traditional securities law.

I am exploring how a unified legal framework can unlock the estimated **$2 trillion** potential of African capital markets.`,
  researchIntro: `My research philosophy centers on "functional harmonization"—finding legal solutions that respect national sovereignty while removing friction from cross-border capital flows.`,
  researchInterests: `- The African Continental Free Trade Area (AfCFTA) Dispute Settlement Protocol
- Islamic Finance in secular jurisdictions
- Enforcement of foreign arbitral awards in West Africa`,
  aboutImage: "https://franklinechisom.com/images/Chisom.jpg",
  email: "contact@franklinechisom.com",
  location: "Abuja, Nigeria",
  social: {
    linkedin: "https://linkedin.com/in/franklinechisomebere",
    twitter: "https://x.com/Frankline_Rolis",
    scholar: "https://scholar.google.com/citations?user=mS0vwDIAAAAJ&hl=en",
    ssrn: "https://ssrn.com/author=4105575",
    facebook: "https://facebook.com/ebere.frankline.chisom/",
    instagram: "https://instagram.com/frankline_chisom/"
  }
};

export const NEWSLETTERS: Newsletter[] = [
  {
    id: "n1",
    slug: "issue-1-the-architecture-of-african-trade",
    title: "Issue #1: The Architecture of African Trade",
    date: "November 1, 2025",
    description: "Welcome to the inaugural issue. We explore the structural challenges of the AfCFTA digital protocols.",
    content: "Welcome to the first edition of my newsletter, where I document my thoughts on law, policy, and the economic future of the continent.\n\nIn this issue, we are looking at the 'Spaghetti Bowl' effect of overlapping regional economic communities in Africa and how the new AfCFTA protocols intend to untangle them.\n\nThe promise of a single market is alluring, but the regulatory reality is complex...",
    published: true
  }
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "1",
    slug: "ubuntu-new-standard-arbitration-africa",
    title: "Ubuntu: A New Standard for Arbitration in Africa and Beyond",
    date: "October 24, 2025",
    category: "Arbitration",
    readTime: "5 min read",
    excerpt: "Exploring how African philosophy can redefine arbitration standards, as published in the Turkish Arbitration Blog.",
    content: "This article explores the concept of Ubuntu and its potential application as a standard for arbitration in Africa, arguing for a more community-centric approach to dispute resolution...",
    published: true
  },
  {
    id: "7",
    slug: "understanding-cookie-regulations",
    title: "Understanding Cookie Regulations for Compliant Web Sites",
    date: "2024",
    category: "Legal Tech",
    readTime: "6 min read",
    excerpt: "A guide to navigating digital privacy laws and cookie regulations for modern web development.",
    content: "As digital marketing evolves, compliance with GDPR and other privacy frameworks becomes critical for developers and legal practitioners alike...",
    published: true
  },
  {
    id: "9",
    slug: "extension-time-challenge-arbitral-awards",
    title: "Extension of Time to Challenge Arbitral Awards under the 1996 English Arbitration Act",
    date: "November 9, 2023",
    category: "Dispute Resolution",
    readTime: "7 min read",
    excerpt: "Examining the jurisprudence of extension of time to challenge arbitral awards, published in the Kluwer Arbitration Blog.",
    content: "An analysis of recent case law regarding the strict timelines imposed by the 1996 Arbitration Act and the circumstances under which courts grant extensions...",
    published: true
  }
].sort((a, b) => {
  // Handle year-only dates by assuming Jan 1
  const dateA = a.date.length === 4 ? new Date(`${a.date}-01-01`) : new Date(a.date);
  const dateB = b.date.length === 4 ? new Date(`${b.date}-01-01`) : new Date(b.date);
  return dateB.getTime() - dateA.getTime();
});

export const PUBLICATIONS: Publication[] = [
  {
    id: "p3",
    title: "The Rome Statute’s Dilemma: Reconciling Official Capacity and State Sovereignty",
    year: "2025",
    venue: "SSRN",
    type: "Journal Article",
    featured: true,
    abstract: "Reconciling the Doctrine of Official Capacity and State Sovereignty in Articles 27 And 98. Available at SSRN 5324571.",
    coAuthors: ["Amina Sulaimon"],
    link: "#",
    published: true
  },
  {
    id: "p2",
    title: "A Duty of Technological Competence for Legal Practitioners in Nigeria",
    year: "2025",
    venue: "BarristerNG.com",
    type: "Journal Article",
    featured: true,
    abstract: "An analysis of the Rules of Professional Conduct concerning the growing necessity for technological competence in legal practice.",
    link: "#",
    published: true
  },
  {
    id: "p4",
    title: "A Study on the History, Nature, and Character of International Crimes",
    year: "2025",
    venue: "SSRN",
    type: "Journal Article",
    featured: false,
    abstract: "Available at SSRN 5286590.",
    link: "#",
    published: true
  },
  {
    id: "p5",
    title: "Mandatory or Discretionary? The Role of Legal Practitioners in Confessional Statements",
    year: "2025",
    venue: "SSRN",
    type: "Journal Article",
    featured: false,
    abstract: "Available at SSRN 528438. Examining the role of counsel under the ACJA 2015.",
    link: "#",
    published: true
  },
  {
    id: "p6",
    title: "Nigeria’s Proposed Foreign Exchange and Tax Reforms: Navigating Tricky Transitions",
    year: "2024",
    venue: "Ahmadu Bello University Tax Club",
    type: "Policy Paper",
    featured: true,
    link: "#",
    published: true
  },
  {
    id: "p8",
    title: "The Recent Military Coups in Africa: Prioritising Rule of Law Over Democracy?",
    year: "2023",
    venue: "Tekedia Institute",
    type: "Journal Article",
    link: "#",
    published: true
  }
].sort((a, b) => parseInt(b.year) - parseInt(a.year));

export const EXPERTISE = [
  "International Financial Law",
  "Arbitration & Dispute Resolution",
  "Capital Markets",
  "Corporate Law",
  "Legal Innovation"
];