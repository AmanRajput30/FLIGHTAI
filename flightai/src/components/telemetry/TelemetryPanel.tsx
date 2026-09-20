"use client";

import { MapPin, Navigation, Plane } from 'lucide-react';
import { useFlightStore } from '@/store/useFlightStore';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, slideLeft } from '@/lib/motion/presets';
import { CommandPanel } from '../ui/CommandPanel';
import { PanelHeader } from '../ui/PanelHeader';
import { TelemetryValue } from '../ui/TelemetryValue';
import HorizonDivider from '../ui/HorizonDivider';
import { FlightCard } from '../ui/FlightCard';

export default function TelemetryPanel() {
  const { 
    selectedFlight, 
    airportData, 
    flightPhotoUrl, 
    flightRouteData, 
  } = useFlightStore();

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
          className="w-full h-full"
        >
          <CommandPanel className="h-full">
            <PanelHeader title="Airport Intelligence" subtitle={(airportData as any).iata || 'N/A'} />
            <div className="p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-aervyn-text-primary uppercase tracking-wide">{(airportData as any).name}</h4>
                  <div className="text-[10px] font-medium text-aervyn-text-secondary uppercase tracking-wider">{(airportData as any).city}, {(airportData as any).country}</div>
                </div>
                <div className="w-10 h-10 border border-aervyn-status-blue flex items-center justify-center bg-aervyn-status-blue/10 rounded-md">
                    <MapPin className="w-5 h-5 text-aervyn-status-blue" />
                </div>
              </div>
              
              <HorizonDivider />

              <div className="grid grid-cols-2 gap-4 mt-2">
                <TelemetryValue label="ICAO Code" value={(airportData as any).icao || '----'} />
                <TelemetryValue label="Elevation" value={(airportData as any).elevation} unit="m" />
                <TelemetryValue className="col-span-2" label="Global Coordinates" value={`${(airportData as any).lat.toFixed(4)}°, ${(airportData as any).lng.toFixed(4)}°`} />
              </div>
            </div>
          </CommandPanel>
        </motion.div>
      ) : selectedFlight ? (
        <motion.div 
          key="flight"
          variants={slideLeft}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full h-full"
        >
          <CommandPanel className="h-full overflow-y-auto no-scrollbar">
            <PanelHeader 
              title="Target Acquired" 
              subtitle={selectedFlight.flightNumber || 'Unknown'} 
              rightElement={<span className="text-[9px] text-aervyn-status-green uppercase font-bold tracking-widest border border-aervyn-status-green/30 px-1.5 py-0.5 rounded bg-aervyn-status-green/10">TRACKING</span>}
            />
            
            <div className="p-3 flex flex-col gap-4">
              
              {/* Aircraft Identification */}
              <FlightCard 
                callsign={selectedFlight.flightNumber || 'Unknown'} 
                flightNumber={selectedFlight.airline || 'Unknown Airline'} 
                origin={flightRouteData?.originIata || '---'} 
                destination={flightRouteData?.destinationIata || '---'} 
                statusText="AIRBORNE"
                isActive={true}
              />

              {/* Photo Data */}
              <div className="w-full h-32 rounded bg-aervyn-bg-dark relative overflow-hidden border border-aervyn-border-subtle flex items-center justify-center">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-aervyn-text-tertiary">
                  <Plane className="w-6 h-6 mb-1 opacity-30" />
                  <span className="text-[9px] uppercase tracking-widest">No Visual Data</span>
                </div>
                {flightPhotoUrl && (
                  <img 
                    key={flightPhotoUrl}
                    src={flightPhotoUrl} 
                    alt={`Aircraft ${selectedFlight.id}`} 
                    className="w-full h-full object-cover relative z-10"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
              </div>

              {/* Divider with duration */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-[1px] bg-aervyn-border-subtle"></div>
                <div className="text-[9px] text-aervyn-text-tertiary font-labels tracking-widest uppercase font-bold">
                  {eta ? `TOTAL ${eta.hours}h ${eta.minutes % 60}m` : 'ROUTING DATA'}
                </div>
                <div className="flex-1 h-[1px] bg-aervyn-border-subtle"></div>
              </div>

              {/* Route Details */}
              {flightRouteData && (
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center bg-aervyn-panel-light p-2 rounded border border-aervyn-border-subtle">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-aervyn-text-tertiary uppercase tracking-widest mb-1">Departure</span>
                      <span className="font-labels font-bold text-aervyn-text-primary text-sm">{flightRouteData.originIata || '---'}</span>
                    </div>
                    <Plane className="w-4 h-4 text-aervyn-border-active rotate-90" />
                    <div className="flex flex-col text-right">
                      <span className="text-[9px] text-aervyn-text-tertiary uppercase tracking-widest mb-1">Arrival</span>
                      <span className="font-labels font-bold text-aervyn-text-primary text-sm">{flightRouteData.destinationIata || '---'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Telemetry Grid */}
              <div className="grid grid-cols-2 gap-y-6 gap-x-4 mt-2 p-3 bg-aervyn-panel-dark border border-aervyn-border-subtle rounded">
                <TelemetryValue 
                  label="Altitude" 
                  value={selectedFlight.altitude != null ? selectedFlight.altitude.toLocaleString() : null} 
                  unit="ft"
                  state={selectedFlight.altitude != null && selectedFlight.altitude < 10000 && selectedFlight.altitude > 0 ? 'stale' : 'live'}
                />
                <TelemetryValue 
                  label="Ground Speed" 
                  value={selectedFlight.speed} 
                  unit="kts"
                  state={selectedFlight.speed != null && selectedFlight.speed < 150 && (selectedFlight.altitude || 0) > 0 ? 'stale' : 'live'}
                />
                <TelemetryValue 
                  label="Heading" 
                  value={selectedFlight.heading != null ? Math.round(selectedFlight.heading) : null}
                  unit="°"
                />
                <TelemetryValue 
                  label="Vertical Rate" 
                  value={selectedFlight.verticalRate != null ? (selectedFlight.verticalRate > 0 ? `+${selectedFlight.verticalRate}` : selectedFlight.verticalRate) : null} 
                  unit="fpm"
                />
              </div>

            </div>
          </CommandPanel>
        </motion.div>
      ) : (
        <motion.div 
          key="empty"
          variants={fadeIn}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full h-full"
        >
          <CommandPanel state="empty" className="h-full min-h-[300px]">
            {/* The CommandPanel 'empty' state handles the text, but let's override children to show the icon */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-aervyn-text-tertiary">
              <div className="w-12 h-12 border border-aervyn-border-subtle rounded-full flex items-center justify-center mb-4 bg-aervyn-panel-light">
                <Navigation className="w-5 h-5 text-aervyn-text-secondary" />
              </div>
              <h3 className="font-bold text-aervyn-text-secondary mb-2 uppercase tracking-widest text-xs font-labels">No Target Selected</h3>
              <p className="text-[10px] text-center tracking-widest leading-relaxed uppercase font-labels">
                Awaiting Target Selection
              </p>
            </div>
          </CommandPanel>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
