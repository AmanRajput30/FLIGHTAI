"use client";

import React, { useMemo } from 'react';
import { useFlightStore } from '@/store/useFlightStore';
import { CommandPanel } from '../ui/CommandPanel';
import { PanelHeader } from '../ui/PanelHeader';
import { FlightRow } from '../ui/FlightRow';
import { Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, slideLeft } from '@/lib/motion/presets';

export default function FleetPanel() {
  const { flights, selectedFlight, setSelectedFlight, setFocusedFlightId, setAirportData } = useFlightStore();
  
  // To avoid rendering too many rows if there are thousands of flights
  const visibleFlights = useMemo(() => flights.slice(0, 100), [flights]);

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key="fleet"
        variants={slideLeft}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full h-full flex flex-col"
      >
        <CommandPanel className="h-full">
          <PanelHeader 
            title="Airspace Traffic" 
            subtitle={`${flights.length} TRK`}
            rightElement={
              <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded border border-aervyn-status-cyan bg-aervyn-status-cyan/10">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aervyn-status-cyan opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-aervyn-status-cyan"></span>
                </span>
                <span className="text-[8px] text-aervyn-status-cyan uppercase font-bold tracking-widest font-labels">LIVE</span>
              </div>
            }
          />
          
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
            {flights.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-aervyn-text-tertiary">
                <Activity className="w-6 h-6 mb-2 opacity-50" />
                <span className="text-[10px] tracking-widest uppercase font-labels font-bold">No Traffic Detected</span>
              </div>
            ) : (
              visibleFlights.map((flight) => (
                <FlightRow 
                  key={flight.id}
                  callsign={flight.flightNumber || flight.callsign || 'UNK'}
                  origin="---"
                  destination="---"
                  statusText={(flight.altitude ?? 0) > 0 ? `${flight.altitude} FT` : 'GND'}
                  isActive={selectedFlight?.id === flight.id}
                  onClick={() => {
                    setSelectedFlight(flight);
                    setFocusedFlightId(flight.id);
                    setAirportData(null);
                  }}
                />
              ))
            )}
          </div>
        </CommandPanel>
      </motion.div>
    </AnimatePresence>
  );
}
