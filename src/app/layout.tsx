import type { Metadata, Viewport } from "next"; 
import { GoogleAnalytics } from '@next/third-parties/google'; 
import "./globals.css";
import { Providers } from "./providers";
import ClientLayout from "@/components/ClientLayout";

export const viewport: Viewport = {
  themeColor: '#0f2f38',
  width: 'device-width',
  initialScale: 1,
};

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

  twitter: {
    card: 'summary_large_image',
    title: 'Frankline Chisom Ebere',
    creator: '@Frankline_Rolis',
    images: ['/images/og-default.jpg'],
  },

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

  // Fixed Favicon Configuration
  icons: {
    // Favicon.ico is for legacy support
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    // Apple touch icon
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
  },

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
        {/* Explicit fallback for favicon if metadata misses some browsers */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
      </head>
      <body className="font-sans bg-white text-slate-800 antialiased">
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  );
}