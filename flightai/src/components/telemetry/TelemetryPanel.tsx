"use client";

import { Activity, MapPin, Plane, Flag, Cloud, Thermometer, Wind, Navigation } from 'lucide-react';
import { useFlightStore } from '@/store/useFlightStore';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, slideLeft, staggerChildren } from '@/lib/motion/presets';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  warning?: boolean;
  headingValue?: number | null;
}

function MetricCard({ label, value, unit, warning, headingValue }: MetricCardProps) {
  const isUnknown = value === 'Unknown' || value == null;
  const displayValue = isUnknown ? '---' : value;

  return (
    <div className="cockpit-panel p-4 flex flex-col justify-between relative overflow-hidden group">
      <p className="text-[10px] text-instrument-grey uppercase tracking-widest font-labels">{label}</p>
      
      {headingValue != null && !isUnknown ? (
        <div className="flex items-end gap-3 mt-4">
          <div className="w-10 h-10 border-2 border-instrument-muted rounded-full relative flex items-center justify-center shrink-0">
             <div className="absolute top-0 w-1 h-2 bg-warning-red -mt-1 z-10" />
             <div 
               className="w-full h-full absolute transition-transform duration-500 ease-out"
               style={{ transform: `rotate(${headingValue}deg)` }}
             >
                <div className="w-[2px] h-4 bg-instrument-white absolute top-1 left-1/2 -translate-x-1/2" />
             </div>
             <span className="text-[10px] text-instrument-grey font-numerals">{Math.round(headingValue)}</span>
          </div>
          <div className="flex items-baseline">
            <span className={`font-numerals text-3xl leading-none tracking-wide ${warning ? 'text-caution-amber' : 'text-instrument-white'}`}>
              {displayValue}
            </span>
            {unit && <span className="text-instrument-grey text-[10px] ml-1 font-labels uppercase tracking-widest">{unit}</span>}
          </div>
        </div>
      ) : (
        <div className="flex items-baseline mt-4">
          <span className={`font-numerals text-4xl leading-none tracking-wide ${warning && !isUnknown ? 'text-caution-amber' : 'text-instrument-white'}`}>
            {displayValue}
          </span>
          {unit && !isUnknown && <span className="text-instrument-grey text-[10px] ml-1.5 font-labels uppercase tracking-widest">{unit}</span>}
        </div>
      )}
    </div>
  )
}

