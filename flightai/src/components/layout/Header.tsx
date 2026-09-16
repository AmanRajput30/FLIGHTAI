"use client";

import { Plane, Search, Eye, Layers } from 'lucide-react';
import Link from 'next/link';
import GlobalSearch from '../search/GlobalSearch';
import UserMenu from '../UserMenu';
import { useUIStore } from '@/store/useUIStore';

interface HeaderProps {
  variant?: 'compact' | 'full';
}

export default function Header({ variant = 'compact' }: HeaderProps) {
  const { systemStatus, mapMode, performanceMode, setMapMode, setPerformanceMode } = useUIStore();

  const isCompact = variant === 'compact';

  return (
    <header className={`${isCompact ? 'h-16 border-b-0' : 'h-20 border-b border-white/10'} flex items-center justify-between px-6 glass-panel z-40 relative w-full`}>
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Plane className="w-6 h-6 text-yellow-400" />
          <span className="font-bold text-xl tracking-tight text-white">Averyn</span>
        </Link>
        {!isCompact && (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
            <Link href="/dashboard" className="hover:text-white transition-colors">Live Map</Link>
            <Link href="/airport" className="hover:text-white transition-colors">Airports</Link>
            <Link href="/airline" className="hover:text-white transition-colors">Airlines</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
          </nav>
        )}
      </div>
      
      <div className={`${isCompact ? 'flex-1 max-w-xl mx-8' : 'w-64 mx-4'}`}>
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-5">
        {/* Map Mode Toggle (Only show on compact map view) */}
        {isCompact && (
          <div className="flex bg-black/40 border border-white/10 rounded-full p-1 relative">
            <button 
              onClick={() => { setMapMode('dark'); setPerformanceMode(false); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all z-10 flex items-center gap-1.5 ${mapMode === 'dark' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
              <Eye className="w-3.5 h-3.5" /> Dark
            </button>
            <button 
              onClick={() => { setMapMode('satellite'); setPerformanceMode(false); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all z-10 flex items-center gap-1.5 ${mapMode === 'satellite' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'} ${performanceMode ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={performanceMode}
              title={performanceMode ? "Disabled due to low FPS" : "Esri World Imagery"}
            >
              <Layers className="w-3.5 h-3.5" /> Premium
            </button>
            {performanceMode && (
               <span className="absolute -bottom-5 right-0 text-[9px] text-red-400 whitespace-nowrap">Performance Mode Active (Low FPS)</span>
            )}
          </div>
        )}

        {isCompact && (
          systemStatus === 'live' ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
              LIVE
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium">
              <span className="relative flex h-2 w-2"><span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span></span>
              DEGRADED
            </div>
          )
        )}
        
        <UserMenu />
      </div>
    </header>
  );
}
