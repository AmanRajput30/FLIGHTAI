"use client";

import { Plane, Eye, Layers } from 'lucide-react';
import Link from 'next/link';
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
    <header className={`h-16 border-b border-[var(--color-instrument-grey)] bg-[var(--color-cockpit-black)] z-40 relative w-full flex items-center justify-between px-6`}>
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Plane className="w-5 h-5 text-[var(--color-horizon-blue)]" />
          <span className="font-bold text-lg tracking-widest text-[var(--color-instrument-white)] uppercase font-[family-name:var(--font-labels)]">Aervyn</span>
          <span className="text-[10px] text-[var(--color-horizon-blue)] font-[family-name:var(--font-numerals)] ml-1 border border-[var(--color-horizon-blue)] px-1 rounded-[2px] leading-tight">V2.0</span>
        </Link>
        {!isCompact && (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
            <CockpitButton as={Link} href="/dashboard" variant="selector" isActive={pathname === '/dashboard'}>Live Map</CockpitButton>
            <CockpitButton as={Link} href="/airport" variant="selector" isActive={pathname?.startsWith('/airport')}>Airports</CockpitButton>
            <CockpitButton as={Link} href="/airline" variant="selector" isActive={pathname?.startsWith('/airline')}>Airlines</CockpitButton>
            <CockpitButton as={Link} href="/pricing" variant="selector" isActive={pathname === '/pricing'}>Pricing</CockpitButton>
            <CockpitButton as={Link} href="/about" variant="selector" isActive={pathname === '/about'}>About</CockpitButton>
          </nav>
        )}
      </div>
      
      <div className={`${isCompact ? 'flex-1 max-w-xl mx-8' : 'w-64 mx-4'}`}>
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-5">
        {/* Map Mode Toggle (Only show on compact map view) */}
        {isCompact && (
          <div className="flex relative items-center">
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
               <span className="absolute -bottom-5 right-0 text-[9px] text-[var(--color-warning-red)] whitespace-nowrap font-bold">FPS GUARDIAN ACTIVE</span>
            )}
          </div>
        )}

        {isCompact && (
          systemStatus === 'live' ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-[2px] bg-[#050505] border border-[var(--color-instrument-grey)] text-[var(--color-horizon-blue)] text-[10px] font-bold uppercase tracking-widest font-[family-name:var(--font-labels)]">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full bg-[var(--color-horizon-blue)] opacity-75"></span><span className="relative inline-flex h-2 w-2 bg-[var(--color-horizon-blue)]"></span></span>
              SYSTEM LIVE
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-[2px] bg-[#1a0000] border border-[var(--color-warning-red)] text-[var(--color-warning-red)] text-[10px] font-bold uppercase tracking-widest font-[family-name:var(--font-labels)]">
              <span className="relative flex h-2 w-2"><span className="relative inline-flex h-2 w-2 bg-[var(--color-warning-red)]"></span></span>
              DEGRADED
            </div>
          )
        )}
        
        <UserMenu />
      </div>
    </header>
  );
}
