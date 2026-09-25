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
    aircraftMetadata,
    myFleetIds,
    addToFleet,
    removeFromFleet
  } = useFlightStore();

  const isSaved = selectedFlight ? myFleetIds.includes(selectedFlight.id) : false;

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
            <PanelHeader title="Airport" subtitle={(airportData as any).iata || 'N/A'} />
            <div className="p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-semibold text-aervyn-text-dark-primary">{(airportData as any).name}</h4>
                  <div className="text-sm font-medium text-aervyn-text-dark-secondary">{(airportData as any).city}, {(airportData as any).country}</div>
                </div>
                <div className="w-10 h-10 border border-aervyn-primary flex items-center justify-center bg-aervyn-primary/10 rounded-md">
                    <MapPin className="w-5 h-5 text-aervyn-primary" />
                </div>
              </div>
              
              <HorizonDivider />

              <div className="grid grid-cols-2 gap-4 mt-2">
                <TelemetryValue label="ICAO Code" value={(airportData as any).icao || '----'} />
                <TelemetryValue label="Elevation" value={(airportData as any).elevation} unit="m" />
                <TelemetryValue className="col-span-2" label="Coordinates" value={`${(airportData as any).lat.toFixed(4)}°, ${(airportData as any).lng.toFixed(4)}°`} />
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
              title="Flight Details" 
              subtitle={selectedFlight.callsign || 'Unknown'} 
              rightElement={
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => isSaved ? removeFromFleet(selectedFlight.id) : addToFleet(selectedFlight.id)}
                    className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded transition-colors ${
                       isSaved 
                         ? 'bg-aervyn-primary text-white border border-aervyn-primary' 
                         : 'bg-aervyn-surface-dark-elevated text-aervyn-text-dark-secondary hover:text-white border border-aervyn-border-dark'
                    }`}
                  >
                    {isSaved ? "In Fleet" : "+ Add"}
                  </button>
                  <span className="text-xs text-aervyn-status-success font-medium border border-aervyn-status-success/30 px-2 py-0.5 rounded bg-aervyn-status-success/10">Tracking</span>
                </div>
              }
            />
            
            <div className="p-3 flex flex-col gap-4">
              
              {/* Aircraft Identification */}
              <FlightCard 
                callsign={selectedFlight.callsign || 'Unknown'} 
                flightNumber={(aircraftMetadata as any)?.registered_owner || (aircraftMetadata as any)?.manufacturer || 'Unknown Airline'} 
                origin={flightRouteData?.origin || '---'} 
                destination={flightRouteData?.destination || '---'} 
                statusText="AIRBORNE"
                isActive={true}
              />

              {/* Photo Data */}
              <div className="w-full h-36 rounded-lg bg-aervyn-surface-dark-elevated relative overflow-hidden border border-aervyn-border-dark flex items-center justify-center shadow-inner">
                {!flightPhotoUrl ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-aervyn-text-dark-muted">
                    <Plane className="w-6 h-6 mb-2 opacity-30" />
                    <span className="text-xs font-medium">No aircraft photo</span>
                  </div>
                ) : (
                  <img 
                    key={flightPhotoUrl}
                    src={flightPhotoUrl} 
                    alt={`Aircraft ${selectedFlight.id}`} 
                    className="w-full h-full object-cover relative z-10 hover:scale-105 transition-transform duration-700"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
              </div>

              {/* Route Details */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center bg-aervyn-surface-dark-elevated p-3.5 rounded-lg border border-aervyn-border-dark shadow-sm">
                  <div className="flex flex-col flex-1 min-w-0 max-w-[42%]">
                    <span className="text-[9px] text-aervyn-text-dark-muted uppercase tracking-widest mb-1.5 font-bold">Departure</span>
                    {flightRouteData ? (
                      <span className="font-bold text-aervyn-text-dark-primary text-sm truncate w-full" title={flightRouteData.origin}>{flightRouteData.origin || 'N/A'}</span>
                    ) : (
                      <div className="h-5 w-20 bg-aervyn-border-dark/50 rounded animate-pulse"></div>
                    )}
                  </div>
                  <div className="flex flex-col items-center justify-center shrink-0 px-2">
                    <Plane className="w-4 h-4 text-aervyn-primary rotate-90" />
                    {eta && <span className="text-[10px] text-aervyn-text-dark-secondary mt-1.5 font-medium whitespace-nowrap">{eta.hours}h {eta.minutes % 60}m</span>}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0 max-w-[42%] text-right items-end">
                    <span className="text-[9px] text-aervyn-text-dark-muted uppercase tracking-widest mb-1.5 font-bold">Arrival</span>
                    {flightRouteData ? (
                      <span className="font-bold text-aervyn-text-dark-primary text-sm truncate w-full" title={flightRouteData.destination}>{flightRouteData.destination || 'N/A'}</span>
                    ) : (
                      <div className="h-5 w-20 bg-aervyn-border-dark/50 rounded animate-pulse"></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-[1px] bg-aervyn-border-dark-subtle"></div>
                <div className="text-[9px] text-aervyn-text-dark-muted font-bold uppercase tracking-widest">
                  Live Telemetry
                </div>
                <div className="flex-1 h-[1px] bg-aervyn-border-dark-subtle"></div>
              </div>

              {/* Telemetry Grid */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-4 p-3.5 bg-aervyn-surface-dark-elevated border border-aervyn-border-dark rounded-lg shadow-sm">
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

              {/* Deep Telemetry / Transponder Data */}
              <div className="flex items-center gap-3 mt-1">
                <div className="flex-1 h-[1px] bg-aervyn-border-dark-subtle"></div>
                <div className="text-[9px] text-aervyn-text-dark-muted font-bold uppercase tracking-widest">
                  Transponder & GPS
                </div>
                <div className="flex-1 h-[1px] bg-aervyn-border-dark-subtle"></div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-4 p-3.5 bg-aervyn-surface-dark-elevated border border-aervyn-border-dark rounded-lg shadow-sm mb-4">
                <TelemetryValue 
                  label="Squawk Code" 
                  value={selectedFlight.squawk || '----'}
                />
                <TelemetryValue 
                  label="Hex (ICAO24)" 
                  value={selectedFlight.icao24 ? selectedFlight.icao24.toUpperCase() : '------'}
                />
                <div className="col-span-2">
                  <TelemetryValue 
                    label="Country of Origin" 
                    value={selectedFlight.originCountry || 'Unknown'}
                  />
                </div>
                <TelemetryValue 
                  label="Latitude" 
                  value={selectedFlight.lat != null ? selectedFlight.lat.toFixed(4) : null}
                  unit="°"
                />
                <TelemetryValue 
                  label="Longitude" 
                  value={selectedFlight.lng != null ? selectedFlight.lng.toFixed(4) : null}
                  unit="°"
                />
              </div>

              {/* Raw Stream Data */}
              <div className="flex items-center gap-3 mt-1">
                <div className="flex-1 h-[1px] bg-aervyn-border-dark-subtle"></div>
                <div className="text-[9px] text-aervyn-text-dark-muted font-bold uppercase tracking-widest">
                  Raw ADS-B Stream
                </div>
                <div className="flex-1 h-[1px] bg-aervyn-border-dark-subtle"></div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-4 p-3.5 bg-aervyn-surface-dark-elevated border border-aervyn-border-dark rounded-lg shadow-sm mb-4">
                <TelemetryValue 
                  label="Geo Altitude" 
                  value={selectedFlight.geoAltitude != null ? selectedFlight.geoAltitude.toLocaleString() : '----'}
                  unit={selectedFlight.geoAltitude != null ? "ft" : ""}
                />
                <TelemetryValue 
                  label="Pos. Source" 
                  value={
                    selectedFlight.positionSource === 0 ? 'ADS-B' : 
                    selectedFlight.positionSource === 1 ? 'ASTERIX' : 
                    selectedFlight.positionSource === 2 ? 'MLAT' : 
                    selectedFlight.positionSource === 3 ? 'FLARM' : 'Unknown'
                  }
                />
                <TelemetryValue 
                  label="Last Contact" 
                  value={selectedFlight.lastContact ? `${Math.floor(Date.now()/1000) - selectedFlight.lastContact}s ago` : '----'}
                  state={selectedFlight.lastContact && (Math.floor(Date.now()/1000) - selectedFlight.lastContact) > 60 ? 'stale' : 'live'}
                />
                <TelemetryValue 
                  label="Pos. Update" 
                  value={selectedFlight.timePosition ? `${Math.floor(Date.now()/1000) - selectedFlight.timePosition}s ago` : '----'}
                />
                <TelemetryValue 
                  label="SPI (Ident)" 
                  value={selectedFlight.spi ? 'TRUE' : 'FALSE'}
                  state={selectedFlight.spi ? 'live' : 'missing'}
                />
                <TelemetryValue 
                  label="On Ground" 
                  value={selectedFlight.onGround ? 'TRUE' : 'FALSE'}
                  state={selectedFlight.onGround ? 'stale' : 'missing'}
                />
              </div>

              {/* Removed duplicate telemetry grid block that was accidentally written twice in previous versions */}

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
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-aervyn-text-dark-muted">
              <div className="w-12 h-12 border border-aervyn-border-dark rounded-full flex items-center justify-center mb-4 bg-aervyn-surface-dark-elevated">
                <Navigation className="w-5 h-5 text-aervyn-text-dark-secondary" />
              </div>
              <h3 className="font-semibold text-aervyn-text-dark-secondary mb-2 text-sm">No Flight Selected</h3>
              <p className="text-xs text-center font-medium">
                Select a flight on the map
              </p>
            </div>
          </CommandPanel>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
