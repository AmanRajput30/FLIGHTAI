"use client";

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { motion } from 'framer-motion';
import { M_PRESETS } from '@/lib/motion/presets';
import { useFlightStore } from '@/store/useFlightStore';
import { Plane, Navigation, Activity, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AircraftPage() {
  const { selectedFlight } = useFlightStore();

  return (
    <div className="h-screen w-screen bg-aervyn-bg-dark text-aervyn-text-primary overflow-hidden relative flex">
      <Sidebar />

      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 mt-14 lg:mt-[72px]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={M_PRESETS.panel}
            className="max-w-6xl mx-auto"
          >
            {!selectedFlight ? (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="w-20 h-20 bg-aervyn-surface-dark-elevated rounded-full flex items-center justify-center mb-6">
                  <Plane size={32} className="text-aervyn-text-dark-muted" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">No Aircraft Selected</h2>
                <p className="text-aervyn-text-dark-secondary mb-6 max-w-md">
                  Select a flight from the Live Tracking map or choose an aircraft from your Fleet Management page to view detailed telemetry.
                </p>
                <div className="flex gap-4">
                  <Link href="/live-tracking" className="bg-aervyn-primary hover:bg-aervyn-primary-light text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
                    Go to Map
                  </Link>
                  <Link href="/fleet" className="bg-aervyn-surface-dark-elevated hover:bg-aervyn-surface-dark-active border border-aervyn-border-dark text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
                    View Fleet
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-aervyn-primary/20 rounded-xl flex items-center justify-center border border-aervyn-primary/30">
                    <Plane size={32} className="text-aervyn-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1">
                      {selectedFlight.flightNumber || selectedFlight.callsign || 'Unknown'}
                    </h1>
                    <p className="text-sm text-aervyn-text-dark-secondary flex items-center gap-2">
                      <span className="flex items-center gap-1"><Navigation size={14}/> ICAO24: {selectedFlight.icao24}</span>
                      <span>•</span>
                      <span>{selectedFlight.category || 'Commercial'}</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Performance Details */}
                  <div className="md:col-span-2 space-y-6">
                    <div className="bg-aervyn-surface-dark border border-aervyn-border-dark rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Activity size={18} className="text-aervyn-primary" /> Live Telemetry
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-4 bg-aervyn-bg-dark rounded-lg border border-aervyn-border-dark">
                          <p className="text-xs text-aervyn-text-dark-secondary mb-1">Altitude</p>
                          <p className="text-xl font-bold text-white">{selectedFlight.altitude ? `${Math.round(selectedFlight.altitude)} ft` : '---'}</p>
                        </div>
                        <div className="p-4 bg-aervyn-bg-dark rounded-lg border border-aervyn-border-dark">
                          <p className="text-xs text-aervyn-text-dark-secondary mb-1">Speed</p>
                          <p className="text-xl font-bold text-white">{selectedFlight.speed ? `${Math.round(selectedFlight.speed)} kts` : '---'}</p>
                        </div>
                        <div className="p-4 bg-aervyn-bg-dark rounded-lg border border-aervyn-border-dark">
                          <p className="text-xs text-aervyn-text-dark-secondary mb-1">Heading</p>
                          <p className="text-xl font-bold text-white">{selectedFlight.heading ? `${Math.round(selectedFlight.heading)}°` : '---'}</p>
                        </div>
                        <div className="p-4 bg-aervyn-bg-dark rounded-lg border border-aervyn-border-dark">
                          <p className="text-xs text-aervyn-text-dark-secondary mb-1">Vert. Rate</p>
                          <p className="text-xl font-bold text-white">{selectedFlight.verticalRate ? `${Math.round(selectedFlight.verticalRate)} ft/m` : '---'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-aervyn-surface-dark border border-aervyn-border-dark rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Clock size={18} className="text-aervyn-primary" /> Flight History
                      </h3>
                      <div className="flex flex-col items-center justify-center h-32 text-aervyn-text-dark-muted">
                        <p className="text-sm">Historical track data will appear here.</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Sidebar Info */}
                  <div className="space-y-6">
                    <div className="bg-aervyn-surface-dark border border-aervyn-border-dark rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Metadata</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between border-b border-aervyn-border-dark pb-2">
                          <span className="text-aervyn-text-dark-secondary">Registration</span>
                          <span className="text-white font-medium">N/A</span>
                        </div>
                        <div className="flex justify-between border-b border-aervyn-border-dark pb-2">
                          <span className="text-aervyn-text-dark-secondary">Squawk</span>
                          <span className="text-white font-medium">{selectedFlight.squawk || 'None'}</span>
                        </div>
                        <div className="flex justify-between border-b border-aervyn-border-dark pb-2">
                          <span className="text-aervyn-text-dark-secondary">Origin Country</span>
                          <span className="text-white font-medium">{selectedFlight.originCountry || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between pb-2">
                          <span className="text-aervyn-text-dark-secondary">On Ground</span>
                          <span className="text-white font-medium">{selectedFlight.onGround ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-aervyn-status-warning/10 border border-aervyn-status-warning/20 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-aervyn-status-warning mb-2 flex items-center gap-2">
                        <AlertCircle size={18} /> Active Alerts
                      </h3>
                      <p className="text-sm text-aervyn-status-warning/80">
                        No active squawks or severe weather reported on this route.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
