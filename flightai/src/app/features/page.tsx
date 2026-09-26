import type { Metadata } from "next";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Activity, Shield, Map } from 'lucide-react';

export const metadata: Metadata = {
  title: "AERVYN Features",
  description: "Explore the powerful features of AERVYN, including real-time ADS-B tracking, 3D telemetry, and predictive AI flight paths.",
  openGraph: {
    title: "AERVYN Features",
    description: "Explore the powerful features of AERVYN, including real-time ADS-B tracking, 3D telemetry, and predictive AI flight paths.",
    url: "https://aervyn.in/features",
  },
};

export default function FeaturesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-aervyn-bg-dark text-aervyn-text-primary font-inter">
      <Header />
      
      <main className="flex-1 max-w-5xl mx-auto px-6 py-24 w-full">
        <div className="text-center mb-16 border-b border-aervyn-border-dark pb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-aervyn-text-dark-primary tracking-tight">
            Features Built for Scale
          </h1>
          <p className="text-lg text-aervyn-text-dark-secondary max-w-2xl mx-auto leading-relaxed">
            AERVYN provides unparalleled visibility into global airspace through a suite of advanced features.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-aervyn-surface-dark p-8 rounded-xl border border-aervyn-border-dark hover:border-aervyn-border-dark-subtle transition-colors flex flex-col gap-4 shadow-xl">
            <div className="w-12 h-12 rounded-lg bg-aervyn-primary/10 flex items-center justify-center border border-aervyn-primary/20">
              <Activity className="w-6 h-6 text-aervyn-primary" />
            </div>
            <h2 className="text-xl font-bold text-aervyn-text-dark-primary mt-2">Live Global Tracking</h2>
            <p className="text-sm text-aervyn-text-dark-muted leading-relaxed">
              Track tens of thousands of aircraft simultaneously using our redundant ADS-B network architecture and high-performance spatial hashing.
            </p>
          </div>
          
          <div className="bg-aervyn-surface-dark p-8 rounded-xl border border-aervyn-border-dark hover:border-aervyn-border-dark-subtle transition-colors flex flex-col gap-4 shadow-xl">
            <div className="w-12 h-12 rounded-lg bg-aervyn-status-cyan/10 flex items-center justify-center border border-aervyn-status-cyan/20">
              <Map className="w-6 h-6 text-aervyn-status-cyan" />
            </div>
            <h2 className="text-xl font-bold text-aervyn-text-dark-primary mt-2">Deep Telemetry</h2>
            <p className="text-sm text-aervyn-text-dark-muted leading-relaxed">
              Access granular data instantly, including Mach speed, vertical rate, true track, barometric altitude, and live squawk codes.
            </p>
          </div>
          
          <div className="bg-aervyn-surface-dark p-8 rounded-xl border border-aervyn-border-dark hover:border-aervyn-border-dark-subtle transition-colors flex flex-col gap-4 shadow-xl">
            <div className="w-12 h-12 rounded-lg bg-aervyn-status-warning/10 flex items-center justify-center border border-aervyn-status-warning/20">
              <Shield className="w-6 h-6 text-aervyn-status-warning" />
            </div>
            <h2 className="text-xl font-bold text-aervyn-text-dark-primary mt-2">SkyLord AI Engine</h2>
            <p className="text-sm text-aervyn-text-dark-muted leading-relaxed">
              Ask complex natural language queries about airspace congestion, historical delays, and aircraft parameters via our integrated LLM layer.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
