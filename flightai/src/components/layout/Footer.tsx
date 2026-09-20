import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="w-full bg-aervyn-bg-dark border-t border-aervyn-border-subtle pt-12 pb-8 px-6 text-sm mt-auto font-labels pointer-events-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-0 mb-12 border-l border-t border-aervyn-border-subtle">
        <div className="flex flex-col gap-4 p-6 border-r border-b border-aervyn-border-subtle bg-aervyn-panel-base relative overflow-hidden">
          <div className="absolute inset-0 bg-aervyn-status-cyan/5 mix-blend-overlay pointer-events-none"></div>
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity relative z-10 w-fit">
            <Image src="/logo.png" alt="Aervyn Logo" width={24} height={24} className="object-contain" />
            <span className="font-extrabold text-xl tracking-widest text-aervyn-text-primary uppercase drop-shadow-md">Aervyn</span>
            <span className="text-[10px] text-aervyn-status-cyan font-bold ml-1 border border-aervyn-status-cyan/50 px-1 rounded-[2px] leading-tight drop-shadow-[0_0_5px_rgba(56,189,248,0.3)] bg-aervyn-status-cyan/10">V2.0</span>
          </Link>
          <p className="text-aervyn-text-tertiary text-[10px] uppercase tracking-widest leading-relaxed font-bold mt-2 relative z-10">
            Real-time global aviation intelligence. Independent, accurate, and community-driven.
          </p>
        </div>

        <div className="flex flex-col gap-2 p-6 border-r border-b border-aervyn-border-subtle bg-aervyn-bg-dark">
          <h3 className="font-bold text-aervyn-text-primary mb-2 uppercase tracking-widest text-[10px]">Product</h3>
          <Link href="/dashboard" className="text-[10px] text-aervyn-text-secondary hover:text-aervyn-text-primary hover:bg-aervyn-panel-light transition-colors px-3 py-2 rounded font-bold uppercase tracking-widest w-full">Live Map</Link>
          <Link href="/pricing" className="text-[10px] text-aervyn-text-secondary hover:text-aervyn-text-primary hover:bg-aervyn-panel-light transition-colors px-3 py-2 rounded font-bold uppercase tracking-widest w-full">Pricing</Link>
        </div>

        <div className="flex flex-col gap-2 p-6 border-r border-b border-aervyn-border-subtle bg-aervyn-bg-dark">
          <h3 className="font-bold text-aervyn-text-primary mb-2 uppercase tracking-widest text-[10px]">Company</h3>
          <Link href="/about" className="text-[10px] text-aervyn-text-secondary hover:text-aervyn-text-primary hover:bg-aervyn-panel-light transition-colors px-3 py-2 rounded font-bold uppercase tracking-widest w-full">About</Link>
          <Link href="/contact" className="text-[10px] text-aervyn-text-secondary hover:text-aervyn-text-primary hover:bg-aervyn-panel-light transition-colors px-3 py-2 rounded font-bold uppercase tracking-widest w-full">Contact</Link>
          <Link href="/status" className="text-[10px] text-aervyn-text-secondary hover:text-aervyn-text-primary hover:bg-aervyn-panel-light transition-colors px-3 py-2 rounded font-bold uppercase tracking-widest w-full">Status</Link>
        </div>

        <div className="flex flex-col gap-2 p-6 border-r border-b border-aervyn-border-subtle bg-aervyn-bg-dark">
          <h3 className="font-bold text-aervyn-text-primary mb-2 uppercase tracking-widest text-[10px]">Legal & Data</h3>
          <Link href="/terms" className="text-[10px] text-aervyn-text-secondary hover:text-aervyn-text-primary hover:bg-aervyn-panel-light transition-colors px-3 py-2 rounded font-bold uppercase tracking-widest w-full">Terms</Link>
          <Link href="/privacy" className="text-[10px] text-aervyn-text-secondary hover:text-aervyn-text-primary hover:bg-aervyn-panel-light transition-colors px-3 py-2 rounded font-bold uppercase tracking-widest w-full">Privacy</Link>
          <Link href="/data-sources" className="text-[10px] text-aervyn-text-secondary hover:text-aervyn-text-primary hover:bg-aervyn-panel-light transition-colors px-3 py-2 rounded font-bold uppercase tracking-widest w-full">Data Sources</Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-aervyn-text-tertiary text-[10px] uppercase tracking-widest font-bold">
        <p>© {new Date().getFullYear()} Aervyn. All rights reserved.</p>
        <p>
          Live data provided by <a href="https://adsb.lol" target="_blank" rel="noreferrer" className="text-aervyn-text-primary hover:text-aervyn-status-cyan transition-colors">ADSB.lol</a> under the <a href="https://opendatacommons.org/licenses/odbl/1-0/" target="_blank" rel="noreferrer" className="text-aervyn-text-primary hover:text-aervyn-status-cyan transition-colors">ODbL 1.0 License</a>.
        </p>
      </div>
    </footer>
  );
}
