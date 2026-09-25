import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="w-full bg-[#07111F] border-t border-slate-800 pt-12 pb-8 px-6 text-sm mt-auto pointer-events-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-0 mb-12 border-l border-t border-slate-800">
        <div className="flex flex-col gap-4 p-6 border-r border-b border-slate-800 bg-[#0F172A] relative overflow-hidden">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity relative z-10 w-fit">
            <Image src="/logo.png" alt="Aervyn Logo" width={24} height={24} className="object-contain" />
            <span className="font-bold text-xl tracking-tight text-white">Aervyn</span>
          </Link>
          <p className="text-slate-400 text-sm leading-relaxed mt-2 relative z-10">
            Real-time global aviation intelligence. Independent, accurate, and community-driven.
          </p>
        </div>

        <div className="flex flex-col gap-2 p-6 border-r border-b border-slate-800 bg-[#07111F]">
          <h3 className="font-semibold text-white mb-3 text-sm">Product</h3>
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors w-full">Live Map</Link>
          <Link href="/pricing" className="text-sm text-slate-400 hover:text-white transition-colors w-full">Pricing</Link>
        </div>

        <div className="flex flex-col gap-2 p-6 border-r border-b border-slate-800 bg-[#07111F]">
          <h3 className="font-semibold text-white mb-3 text-sm">Company</h3>
          <Link href="/about" className="text-sm text-slate-400 hover:text-white transition-colors w-full">About</Link>
          <Link href="/contact" className="text-sm text-slate-400 hover:text-white transition-colors w-full">Contact</Link>
          <Link href="/status" className="text-sm text-slate-400 hover:text-white transition-colors w-full">Status</Link>
        </div>

        <div className="flex flex-col gap-2 p-6 border-r border-b border-slate-800 bg-[#07111F]">
          <h3 className="font-semibold text-white mb-3 text-sm">Legal & Data</h3>
          <Link href="/terms" className="text-sm text-slate-400 hover:text-white transition-colors w-full">Terms</Link>
          <Link href="/privacy" className="text-sm text-slate-400 hover:text-white transition-colors w-full">Privacy</Link>
          <Link href="/data-sources" className="text-sm text-slate-400 hover:text-white transition-colors w-full">Data Sources</Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} Aervyn. All rights reserved.</p>
        <p>
          Live data provided by <a href="https://adsb.lol" target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white transition-colors underline decoration-slate-600 underline-offset-4">ADSB.lol</a> under the <a href="https://opendatacommons.org/licenses/odbl/1-0/" target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white transition-colors underline decoration-slate-600 underline-offset-4">ODbL 1.0 License</a>.
        </p>
      </div>
    </footer>
  );
}
