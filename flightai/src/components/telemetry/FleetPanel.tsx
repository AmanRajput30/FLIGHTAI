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
  const { flights, selectedFlight, setSelectedFlight, setFocusedFlightId, setAirportData, setTargetPos } = useFlightStore();
  
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
            title="Flights" 
            subtitle={`${flights.length} TRK`}
          />
          
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
            {flights.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-aervyn-text-dark-muted">
                <Activity className="w-6 h-6 mb-3 opacity-50" />
                <span className="text-sm font-medium">No flights in view</span>
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
                    if (flight.lat && flight.lng) {
                      setTargetPos([flight.lat, flight.lng]);
                    }
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
