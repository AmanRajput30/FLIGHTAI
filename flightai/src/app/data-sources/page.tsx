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
    <div className="flex flex-col min-h-screen bg-aervyn-bg-dark] text-foreground">
      <Header />
      
      <main className="flex-1 max-w-4xl mx-auto px-6 py-24 w-full">
        <h1 className="text-3xl font-black mb-8 text-white flex items-center gap-3">
          <Database className="w-8 h-8 text-blue-400" /> Data Sources
        </h1>
        
        <div className="prose prose-invert prose-sm text-gray-400 mb-12">
          Aervyn is built on the shoulders of giants. We aggregate data from open communities and premium APIs to provide a comprehensive view of global aviation.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
              <Database className="w-5 h-5 text-yellow-500" />
            </div>
            <h3 className="font-bold text-white mb-2 text-lg">ADSB.lol</h3>
            <p className="text-sm text-gray-400 mb-4">Our primary source for real-time, unfiltered ADS-B telemetry. Powered by a global community of SDR enthusiasts.</p>
            <a href="https://adsb.lol" target="_blank" rel="noreferrer" className="text-yellow-400 hover:underline text-sm font-medium">Visit ADSB.lol →</a>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
              <Cloud className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="font-bold text-white mb-2 text-lg">Open-Meteo</h3>
            <p className="text-sm text-gray-400 mb-4">Provides the live meteorological data (temperature, wind, weather codes) at aircraft coordinates.</p>
            <a href="https://open-meteo.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-sm font-medium">Visit Open-Meteo →</a>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <MapPin className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="font-bold text-white mb-2 text-lg">AeroDataBox</h3>
            <p className="text-sm text-gray-400 mb-4">Premium routing engine used to determine origin and destination airports based on live callsigns.</p>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="font-bold text-white mb-2 text-lg">Groq & Llama 3</h3>
            <p className="text-sm text-gray-400 mb-4">The inference engine and LLM model powering SkyLord, enabling sub-second natural language analysis.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
