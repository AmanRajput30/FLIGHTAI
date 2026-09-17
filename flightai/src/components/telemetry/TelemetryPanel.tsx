"use client";

import { Activity, MapPin, Plane, Flag, Cloud, Thermometer, Wind, Navigation } from 'lucide-react';
import { useFlightStore } from '@/store/useFlightStore';

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
    <div className="bg-[var(--color-cockpit-black)] border border-[var(--color-instrument-grey)] rounded-[2px] p-3 flex flex-col justify-between h-24 relative overflow-hidden group">
      <p className="text-[10px] text-[var(--color-instrument-grey)] uppercase tracking-widest font-[family-name:var(--font-labels)]">{label}</p>
      
      {headingValue != null && !isUnknown ? (
        <div className="flex items-end gap-3 h-full pb-1">
          {/* Compass Graphic */}
          <div className="w-10 h-10 border-2 border-[var(--color-instrument-grey)] rounded-full relative flex items-center justify-center shrink-0">
             <div className="absolute top-0 w-1 h-2 bg-[var(--color-warning-red)] -mt-1 z-10" />
             <div 
               className="w-full h-full absolute transition-transform duration-500 ease-out"
               style={{ transform: `rotate(${headingValue}deg)` }}
             >
                <div className="w-[2px] h-4 bg-[var(--color-instrument-white)] absolute top-1 left-1/2 -translate-x-1/2" />
             </div>
             <span className="text-[10px] text-[var(--color-instrument-grey)] font-[family-name:var(--font-numerals)]">{Math.round(headingValue)}</span>
          </div>
          <div className="flex items-baseline">
            <span className={`font-[family-name:var(--font-numerals)] text-3xl leading-none tracking-wide ${warning ? 'text-[var(--color-caution-amber)]' : 'text-[var(--color-instrument-white)]'}`}>
              {displayValue}
            </span>
            {unit && <span className="text-[var(--color-instrument-grey)] text-[10px] ml-1 font-[family-name:var(--font-labels)] uppercase tracking-widest">{unit}</span>}
          </div>
        </div>
      ) : (
        <div className="flex items-baseline mt-auto pb-1">
          <span className={`font-[family-name:var(--font-numerals)] text-4xl leading-none tracking-wide ${warning && !isUnknown ? 'text-[var(--color-caution-amber)]' : 'text-[var(--color-instrument-white)]'}`}>
            {displayValue}
          </span>
          {unit && !isUnknown && <span className="text-[var(--color-instrument-grey)] text-[10px] ml-1.5 font-[family-name:var(--font-labels)] uppercase tracking-widest">{unit}</span>}
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
    <div className="w-[420px] h-full flex flex-col bg-[var(--color-cockpit-black)] border-r border-[var(--color-instrument-grey)] p-5 gap-4 overflow-y-auto z-10 font-[family-name:var(--font-labels)]">
      <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-lg flex items-center gap-2 text-[var(--color-instrument-white)] uppercase tracking-wider">
            <Activity className="w-5 h-5 text-[var(--color-horizon-blue)]" /> Deep Telemetry
          </h2>
          <span className="text-[10px] text-[var(--color-instrument-grey)] uppercase tracking-widest">ADS-B Stream</span>
      </div>

      {airportData ? (
        <div className="flex flex-col gap-4">
          <div className="bg-[var(--color-cockpit-black)] rounded-[2px] p-5 border border-[var(--color-instrument-grey)] relative flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 border border-[var(--color-horizon-blue)] flex items-center justify-center bg-[var(--color-horizon-blue)]/10">
                  <MapPin className="w-6 h-6 text-[var(--color-horizon-blue)]" />
              </div>
              <div className="z-10 relative text-right">
                  <div className="text-[10px] text-[var(--color-horizon-blue)] uppercase tracking-widest font-bold mb-1">Airport Geocoded</div>
                  <h3 className="font-[family-name:var(--font-numerals)] font-normal text-3xl leading-none text-[var(--color-instrument-white)]">{(airportData as any).iata || 'N/A'}</h3>
              </div>
            </div>
            <div className="z-10 relative">
              <h4 className="text-lg font-bold text-[var(--color-instrument-white)] mb-1 uppercase tracking-wide">{(airportData as any).name}</h4>
              <div className="text-xs font-medium text-[var(--color-instrument-grey)] uppercase tracking-wider">{(airportData as any).city}, {(airportData as any).country}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
              <div className="bg-[var(--color-cockpit-black)] p-3 border border-[var(--color-instrument-grey)] flex flex-col gap-1">
                <span className="text-[10px] text-[var(--color-instrument-grey)] uppercase tracking-widest">ICAO Code</span>
                <span className="font-[family-name:var(--font-numerals)] text-[var(--color-instrument-white)] text-xl">{(airportData as any).icao || '----'}</span>
              </div>
              <div className="bg-[var(--color-cockpit-black)] p-3 border border-[var(--color-instrument-grey)] flex flex-col gap-1">
                <span className="text-[10px] text-[var(--color-instrument-grey)] uppercase tracking-widest">Elevation</span>
                <span className="font-[family-name:var(--font-numerals)] text-[var(--color-instrument-white)] text-xl">{(airportData as any).elevation ? `${(airportData as any).elevation}m` : '---'}</span>
              </div>
              <div className="col-span-2 bg-[var(--color-cockpit-black)] p-3 border border-[var(--color-instrument-grey)] flex flex-col gap-1">
                <span className="text-[10px] text-[var(--color-instrument-grey)] uppercase tracking-widest">Timezone</span>
                <span className="font-[family-name:var(--font-labels)] text-[var(--color-instrument-white)] text-sm uppercase">{(airportData as any).timezone || 'Unknown'}</span>
              </div>
              <div className="col-span-2 bg-[var(--color-cockpit-black)] p-3 border border-[var(--color-instrument-grey)] flex flex-col gap-1">
                <span className="text-[10px] text-[var(--color-instrument-grey)] uppercase tracking-widest">Global Coordinates</span>
                <span className="font-[family-name:var(--font-numerals)] text-[var(--color-instrument-white)] text-lg tracking-widest">{(airportData as any).lat.toFixed(4)}°, {(airportData as any).lng.toFixed(4)}°</span>
              </div>
          </div>
        </div>
      ) : selectedFlight ? (
        <div className="flex flex-col gap-4">
            {/* Primary Identifier */}
            <div className="bg-[var(--color-cockpit-black)] rounded-[2px] p-5 border border-[var(--color-instrument-grey)] relative flex flex-col gap-4">
              <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 border border-[var(--color-horizon-blue)] bg-[var(--color-horizon-blue)]/10 flex items-center justify-center relative">
                        <Plane className="w-7 h-7 text-[var(--color-horizon-blue)]" />
                    </div>
                    <div className="z-10 relative">
                        <div className="text-[10px] text-[var(--color-horizon-blue)] uppercase tracking-widest font-bold mb-1">Target Acquired</div>
                        <h3 className="font-[family-name:var(--font-numerals)] font-normal text-4xl leading-none text-[var(--color-instrument-white)]">{selectedFlight.flightNumber || 'Unknown'}</h3>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-[var(--color-horizon-blue)]/20 text-[var(--color-horizon-blue)] text-[10px] font-bold border border-[var(--color-horizon-blue)] uppercase tracking-widest z-10 relative">Airborne</span>
              </div>

              {/* Aircraft Image */}
              <div className="w-full h-40 border border-[var(--color-instrument-grey)] bg-[var(--color-cockpit-black)] relative z-10 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--color-instrument-grey)] z-0">
                  <Plane className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-[10px] uppercase tracking-widest">No Photographic Data</span>
                </div>
                {flightPhotoUrl && (
                  <img 
                    key={flightPhotoUrl}
                    src={flightPhotoUrl} 
                    alt={`Aircraft ${selectedFlight.id}`} 
                    className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity relative z-10 block grayscale hover:grayscale-0"
                    onError={(e) => { 
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>

              <div className="flex flex-1 items-center gap-4 text-sm font-medium z-10 relative bg-[var(--color-cockpit-black)] p-3 border border-[var(--color-instrument-grey)]">
                  <div className="flex-1">
                    <div className="text-[10px] text-[var(--color-instrument-grey)] uppercase tracking-widest mb-0.5">Callsign / Ops</div>
                    <div className="font-bold text-[var(--color-instrument-white)] mb-0.5 uppercase tracking-wide">{selectedFlight.flightNumber || 'N/A'}</div>
                    <div className="text-[9px] text-[var(--color-instrument-grey)] uppercase tracking-widest truncate">{selectedFlight.airline}</div>
                  </div>
                  <div className="flex-1 border-l border-[var(--color-instrument-grey)] pl-4 overflow-hidden">
                    <div className="text-[10px] text-[var(--color-instrument-grey)] uppercase tracking-widest mb-0.5">Aircraft Type</div>
                    <div className="font-bold text-[var(--color-instrument-white)] mb-0.5 uppercase tracking-wide truncate" title={aircraftMetadata?.manufacturer ? `${aircraftMetadata.manufacturer} ${aircraftMetadata.type}` : flightRouteData?.aircraftModel}>
                      {aircraftMetadata?.type || flightRouteData?.aircraftModel || 'Unknown Type'}
                    </div>
                    <div className="text-[10px] text-[var(--color-horizon-blue)] font-[family-name:var(--font-numerals)] tracking-widest">{aircraftMetadata?.registration || flightRouteData?.registration || '---'}</div>
                  </div>
              </div>
              {/* Expanded Aircraft Metadata */}
              {aircraftMetadata && (
                <div className="flex flex-col gap-1 text-sm font-medium z-10 relative bg-[var(--color-cockpit-black)] p-3 border border-[var(--color-instrument-grey)] mt-[-8px]">
                  <div className="flex justify-between border-b border-[var(--color-instrument-grey)] pb-1 mb-1">
                    <span className="text-[10px] text-[var(--color-instrument-grey)] uppercase tracking-widest">Manufacturer</span>
                    <span className="text-[10px] text-[var(--color-instrument-white)] uppercase tracking-widest">{aircraftMetadata.manufacturer || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-[var(--color-instrument-grey)] uppercase tracking-widest">Registered Owner</span>
                    <span className="text-[10px] text-[var(--color-instrument-white)] uppercase tracking-widest text-right">{aircraftMetadata.registered_owner || 'Unknown'} <br/><span className="text-[var(--color-instrument-grey)]">({aircraftMetadata.registered_owner_country_iso_name || 'N/A'})</span></span>
                  </div>
                </div>
              )}
            </div>

            {/* Route Information */}
            {flightRouteData && (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <div 
                    onClick={() => setExpandedRoute(expandedRoute === 'origin' ? null : 'origin')}
                    className={`flex-1 bg-[var(--color-cockpit-black)] p-4 flex flex-col gap-1 cursor-pointer transition-colors ${expandedRoute === 'origin' ? 'border-2 border-[var(--color-horizon-blue)]' : 'border border-[var(--color-instrument-grey)] hover:bg-[var(--color-instrument-grey)]/10'}`}>
                      <span className="text-[10px] text-[var(--color-instrument-grey)] uppercase tracking-widest flex items-center gap-1"><MapPin className="w-3 h-3 text-[var(--color-instrument-white)]"/> Origin</span>
                      <span className="font-bold text-[var(--color-instrument-white)] leading-tight mt-1 truncate uppercase tracking-wide">{flightRouteData.origin}</span>
                      <span className="font-[family-name:var(--font-numerals)] text-xs text-[var(--color-instrument-grey)] tracking-widest">{flightRouteData.originIata} / {flightRouteData.originIcao}</span>
                  </div>
                  <div 
                    onClick={() => setExpandedRoute(expandedRoute === 'destination' ? null : 'destination')}
                    className={`flex-1 bg-[var(--color-cockpit-black)] p-4 flex flex-col gap-1 cursor-pointer transition-colors ${expandedRoute === 'destination' ? 'border-2 border-[var(--color-horizon-blue)]' : 'border border-[var(--color-instrument-grey)] hover:bg-[var(--color-instrument-grey)]/10'}`}>
                      <span className="text-[10px] text-[var(--color-instrument-grey)] uppercase tracking-widest flex items-center gap-1"><Flag className="w-3 h-3 text-[var(--color-instrument-white)]"/> Destination</span>
                      <span className="font-bold text-[var(--color-instrument-white)] leading-tight mt-1 truncate uppercase tracking-wide">{flightRouteData.destination}</span>
                      <span className="font-[family-name:var(--font-numerals)] text-xs text-[var(--color-instrument-grey)] tracking-widest">{flightRouteData.destinationIata} / {flightRouteData.destinationIcao}</span>
                  </div>
                </div>
                {flightRouteData.source && (
                  <div className="text-[9px] text-[var(--color-instrument-grey)] uppercase tracking-[0.2em] text-center mt-1">Data Source: {flightRouteData.source}</div>
                )}
                
                {/* Expanded Route Details */}
                {expandedRoute && (
                  <div className={`p-4 border border-[var(--color-horizon-blue)] bg-[var(--color-horizon-blue)]/5 flex flex-col gap-3 relative`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none text-[var(--color-horizon-blue)]">
                        {expandedRoute === 'origin' ? <MapPin className="w-20 h-20" /> : <Flag className="w-20 h-20" />}
                    </div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--color-horizon-blue)] border-b border-[var(--color-horizon-blue)]/30 pb-2 flex items-center gap-2">
                      {expandedRoute === 'origin' ? <span>Origin Details</span> : <span>Destination Details</span>}
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm z-10 w-full relative">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] uppercase text-[var(--color-instrument-grey)] tracking-wider">City / Region</span>
                          <span className="font-bold text-[var(--color-instrument-white)] uppercase">
                            {flightRouteData[`${expandedRoute}Timezone` as keyof typeof flightRouteData] ? (flightRouteData[`${expandedRoute}Timezone` as keyof typeof flightRouteData] as string).split('/').pop()?.replace(/_/g, ' ') : 'Unknown'}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] uppercase text-[var(--color-instrument-grey)] tracking-wider">Airport Full Name</span>
                          <span className="font-bold text-[var(--color-instrument-white)] uppercase truncate pr-2" title={(flightRouteData as any)[expandedRoute]}>{(flightRouteData as any)[expandedRoute]}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] uppercase text-[var(--color-instrument-grey)] tracking-wider">Terminal</span>
                          <span className="font-[family-name:var(--font-numerals)] text-[var(--color-instrument-white)]">{(flightRouteData as any)[`${expandedRoute}Terminal`] || 'TBD'}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] uppercase text-[var(--color-instrument-grey)] tracking-wider">Gate</span>
                          <span className="font-[family-name:var(--font-numerals)] text-[var(--color-instrument-white)]">{(flightRouteData as any)[`${expandedRoute}Gate`] || 'TBD'}</span>
                        </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Metric Grid */}
            <div className="grid grid-cols-2 gap-2">
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

            {/* ETA Card */}
            {eta && (
              <div className="bg-[var(--color-cockpit-black)] p-4 border border-[var(--color-instrument-grey)] flex items-center justify-between relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-horizon-blue)]"></div>
                <div className="flex flex-col gap-1 pl-2">
                  <span className="text-[10px] text-[var(--color-horizon-blue)] uppercase tracking-widest font-bold">Estimated Arrival</span>
                  <span className="font-[family-name:var(--font-numerals)] text-[var(--color-instrument-white)] text-xl">~{eta.hours} hours</span>
                </div>
                <div className="flex flex-col gap-1 text-right">
                  <span className="text-[10px] text-[var(--color-instrument-grey)] uppercase tracking-widest">Distance Remaining</span>
                  <span className="font-[family-name:var(--font-numerals)] text-[var(--color-horizon-blue)] text-lg tracking-widest">{eta.distanceKm.toLocaleString()} km</span>
                </div>
              </div>
            )}

            {/* Additional Geographic Info */}
            <div className="bg-[var(--color-cockpit-black)] p-5 border border-[var(--color-instrument-grey)] space-y-4">
              <div className="flex justify-between items-center">
                  <span className="text-[10px] text-[var(--color-instrument-grey)] uppercase tracking-widest">Live Latitude</span>
                  <span className="font-[family-name:var(--font-numerals)] text-[var(--color-instrument-white)] text-sm tracking-widest">{selectedFlight.lat.toFixed(4)}°</span>
              </div>
              <div className="flex justify-between items-center">
                  <span className="text-[10px] text-[var(--color-instrument-grey)] uppercase tracking-widest">Live Longitude</span>
                  <span className="font-[family-name:var(--font-numerals)] text-[var(--color-instrument-white)] text-sm tracking-widest">{selectedFlight.lng.toFixed(4)}°</span>
              </div>
              <div className="h-[1px] w-full bg-[var(--color-instrument-grey)]/50"></div>
              <div className="flex justify-between items-center">
                  <span className="text-[10px] text-[var(--color-instrument-grey)] uppercase tracking-widest">Signal Ping</span>
                  <span className="text-[10px] font-bold text-[var(--color-instrument-white)] flex items-center gap-2 uppercase tracking-widest">
                    <div className="w-2 h-2 bg-[var(--color-horizon-blue)] animate-pulse"></div>
                    {timeAgo(selectedFlight.lastContact || 0, Date.now())}
                  </span>
              </div>
            </div>

            {/* Meteorological Data */}
            {weatherData && (
              <div className="bg-[var(--color-cockpit-black)] p-5 border border-[var(--color-instrument-grey)] space-y-4">
                  <h3 className="text-[10px] text-[var(--color-horizon-blue)] font-bold uppercase tracking-widest flex items-center gap-2 mb-2">
                    <Cloud className="w-4 h-4" /> Ground Weather Below Aircraft
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-[var(--color-instrument-grey)] flex items-center gap-1 uppercase tracking-widest"><Thermometer className="w-3 h-3"/> Ground Temp</span>
                        <span className="font-[family-name:var(--font-numerals)] text-[var(--color-instrument-white)] text-xl">{weatherData.temperature_2m}°C</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-[var(--color-instrument-grey)] flex items-center gap-1 uppercase tracking-widest"><Wind className="w-3 h-3"/> Surface Wind</span>
                        <span className="font-[family-name:var(--font-numerals)] text-[var(--color-instrument-white)] text-xl">{weatherData.wind_speed_10m} km/h</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 mt-2 border-t border-[var(--color-instrument-grey)]/50 pt-3">
                    <span className="text-[10px] text-[var(--color-instrument-grey)] uppercase tracking-widest">Weather Synopsis</span>
                    <span className="text-xs font-bold text-[var(--color-instrument-white)] uppercase tracking-widest">{
                      (weatherData as any).weather_code === 0 ? 'Clear sky' : 
                      (weatherData as any).weather_code <= 3 ? 'Partly cloudy' : 
                      (weatherData as any).weather_code < 50 ? 'Fog / Haze' : 
                      (weatherData as any).weather_code < 70 ? 'Rain / Drizzle' : 
                      (weatherData as any).weather_code < 80 ? 'Snow' : 'Thunderstorm'
                    }</span>
                  </div>
              </div>
            )}

            {/* Trajectory message */}
            <p className="text-[10px] text-center text-[var(--color-instrument-grey)] mt-2 uppercase tracking-widest">
              Map shows flight trajectory. Data provided by OpenSky Network.
            </p>
        </div>
      ) : (
        <div className="flex-1 border border-dashed border-[var(--color-instrument-grey)] flex flex-col items-center justify-center text-[var(--color-instrument-grey)] bg-[var(--color-cockpit-black)]">
            <div className="w-16 h-16 border border-[var(--color-instrument-grey)] flex items-center justify-center mb-4 bg-[var(--color-instrument-grey)]/10">
              <Navigation className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-[var(--color-instrument-white)] mb-2 uppercase tracking-widest">No Target Selected</h3>
            <p className="text-[10px] px-8 text-center text-[var(--color-instrument-grey)] uppercase tracking-widest leading-relaxed">Tap an aircraft on the radar map to lock onto its transponder and view trajectory details.</p>
        </div>
      )}
    </div>
  );
}
