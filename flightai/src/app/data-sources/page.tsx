import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Database, Zap, MapPin, Cloud } from 'lucide-react';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Sources",
  description: "AERVYN uses high-fidelity ADS-B networks and crowdsourced aviation telemetry to deliver real-time flight tracking globally.",
  openGraph: {
    title: "Data Sources",
    description: "AERVYN uses high-fidelity ADS-B networks and crowdsourced aviation telemetry to deliver real-time flight tracking globally.",
    url: "https://aervyn.in/data-sources",
  },
};



export default function DataSourcesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-aervyn-bg-dark text-aervyn-text-primary font-inter">
      <Header />
      
      <main className="flex-1 max-w-4xl mx-auto px-6 py-24 w-full">
        <h1 className="text-3xl font-black mb-8 text-aervyn-text-dark-primary flex items-center gap-3">
          <Database className="w-8 h-8 text-aervyn-primary" /> Data Sources
        </h1>
        
        <div className="prose prose-invert prose-sm text-aervyn-text-dark-secondary mb-12">
          Aervyn is built on the shoulders of giants. We aggregate data from open communities and premium APIs to provide a comprehensive view of global aviation.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-aervyn-surface-dark border border-aervyn-border-dark hover:border-aervyn-border-dark-subtle transition-colors rounded-2xl p-6 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-aervyn-status-warning/10 flex items-center justify-center mb-4 border border-aervyn-status-warning/20">
              <Database className="w-5 h-5 text-aervyn-status-warning" />
            </div>
            <h3 className="font-bold text-aervyn-text-dark-primary mb-2 text-lg">ADSB.lol</h3>
            <p className="text-sm text-aervyn-text-dark-muted mb-4 leading-relaxed">Our primary source for real-time, unfiltered ADS-B telemetry. Powered by a global community of SDR enthusiasts.</p>
            <a href="https://adsb.lol" target="_blank" rel="noreferrer" className="text-aervyn-status-warning hover:underline text-sm font-medium">Visit ADSB.lol →</a>
          </div>

          <div className="bg-aervyn-surface-dark border border-aervyn-border-dark hover:border-aervyn-border-dark-subtle transition-colors rounded-2xl p-6 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-aervyn-primary/10 flex items-center justify-center mb-4 border border-aervyn-primary/20">
              <Cloud className="w-5 h-5 text-aervyn-primary" />
            </div>
            <h3 className="font-bold text-aervyn-text-dark-primary mb-2 text-lg">Open-Meteo</h3>
            <p className="text-sm text-aervyn-text-dark-muted mb-4 leading-relaxed">Provides the live meteorological data (temperature, wind, weather codes) at aircraft coordinates.</p>
            <a href="https://open-meteo.com" target="_blank" rel="noreferrer" className="text-aervyn-primary hover:underline text-sm font-medium">Visit Open-Meteo →</a>
          </div>

          <div className="bg-aervyn-surface-dark border border-aervyn-border-dark hover:border-aervyn-border-dark-subtle transition-colors rounded-2xl p-6 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-aervyn-status-success/10 flex items-center justify-center mb-4 border border-aervyn-status-success/20">
              <MapPin className="w-5 h-5 text-aervyn-status-success" />
            </div>
            <h3 className="font-bold text-aervyn-text-dark-primary mb-2 text-lg">AeroDataBox</h3>
            <p className="text-sm text-aervyn-text-dark-muted mb-4 leading-relaxed">Premium routing engine used to determine origin and destination airports based on live callsigns.</p>
          </div>

          <div className="bg-aervyn-surface-dark border border-aervyn-border-dark hover:border-aervyn-border-dark-subtle transition-colors rounded-2xl p-6 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-aervyn-status-cyan/10 flex items-center justify-center mb-4 border border-aervyn-status-cyan/20">
              <Zap className="w-5 h-5 text-aervyn-status-cyan" />
            </div>
            <h3 className="font-bold text-aervyn-text-dark-primary mb-2 text-lg">Groq & Llama 3</h3>
            <p className="text-sm text-aervyn-text-dark-muted mb-4 leading-relaxed">The inference engine and LLM model powering SkyLord, enabling sub-second natural language analysis.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
