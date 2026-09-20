"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Plane, Crosshair, Map as MapIcon, AlertTriangle, BarChart2, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Live', icon: Home, href: '/dashboard' },
  { label: 'Flights', icon: Plane, href: '/dashboard?view=flights' },
  { label: 'Aircraft', icon: Crosshair, href: '/dashboard?view=aircraft' },
  { label: 'Airports', icon: MapIcon, href: '/dashboard?view=airports' },
  { label: 'Alerts', icon: AlertTriangle, href: '/status' },
  { label: 'Analytics', icon: BarChart2, href: '/dashboard?view=analytics' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="hidden md:flex flex-col border-r border-aervyn-border-subtle bg-aervyn-bg-dark h-full z-40 transition-all duration-300 ease-in-out"
      style={{ width: isHovered ? '200px' : '56px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <nav className="flex flex-col gap-2 mt-4 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href.includes('?') && pathname === '/dashboard' && false /* To be fixed when views exist */);
          // For now, highlight Live if on dashboard
          const isActuallyActive = item.label === 'Live' ? pathname === '/dashboard' : pathname === item.href;

          return (
            <Link 
              key={item.label}
              href={item.href}
              className={`flex items-center gap-4 px-2.5 py-2 rounded transition-colors group relative overflow-hidden ${
                isActuallyActive 
                  ? 'bg-aervyn-border-active/40 text-aervyn-text-primary' 
                  : 'text-aervyn-text-tertiary hover:bg-aervyn-panel-light hover:text-aervyn-text-primary'
              }`}
            >
              {isActuallyActive && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-aervyn-status-cyan" />
              )}
              <item.icon size={18} strokeWidth={2} className="shrink-0" />
              <span className={`font-labels text-[11px] font-bold tracking-widest uppercase transition-opacity duration-200 ${
                isHovered ? 'opacity-100 whitespace-nowrap' : 'opacity-0'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
