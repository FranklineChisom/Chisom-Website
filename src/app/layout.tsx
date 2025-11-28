import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import ClientLayout from "@/components/ClientLayout";

// Configure Fonts
const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: "swap" 
});

const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-playfair",
  display: "swap" 
});

// Global Metadata (SEO)
export const metadata: Metadata = {
  title: {
    template: '%s | Frankline Chisom Ebere',
    default: 'Frankline Chisom Ebere - Legal Scholar',
  },
  description: "Junior Research Fellow at Lex Lata Centre specializing in International Financial Law, African capital markets, and AfCFTA regulatory harmonization.",
  metadataBase: new URL('https://franklinechisom.com'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-white text-slate-800 antialiased`}>
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