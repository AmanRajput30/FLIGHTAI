import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="w-full bg-aervyn-bg-dark border-t border-aervyn-border-dark pt-12 pb-8 px-6 text-sm mt-auto pointer-events-auto font-inter">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-0 mb-12 border-l border-t border-aervyn-border-dark">
        <div className="flex flex-col gap-4 p-6 border-r border-b border-aervyn-border-dark bg-aervyn-surface-dark relative overflow-hidden shadow-inner">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity relative z-10 w-fit">
            <Image src="/logo.png" alt="Aervyn Logo" width={24} height={24} className="object-contain" />
            <span className="font-bold text-xl tracking-tight text-aervyn-text-dark-primary">Aervyn</span>
          </Link>
          <p className="text-aervyn-text-dark-secondary text-sm leading-relaxed mt-2 relative z-10">
            Real-time global aviation intelligence. Independent, accurate, and community-driven.
          </p>
        </div>

        <div className="flex flex-col gap-2 p-6 border-r border-b border-aervyn-border-dark bg-aervyn-bg-dark">
          <h3 className="font-semibold text-aervyn-text-dark-primary mb-3 text-sm">Product</h3>
          <Link href="/dashboard" className="text-sm text-aervyn-text-dark-secondary hover:text-aervyn-text-dark-primary transition-colors w-full">Live Map</Link>
          <Link href="/pricing" className="text-sm text-aervyn-text-dark-secondary hover:text-aervyn-text-dark-primary transition-colors w-full">Pricing</Link>
        </div>

        <div className="flex flex-col gap-2 p-6 border-r border-b border-aervyn-border-dark bg-aervyn-bg-dark">
          <h3 className="font-semibold text-aervyn-text-dark-primary mb-3 text-sm">Company</h3>
          <Link href="/about" className="text-sm text-aervyn-text-dark-secondary hover:text-aervyn-text-dark-primary transition-colors w-full">About</Link>
          <Link href="/contact" className="text-sm text-aervyn-text-dark-secondary hover:text-aervyn-text-dark-primary transition-colors w-full">Contact</Link>
          <Link href="/status" className="text-sm text-aervyn-text-dark-secondary hover:text-aervyn-text-dark-primary transition-colors w-full">Status</Link>
        </div>

        <div className="flex flex-col gap-2 p-6 border-r border-b border-aervyn-border-dark bg-aervyn-bg-dark">
          <h3 className="font-semibold text-aervyn-text-dark-primary mb-3 text-sm">Legal & Data</h3>
          <Link href="/terms" className="text-sm text-aervyn-text-dark-secondary hover:text-aervyn-text-dark-primary transition-colors w-full">Terms</Link>
          <Link href="/privacy" className="text-sm text-aervyn-text-dark-secondary hover:text-aervyn-text-dark-primary transition-colors w-full">Privacy</Link>
          <Link href="/data-sources" className="text-sm text-aervyn-text-dark-secondary hover:text-aervyn-text-dark-primary transition-colors w-full">Data Sources</Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-aervyn-text-dark-muted text-sm font-medium">
        <p>© {new Date().getFullYear()} Aervyn. All rights reserved.</p>
        <p>
          Live data provided by <a href="https://adsb.lol" target="_blank" rel="noreferrer" className="text-aervyn-text-dark-secondary hover:text-aervyn-text-dark-primary transition-colors underline decoration-aervyn-border-dark underline-offset-4">ADSB.lol</a> under the <a href="https://opendatacommons.org/licenses/odbl/1-0/" target="_blank" rel="noreferrer" className="text-aervyn-text-dark-secondary hover:text-aervyn-text-dark-primary transition-colors underline decoration-aervyn-border-dark underline-offset-4">ODbL 1.0 License</a>.
        </p>
      </div>
    </footer>
  );
}
