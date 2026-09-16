import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { CheckCircle2 } from 'lucide-react';

export default function StatusPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-cockpit-black)] text-foreground">
      <Header variant="full" />
      
      <main className="flex-1 max-w-4xl mx-auto px-6 py-24 w-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black text-white tracking-tight">System Status</h1>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 font-medium">
            <CheckCircle2 className="w-5 h-5" /> All Systems Operational
          </div>
        </div>
        
        <p className="text-gray-400 mb-12">
          Real-time status of Averyn services, data providers, and external APIs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-6">Core Services</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Frontend Application</span>
                <span className="text-green-400 text-sm font-bold">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">API Gateway</span>
                <span className="text-green-400 text-sm font-bold">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">SkyLord AI Engine</span>
                <span className="text-green-400 text-sm font-bold">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Socket.IO Real-time Stream</span>
                <span className="text-green-400 text-sm font-bold">Operational</span>
              </div>
            </div>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-6">Data Providers</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">ADSB.lol (Global Telemetry)</span>
                <span className="text-green-400 text-sm font-bold">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Open-Meteo (Weather)</span>
                <span className="text-green-400 text-sm font-bold">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">AeroDataBox (Routes)</span>
                <span className="text-green-400 text-sm font-bold">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">ADS-B DB (Aircraft Meta)</span>
                <span className="text-green-400 text-sm font-bold">Operational</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="font-bold text-white mb-2">Past Incidents</h3>
          <p className="text-gray-400 text-sm">No incidents reported in the last 30 days.</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
