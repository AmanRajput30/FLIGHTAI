"use client";

import React from 'react';
import Link from 'next/link';

export default function DataSourcesPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 md:p-16 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <Link href="/" className="text-sky-400 hover:text-sky-300 text-sm mb-4 inline-block">&larr; Back to Map</Link>
          <h1 className="text-3xl font-bold mb-2">Data Sources & Legal Information</h1>
          <p className="text-gray-400">Averyn uses aviation data obtained from third-party and open-data providers.</p>
        </div>

        <section className="bg-slate-800 rounded-xl p-6 border border-white/5 shadow-xl">
          <h2 className="text-xl font-bold text-amber-400 mb-4">ADSB.lol</h2>
          <p className="mb-4 text-gray-300">
            Averyn uses live aircraft information obtained from <a href="https://adsb.lol" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">ADSB.lol</a>.
          </p>
          <p className="mb-4 text-gray-300">
            ADSB.lol's public database and API data is made available under the <strong>Open Database License (ODbL) 1.0</strong>.
          </p>
          <p className="mb-4 text-gray-300 text-sm">
            Averyn is not affiliated with, sponsored by, or endorsed by ADSB.lol unless a separate agreement states otherwise. 
          </p>
          <div className="bg-slate-900 rounded p-4 border border-rose-500/20 text-sm text-gray-400 mb-4">
            <strong>Disclaimer:</strong> Aircraft information may be delayed, incomplete, unavailable, or inaccurate and must not be relied upon for safety-critical aviation operations.
          </div>
          
          <h3 className="font-semibold text-gray-200 mt-6 mb-2">References</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-sky-400">
            <li><a href="https://adsb.lol" target="_blank" rel="noopener noreferrer" className="hover:underline">ADSB.lol Website</a></li>
            <li><a href="https://api.adsb.lol" target="_blank" rel="noopener noreferrer" className="hover:underline">ADSB.lol API Documentation</a></li>
            <li><a href="https://adsb.lol/privacy" target="_blank" rel="noopener noreferrer" className="hover:underline">ADSB.lol Privacy & License Information</a></li>
            <li><a href="https://opendatacommons.org/licenses/odbl/1-0/" target="_blank" rel="noopener noreferrer" className="hover:underline">Open Database License (ODbL) 1.0</a></li>
          </ul>
        </section>
        
        <section className="bg-slate-800 rounded-xl p-6 border border-white/5 shadow-xl">
          <h2 className="text-xl font-bold text-gray-200 mb-4">OpenSky Network</h2>
          <p className="text-gray-300 text-sm">
            Certain historical aircraft path integrations may fall back to the OpenSky Network. Averyn does not use OpenSky Network for live global tracking. 
          </p>
        </section>
      </div>
    </div>
  );
}
