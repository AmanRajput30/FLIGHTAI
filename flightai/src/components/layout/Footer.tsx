import Link from 'next/link';
import { Plane } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-black/80 border-t border-white/10 pt-16 pb-8 px-6 text-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Plane className="w-6 h-6 text-yellow-400" />
            <span className="font-bold text-xl tracking-tight text-white">Averyn</span>
          </Link>
          <p className="text-gray-400">
            Real-time global aviation intelligence. Independent, accurate, and community-driven.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-bold text-white mb-2">Product</h3>
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Live Map</Link>
          <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link>
          <Link href="/airport" className="text-gray-400 hover:text-white transition-colors">Airports Directory</Link>
          <Link href="/airline" className="text-gray-400 hover:text-white transition-colors">Airlines Directory</Link>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-bold text-white mb-2">Company</h3>
          <Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link>
          <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
          <Link href="/status" className="text-gray-400 hover:text-white transition-colors">System Status</Link>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-bold text-white mb-2">Legal & Data</h3>
          <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/data-sources" className="text-gray-400 hover:text-white transition-colors">Data Sources</Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-xs">
        <p>© {new Date().getFullYear()} Averyn. All rights reserved.</p>
        <p>
          Live aircraft data provided by <a href="https://adsb.lol" target="_blank" rel="noreferrer" className="text-yellow-500 hover:underline">ADSB.lol</a> under the <a href="https://opendatacommons.org/licenses/odbl/1-0/" target="_blank" rel="noreferrer" className="text-yellow-500 hover:underline">ODbL 1.0 License</a>.
        </p>
      </div>
    </footer>
  );
}
