import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-cockpit-black)] text-foreground">
      <Header variant="full" />
      
      <main className="flex-1 max-w-3xl mx-auto px-6 py-24">
        <h1 className="text-3xl font-black mb-8 text-white">Terms of Service</h1>
        
        <div className="prose prose-invert prose-sm text-gray-400">
          <p>Last Updated: October 2024</p>
          
          <h2 className="text-white mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>By accessing or using Aervyn, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.</p>

          <h2 className="text-white mt-8 mb-4">2. Use of Data</h2>
          <p>Aervyn provides real-time aviation telemetry and flight tracking intelligence for informational and research purposes. The data provided is aggregated from public sources and community feeders.</p>
          
          <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200 my-6">
            <strong>CRITICAL SAFETY WARNING:</strong> The data provided by Aervyn is NOT intended for aeronautical navigation or operational use. Do not use this service for flight planning, separation of aircraft, or emergency response.
          </div>

          <h2 className="text-white mt-8 mb-4">3. Intellectual Property</h2>
          <p>The Aervyn platform, including its AI engine (SkyLord), original code, and interface design are owned by Aervyn. Data aggregated from external providers remains subject to their respective licenses (e.g., ODbL for ADSB.lol data).</p>

          <h2 className="text-white mt-8 mb-4">4. API Usage and Rate Limiting</h2>
          <p>Users must not abuse our APIs or attempt to scrape the platform. We employ rate limiting to ensure fair usage. Excessive requests may result in temporary or permanent IP bans.</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
