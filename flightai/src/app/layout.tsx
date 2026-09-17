import type { Metadata } from "next";
import { Archivo, Oswald } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import CookieConsent from '@/components/CookieConsent';

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
  title: "Aervyn - Real-Time Aviation Intelligence",
  description: "Global flight tracking, deep aircraft telemetry, and AI-powered aviation insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${archivo.variable} ${oswald.variable} font-sans min-h-screen bg-background text-foreground antialiased`}>
        <AuthProvider>
          {children}
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  );
}
