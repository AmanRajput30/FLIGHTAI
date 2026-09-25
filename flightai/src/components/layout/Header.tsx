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
    <header className="h-16 border-b border-aervyn-border-dark bg-aervyn-bg-dark z-50 relative w-full flex items-center justify-between px-6 shrink-0">
      
      {/* LEFT: Branding & Time */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
          <Image src="/logo.png" alt="Aervyn Logo" width={24} height={24} className="object-contain" />
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-lg tracking-wide text-aervyn-text-dark-primary group-hover:text-aervyn-primary transition-colors">AERVYN</span>
            <span className="text-aervyn-border-dark-subtle hidden sm:inline">|</span>
            <span className="text-xs text-aervyn-text-dark-secondary font-medium hidden sm:inline">Operations</span>
          </div>
        </Link>
        <div className="hidden md:block h-6 w-px bg-aervyn-border-dark mx-2" />
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
          <span className="text-xs text-aervyn-text-dark-muted font-medium mb-0.5">Tracked Aircraft</span>
          <div className="text-aervyn-text-dark-primary text-sm font-semibold flex items-baseline gap-1">
            {aircraftCount.toLocaleString()}
          </div>
        </div>

        <div className="h-6 w-px bg-aervyn-border-dark mx-2 hidden sm:block" />

        <UserMenu />
      </div>
      
    </header>
  );
}

