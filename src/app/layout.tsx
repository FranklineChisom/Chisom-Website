import type { Metadata, Viewport } from "next"; 
import { GoogleAnalytics } from '@next/third-parties/google'; // Import GA Component
import "./globals.css";
import { Providers } from "./providers";
import ClientLayout from "@/components/ClientLayout";

// 1. Separate Viewport export (Next.js 14+)
export const viewport: Viewport = {
  themeColor: '#0f2f38',
  width: 'device-width',
  initialScale: 1,
};

// 2. Comprehensive Global Metadata
export const metadata: Metadata = {
  metadataBase: new URL('https://franklinechisom.com'),
  title: {
    template: '%s | Frankline Chisom Ebere',
    default: 'Frankline Chisom Ebere',
  },
  description: "Junior Research Fellow at Lex Lata Centre specializing in International Financial Law, African capital markets, and AfCFTA regulatory harmonization.",
  keywords: ["International Financial Law", "AfCFTA", "African Capital Markets", "Legal Research", "Nigeria Law"],
  authors: [{ name: "Frankline Chisom Ebere" }],
  creator: "Frankline Chisom Ebere",
  
  // OpenGraph
  openGraph: {
    siteName: 'Frankline Chisom Ebere',
    locale: 'en_US',
    type: 'website',
    url: 'https://franklinechisom.com',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Frankline Chisom Ebere - Legal Researcher',
      },
    ],
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'Frankline Chisom Ebere',
    creator: '@Frankline_Rolis',
    images: ['/images/og-default.jpg'],
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  icons: {
    icon: '/favicon.svg', // Simplified to just point to your SVG
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  // Verification for Google Search Console (Optional but recommended)
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans bg-white text-slate-800 antialiased">
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
      {/* Analytics script injected here - only if ID exists */}
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  );
}