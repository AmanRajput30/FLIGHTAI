import Link from 'next/link';
import { Plane } from 'lucide-react';
import { CockpitButton } from '../ui/CockpitButton';

export default function Footer() {
  return (
    <footer className="w-full bg-[var(--color-cockpit-black)] border-t border-[var(--color-instrument-grey)] pt-12 pb-8 px-6 text-sm mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-0 mb-12 border-l border-t border-[var(--color-instrument-grey)]">
        <div className="flex flex-col gap-4 p-6 border-r border-b border-[var(--color-instrument-grey)] bg-[#050505]">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Plane size={16} strokeWidth={1.5} className="text-[var(--color-horizon-blue)]" />
            <span className="font-bold text-xl tracking-widest text-[var(--color-instrument-white)] uppercase font-[family-name:var(--font-labels)]">Aervyn</span>
            <span className="text-[10px] text-[var(--color-horizon-blue)] font-[family-name:var(--font-numerals)] ml-1 border border-[var(--color-horizon-blue)] px-1 rounded-[2px] leading-tight">V2.0</span>
          </Link>
          <p className="text-[var(--color-instrument-grey)] text-[10px] uppercase tracking-widest leading-relaxed font-[family-name:var(--font-labels)] mt-2">
            Real-time global aviation intelligence. Independent, accurate, and community-driven.
          </p>
        </div>

        <div className="flex flex-col gap-2 p-6 border-r border-b border-[var(--color-instrument-grey)]">
          <h3 className="font-bold text-[var(--color-instrument-white)] mb-2 uppercase tracking-widest text-[10px] font-[family-name:var(--font-labels)]">Product</h3>
          <CockpitButton as={Link} href="/dashboard" variant="selector" className="justify-start">Live Map</CockpitButton>
          <CockpitButton as={Link} href="/pricing" variant="selector" className="justify-start">Pricing</CockpitButton>
          <CockpitButton as={Link} href="/airport" variant="selector" className="justify-start">Airports</CockpitButton>
          <CockpitButton as={Link} href="/airline" variant="selector" className="justify-start">Airlines</CockpitButton>
        </div>

        <div className="flex flex-col gap-2 p-6 border-r border-b border-[var(--color-instrument-grey)]">
          <h3 className="font-bold text-[var(--color-instrument-white)] mb-2 uppercase tracking-widest text-[10px] font-[family-name:var(--font-labels)]">Company</h3>
          <CockpitButton as={Link} href="/about" variant="selector" className="justify-start">About</CockpitButton>
          <CockpitButton as={Link} href="/contact" variant="selector" className="justify-start">Contact</CockpitButton>
          <CockpitButton as={Link} href="/status" variant="selector" className="justify-start">Status</CockpitButton>
        </div>

        <div className="flex flex-col gap-2 p-6 border-r border-b border-[var(--color-instrument-grey)]">
          <h3 className="font-bold text-[var(--color-instrument-white)] mb-2 uppercase tracking-widest text-[10px] font-[family-name:var(--font-labels)]">Legal & Data</h3>
          <CockpitButton as={Link} href="/terms" variant="selector" className="justify-start">Terms</CockpitButton>
          <CockpitButton as={Link} href="/privacy" variant="selector" className="justify-start">Privacy</CockpitButton>
          <CockpitButton as={Link} href="/data-sources" variant="selector" className="justify-start">Data Sources</CockpitButton>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[var(--color-instrument-grey)] text-[10px] uppercase tracking-widest font-[family-name:var(--font-labels)]">
        <p>© {new Date().getFullYear()} Aervyn. All rights reserved.</p>
        <p>
          Live data provided by <a href="https://adsb.lol" target="_blank" rel="noreferrer" className="text-white hover:underline">ADSB.lol</a> under the <a href="https://opendatacommons.org/licenses/odbl/1-0/" target="_blank" rel="noreferrer" className="text-white hover:underline">ODbL 1.0 License</a>.
        </p>
      </div>
    </footer>
  );
}
