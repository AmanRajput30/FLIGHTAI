import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "AERVYN Terms of Service. Guidelines and rules for using our real-time flight tracking and telemetry platform.",
  openGraph: {
    title: "Terms of Service",
    description: "AERVYN Terms of Service. Guidelines and rules for using our real-time flight tracking and telemetry platform.",
    url: "https://aervyn.in/terms",
  },
};



export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-aervyn-bg-dark text-aervyn-text-primary font-inter">
      <Header />
      
      <main className="flex-1 max-w-3xl mx-auto px-6 py-24">
        <h1 className="text-3xl font-black mb-8 text-aervyn-text-dark-primary">Terms of Service</h1>
        
        <div className="prose prose-invert prose-sm text-aervyn-text-dark-secondary">
          <p>Last Updated: October 2024</p>
          
          <h2 className="text-aervyn-text-dark-primary mt-8 mb-4 font-bold text-xl">1. Acceptance of Terms</h2>
          <p>By accessing or using Aervyn, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.</p>

          <h2 className="text-aervyn-text-dark-primary mt-8 mb-4 font-bold text-xl">2. Use of Data</h2>
          <p>Aervyn provides real-time aviation telemetry and flight tracking intelligence for informational and research purposes. The data provided is aggregated from public sources and community feeders.</p>
          
          <div className="p-4 bg-aervyn-status-error/10 border border-aervyn-status-error/30 rounded-lg text-aervyn-status-error my-6">
            <strong className="text-aervyn-status-error">CRITICAL SAFETY WARNING:</strong> The data provided by Aervyn is NOT intended for aeronautical navigation or operational use. Do not use this service for flight planning, separation of aircraft, or emergency response.
          </div>

          <h2 className="text-aervyn-text-dark-primary mt-8 mb-4 font-bold text-xl">3. Intellectual Property</h2>
          <p>The Aervyn platform, including its AI engine (SkyLord), original code, and interface design are owned by Aervyn. Data aggregated from external providers remains subject to their respective licenses (e.g., ODbL for ADSB.lol data).</p>

          <h2 className="text-aervyn-text-dark-primary mt-8 mb-4 font-bold text-xl">4. API Usage and Rate Limiting</h2>
          <p>Users must not abuse our APIs or attempt to scrape the platform. We employ rate limiting to ensure fair usage. Excessive requests may result in temporary or permanent IP bans.</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