export default function TelemetryPanel() {
  const { 
    selectedFlight, 
    airportData, 
    flightPhotoUrl, 
    aircraftMetadata, 
    flightRouteData, 
    expandedRoute, 
    setExpandedRoute, 
    weatherData 
  } = useFlightStore();

  const timeAgo = (unixTimestamp: number, now: number) => {
    if (!unixTimestamp) return 'Just now';
    const seconds = Math.floor(now/1000 - unixTimestamp);
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds/60)}m ago`;
  };

  const calculateETA = () => {
    if (!selectedFlight || !flightRouteData?.destLat || !flightRouteData?.destLng || !selectedFlight.speed || selectedFlight.speed === 0) return null;
    const R = 6371;
    const dLat = (flightRouteData.destLat - selectedFlight.lat) * Math.PI / 180;
    const dLon = (flightRouteData.destLng - selectedFlight.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(selectedFlight.lat * Math.PI/180) * Math.cos(flightRouteData.destLat * Math.PI/180) * Math.sin(dLon/2)**2;
    const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const hours = distance / selectedFlight.speed;
    return { distanceKm: Math.round(distance), hours: parseFloat(hours.toFixed(1)), minutes: Math.round(hours * 60) };
  };

  const eta = calculateETA();

  return (
    <AnimatePresence mode="wait">
      {airportData ? (
        <motion.div 
          key="airport"
          variants={slideLeft}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full flex flex-col gap-4 font-labels"
        >
          <div className="cockpit-panel p-5 relative flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 border border-horizon-blue flex items-center justify-center bg-horizon-blue/10 rounded-md">
                  <MapPin className="w-6 h-6 text-horizon-blue" />
              </div>
              <div className="z-10 relative text-right">
                  <div className="text-[10px] text-horizon-blue uppercase tracking-widest font-bold mb-1">Airport Geocoded</div>
                  <h3 className="font-numerals font-normal text-3xl leading-none text-instrument-white">{(airportData as any).iata || 'N/A'}</h3>
              </div>
            </div>
            <div className="z-10 relative">
              <h4 className="text-lg font-bold text-instrument-white mb-1 uppercase tracking-wide">{(airportData as any).name}</h4>
              <div className="text-xs font-medium text-instrument-grey uppercase tracking-wider">{(airportData as any).city}, {(airportData as any).country}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
              <div className="cockpit-panel p-4 flex flex-col gap-1">
                <span className="text-[10px] text-instrument-grey uppercase tracking-widest">ICAO Code</span>
                <span className="font-numerals text-instrument-white text-xl">{(airportData as any).icao || '----'}</span>
              </div>
              <div className="cockpit-panel p-4 flex flex-col gap-1">
                <span className="text-[10px] text-instrument-grey uppercase tracking-widest">Elevation</span>
                <span className="font-numerals text-instrument-white text-xl">{(airportData as any).elevation ? `${(airportData as any).elevation}m` : '---'}</span>
              </div>
              <div className="col-span-2 cockpit-panel p-4 flex flex-col gap-1">
                <span className="text-[10px] text-instrument-grey uppercase tracking-widest">Global Coordinates</span>
                <span className="font-numerals text-instrument-white text-lg tracking-widest">{(airportData as any).lat.toFixed(4)}°, {(airportData as any).lng.toFixed(4)}°</span>
              </div>
          </div>
        </motion.div>
      ) : selectedFlight ? (
        <motion.div 
          key="flight"
          variants={slideLeft}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full flex flex-col gap-4 font-labels pb-20 overflow-y-auto no-scrollbar"
        >
            {/* Primary Identifier */}
            <div className="cockpit-panel p-5 relative flex flex-col gap-4">
              <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                      <div className="text-[10px] text-horizon-blue uppercase tracking-widest font-bold mb-1">Flight Information</div>
                      <h3 className="font-numerals font-normal text-4xl leading-none text-instrument-white">{selectedFlight.flightNumber || 'Unknown'}</h3>
                      <div className="text-[11px] text-instrument-grey uppercase tracking-widest font-semibold mt-1 flex items-center gap-2">
                        <Plane className="w-3 h-3"/>
                        {selectedFlight.airline || 'Unknown Airline'}
                      </div>
                  </div>
                  <button className="px-3 py-1.5 bg-cockpit-panel-raised border border-border-active hover:bg-white/10 text-instrument-white text-[10px] font-bold rounded-md transition-colors uppercase tracking-widest z-10 relative">
                    See Details
                  </button>
              </div>

              {/* Aircraft Image */}
              <div className="w-full h-44 rounded-lg bg-cockpit-black relative z-10 flex items-center justify-center overflow-hidden border border-border-subtle">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-instrument-muted z-0">
                  <Plane className="w-8 h-8 mb-2 opacity-30" />
                  <span className="text-[10px] uppercase tracking-widest">No Photographic Data</span>
                </div>
                {flightPhotoUrl && (
                  <img 
                    key={flightPhotoUrl}
                    src={flightPhotoUrl} 
                    alt={`Aircraft ${selectedFlight.id}`} 
                    className="w-full h-full object-cover relative z-10 block"
                    onError={(e) => { 
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>
            </div>

            {/* Route Information matching the reference image layout */}
            {flightRouteData && (
              <div className="cockpit-panel p-5 flex flex-col gap-6 relative">
                {/* DEPARTURE */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-[10px] text-instrument-grey uppercase tracking-widest">
                    <Plane className="w-3 h-3 transform -rotate-45" /> Departure
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="font-numerals text-4xl text-instrument-white leading-none">{flightRouteData.originIata || '---'}</div>
                    <div className="font-numerals text-3xl text-instrument-white leading-none">03:20 AM</div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <div className="text-instrument-grey">{flightRouteData.origin}</div>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-white/5 rounded text-[10px] border border-border-subtle text-instrument-grey">Terminal B</span>
                      <span className="px-2 py-1 bg-white/5 rounded text-[10px] border border-border-subtle text-instrument-grey">Gate 12</span>
                    </div>
                  </div>
                </div>

                {/* Divider with duration */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-[1px] bg-border-subtle"></div>
                  <div className="text-[10px] text-instrument-grey font-labels tracking-widest uppercase">
                    Total {eta?.hours || '--'}h {eta?.minutes ? eta.minutes % 60 : '--'}m
                  </div>
                  <div className="flex-1 h-[1px] bg-border-subtle"></div>
                </div>

                {/* ARRIVAL */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-[10px] text-instrument-grey uppercase tracking-widest">
                    <Plane className="w-3 h-3 transform rotate-45" /> Arrival
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="font-numerals text-4xl text-instrument-white leading-none">{flightRouteData.destinationIata || '---'}</div>
                    <div className="font-numerals text-3xl text-instrument-white leading-none">01:20 PM</div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <div className="text-instrument-grey">{flightRouteData.destination}</div>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-white/5 rounded text-[10px] border border-border-subtle text-instrument-grey">Terminal B</span>
                      <span className="px-2 py-1 bg-white/5 rounded text-[10px] border border-border-subtle text-instrument-grey">Gate 12</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Metric Grid */}
            <div className="grid grid-cols-2 gap-4">
              <MetricCard 
                label="Altitude" 
                value={selectedFlight.altitude != null ? selectedFlight.altitude.toLocaleString() : 'Unknown'} 
                unit="ft"
                warning={selectedFlight.altitude != null && selectedFlight.altitude < 10000 && selectedFlight.altitude > 0}
              />
              <MetricCard 
                label="Ground Speed" 
                value={selectedFlight.speed != null ? selectedFlight.speed : 'Unknown'} 
                unit="kts"
                warning={selectedFlight.speed != null && selectedFlight.speed < 150 && (selectedFlight.altitude || 0) > 0}
              />
              <MetricCard 
                label="Heading" 
                value={selectedFlight.heading != null ? Math.round(selectedFlight.heading) : 'Unknown'}
                unit="°"
                headingValue={selectedFlight.heading}
              />
              <MetricCard 
                label="Vertical Rate" 
                value={selectedFlight.verticalRate != null ? (selectedFlight.verticalRate > 0 ? `+${selectedFlight.verticalRate}` : selectedFlight.verticalRate) : '0'} 
                unit="fpm"
              />
            </div>
        </motion.div>
      ) : (
        <motion.div 
          key="empty"
          variants={fadeIn}
          initial="initial"
          animate="animate"
          exit="exit"
          className="cockpit-panel p-8 flex flex-col items-center justify-center text-instrument-grey min-h-[300px]"
        >
            <div className="w-16 h-16 border border-border-subtle rounded-full flex items-center justify-center mb-4 bg-white/5">
              <Navigation className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-instrument-white mb-2 uppercase tracking-widest text-sm">No Target Selected</h3>
            <p className="text-[11px] px-4 text-center text-instrument-grey tracking-widest leading-relaxed">
              Select an aircraft on the map to inspect telemetry.
            </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
