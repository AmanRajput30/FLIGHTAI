import type { Metadata } from "next";
import { Archivo, Oswald } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import CookieConsent from '@/components/CookieConsent';
import GoogleProvider from '@/components/auth/GoogleProvider';
import { MotionConfigProvider } from "@/components/providers/MotionConfigProvider";
import StructuredData from '@/components/seo/StructuredData';

const archivo = Archivo({ 
  subsets: ["latin"],
  variable: "--font-labels",
  display: 'swap',
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-numerals",
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://aervyn.in'),
  title: {
    default: "AERVYN | Real-Time Aviation Intelligence",
    template: "%s | AERVYN"
  },
  description: "Professional-grade global flight tracking, deep aircraft telemetry, and AI-powered aviation insights. Track and analyze the skies in real-time.",
  keywords: ["flight tracking", "aviation intelligence", "ADS-B", "aircraft telemetry", "live flights", "radar"],
  authors: [{ name: "AERVYN Team", url: "https://aervyn.in" }],
  creator: "AERVYN",
  publisher: "AERVYN",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-touch-icon.png", // Assume we will add this later
  },
  openGraph: {
    title: "AERVYN | Real-Time Aviation Intelligence",
    description: "Professional-grade global flight tracking, deep aircraft telemetry, and AI-powered aviation insights. Track and analyze the skies in real-time.",
    url: 'https://aervyn.in',
    siteName: 'AERVYN',
    images: [
      {
        url: '/opengraph-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AERVYN - Real-Time Aviation Intelligence Dashboard',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "AERVYN | Real-Time Aviation Intelligence",
    description: "Professional-grade global flight tracking, deep aircraft telemetry, and AI-powered aviation insights. Track and analyze the skies in real-time.",
    images: ['/twitter-image.jpg'], // Can just reuse the OG image or specify separate
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${archivo.variable} ${oswald.variable} font-sans min-h-screen bg-background text-foreground antialiased`}>
        <MotionConfigProvider>
          <GoogleProvider>
            <AuthProvider>
              <StructuredData />
              {children}
              <CookieConsent />
            </AuthProvider>
          </GoogleProvider>
        </MotionConfigProvider>
      </body>
    </html>
  );
}
