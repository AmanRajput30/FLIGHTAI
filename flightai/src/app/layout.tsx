import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import CookieConsent from '@/components/CookieConsent';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Averyn - Real-Time Aviation Intelligence",
  description: "Global flight tracking, deep aircraft telemetry, and AI-powered aviation insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <AuthProvider>
          {children}
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  );
}
