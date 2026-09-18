"use client";

import { Eye, Layers } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import GlobalSearch from '../search/GlobalSearch';
import UserMenu from '../UserMenu';
import { useUIStore } from '@/store/useUIStore';
import { CockpitButton } from '../ui/CockpitButton';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  variant?: 'compact' | 'full';
}

export default function Header({ variant = 'compact' }: HeaderProps) {
  const { systemStatus, mapMode, performanceMode, setMapMode, setPerformanceMode } = useUIStore();
  const pathname = usePathname();

  const isCompact = variant === 'compact';

  return (
    <header className={`h-16 border-b border-border-subtle bg-cockpit-black z-40 relative w-full flex items-center justify-between px-6 drop-shadow-md`}>
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image src="/logo.png" alt="Aervyn Logo" width={24} height={24} className="object-contain" />
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-xl tracking-widest text-instrument-white uppercase">AERVYN</span>
            <span className="text-instrument-grey">|</span>
            <span className="text-xs tracking-[0.2em] text-horizon-blue font-bold uppercase">Cockpit</span>
          </div>
        </Link>
        {!isCompact && (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-instrument-grey">
            <CockpitButton href="/dashboard" variant="selector" isActive={pathname === '/dashboard'}>Live Map</CockpitButton>
            <CockpitButton href="/pricing" variant="selector" isActive={pathname === '/pricing'}>Pricing</CockpitButton>
            <CockpitButton href="/about" variant="selector" isActive={pathname === '/about'}>About</CockpitButton>
          </nav>
        )}
      </div>
      
      <div className={`${isCompact ? 'hidden md:block flex-1 max-w-xl mx-8' : 'hidden md:block w-64 mx-4'}`}>
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-5">
        {/* Map Mode Toggle */}
        {isCompact && (
          <div className="hidden md:flex relative items-center">
            <CockpitButton
              variant="toggle"
              isActive={mapMode === 'dark'}
              onClick={() => { setMapMode('dark'); setPerformanceMode(false); }}
              className="rounded-r-none border-r-0"
            >
              <Eye size={14} strokeWidth={2} className="mr-1" /> Dark
            </CockpitButton>
            <CockpitButton
              variant="toggle"
              isActive={mapMode === 'satellite'}
              onClick={() => { setMapMode('satellite'); setPerformanceMode(false); }}
              disabled={performanceMode}
              title={performanceMode ? "Disabled due to low FPS" : "Esri World Imagery"}
              className="rounded-l-none"
            >
              <Layers size={14} strokeWidth={2} className="mr-1" /> Premium
            </CockpitButton>
            {performanceMode && (
               <span className="absolute -bottom-5 right-0 text-[9px] text-warning-red whitespace-nowrap font-bold">FPS GUARDIAN ACTIVE</span>
            )}
          </div>
        )}

        {isCompact && (
          systemStatus === 'live' ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-cockpit-panel-raised border border-border-subtle text-horizon-blue text-[10px] font-bold uppercase tracking-widest font-labels">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full bg-horizon-blue opacity-75"></span><span className="relative inline-flex h-2 w-2 bg-horizon-blue"></span></span>
              SYSTEM LIVE
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-warning-red/10 border border-warning-red text-warning-red text-[10px] font-bold uppercase tracking-widest font-labels">
              <span className="relative flex h-2 w-2"><span className="relative inline-flex h-2 w-2 bg-warning-red"></span></span>
              DEGRADED
            </div>
          )
        )}
        
        <UserMenu />
      </div>
    </header>
  );
}
