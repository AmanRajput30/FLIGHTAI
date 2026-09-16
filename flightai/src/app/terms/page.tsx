import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0a0c10] text-foreground">
      <Header variant="full" />
      
      <main className="flex-1 max-w-4xl mx-auto px-6 py-24 w-full">
        <h1 className="text-4xl font-black mb-8 text-white tracking-tight">Terms of Service</h1>
        
        <div className="prose prose-invert max-w-none text-gray-300 space-y-6">
          <p>Last Updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>By accessing or using Averyn, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.</p>
          
          <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Description of Service</h2>
          <p>Averyn provides real-time aviation telemetry and flight tracking intelligence for informational and research purposes. The data provided is aggregated from public sources and community feeders.</p>
          
          <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Not for Operational Use</h2>
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 font-medium">
            WARNING: The data provided by Averyn is NOT intended for aeronautical navigation or operational use. Do not use this service for flight planning, separation of aircraft, or emergency response.
          </div>
          
          <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Intellectual Property</h2>
          <p>The Averyn platform, including its AI engine (SkyLord), original code, and interface design are owned by Averyn. Data aggregated from external providers remains subject to their respective licenses (e.g., ODbL for ADSB.lol data).</p>
          
          <h2 className="text-xl font-bold text-white mt-8 mb-4">5. API Usage and Rate Limiting</h2>
          <p>Users must not abuse our APIs or attempt to scrape the platform. We employ rate limiting to ensure fair usage. Excessive requests may result in temporary or permanent IP bans.</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
