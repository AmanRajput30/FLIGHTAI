"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import GlobalSearch from '../search/GlobalSearch';
import UserMenu from '../UserMenu';
import { useUIStore } from '@/store/useUIStore';
import { useFlightStore } from '@/store/useFlightStore';
import { UTCClock } from './UTCClock';
import { FlightStatus } from '../ui/FlightStatus';
import { AlertBadge } from '../ui/AlertBadge';

export default function Header() {
  const { systemStatus } = useUIStore();
  const flights = useFlightStore((state) => state.flights);
  const aircraftCount = flights.length;

  return (
    <header className="h-14 border-b border-aervyn-border-subtle bg-aervyn-bg-dark z-50 relative w-full flex items-center justify-between px-4 drop-shadow-md shrink-0">
      
      {/* LEFT: Branding & Time */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
          <Image src="/logo.png" alt="Aervyn Logo" width={20} height={20} className="object-contain" />
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-lg tracking-widest text-aervyn-text-primary font-labels uppercase group-hover:text-aervyn-status-cyan transition-colors">AERVYN</span>
            <span className="text-aervyn-border-active hidden sm:inline">|</span>
            <span className="text-[10px] tracking-[0.2em] text-aervyn-text-secondary font-bold uppercase hidden sm:inline">Ops</span>
          </div>
        </Link>
        <div className="hidden md:block h-6 w-px bg-aervyn-border-subtle mx-2" />
        <UTCClock className="hidden md:flex" />
      </div>

      {/* CENTER: Search */}
      <div className="flex-1 max-w-xl mx-4 lg:mx-8 hidden sm:block">
        <GlobalSearch />
      </div>

      {/* RIGHT: Operational Stats, Alerts, & User Menu */}
      <div className="flex items-center gap-5">
        
        {/* Tracked Aircraft Count */}
        <div className="hidden lg:flex flex-col items-end mr-2">
          <span className="text-[9px] tracking-widest uppercase text-aervyn-text-tertiary font-labels">Tracked Aircraft</span>
          <div className="font-telemetry text-aervyn-text-primary text-sm leading-none flex items-baseline gap-1">
            {aircraftCount.toLocaleString()}
          </div>
        </div>

        {/* Live Indicator */}
        <div className="hidden sm:block">
          {systemStatus === 'live' ? (
            <FlightStatus statusText="System Live" state="green" />
          ) : (
            <FlightStatus statusText="Degraded" state="amber" />
          )}
        </div>

        {/* Alerts (Phase 8 placeholder) */}
        <div className="hidden md:block">
          <AlertBadge level="info" message="0 Alerts" className="opacity-50" />
        </div>
        
        <div className="h-6 w-px bg-aervyn-border-subtle mx-2 hidden sm:block" />

        <UserMenu />
      </div>
      
    </header>
  );
}

