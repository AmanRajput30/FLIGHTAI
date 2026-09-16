"use client";

import React from 'react';
import Link from 'next/link';

export default function DataAttribution() {
  return (
    <div className="absolute bottom-6 right-6 z-[1000] pointer-events-auto">
      <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-lg shadow-xl px-4 py-2 flex flex-col items-end">
        <span className="text-[11px] text-gray-400 font-medium tracking-wide">LIVE AIRCRAFT DATA</span>
        <div className="flex items-center space-x-1.5 mt-0.5">
          <a href="https://adsb.lol" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[#fbbf24] hover:text-[#fcd34d] transition-colors">
            ADSB.lol
          </a>
          <span className="text-gray-500 text-xs">·</span>
          <Link href="/data-sources" className="text-xs text-sky-400 hover:text-sky-300 transition-colors">
            ODbL 1.0
          </Link>
        </div>
      </div>
    </div>
  );
}
