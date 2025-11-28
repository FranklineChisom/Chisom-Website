import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import ClientLayout from "@/components/ClientLayout";

// Global Metadata (SEO)
export const metadata: Metadata = {
  title: {
    template: '%s | Frankline Chisom Ebere',
    default: 'Frankline Chisom Ebere',
  },
  description: "Junior Research Fellow at Lex Lata Centre specializing in International Financial Law, African capital markets, and AfCFTA regulatory harmonization.",
  metadataBase: new URL('https://franklinechisom.com'),
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%230f2f38'/><text x='50%' y='58%' dominant-baseline='middle' text-anchor='middle' font-size='70' font-family='serif' fill='white'>C</text></svg>",
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
        {/* Fonts fetched directly from Google Fonts to match Vite version exactly */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans bg-white text-slate-800 antialiased">
        {/* Providers wraps the entire app to give access to DataContext and ToastContext */}
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}