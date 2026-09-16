"use client";

import { Activity, MapPin, Plane, Flag, ArrowUp, Compass, Zap, Cloud, Thermometer, Wind, Navigation } from 'lucide-react';
import { useFlightStore } from '@/store/useFlightStore';

function MetricCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-black/30 rounded-2xl p-4 border border-white/5 flex flex-col gap-2 relative overflow-hidden group">
      <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center mb-1">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">{label}</p>
        <p className="font-bold text-lg text-white">{value}</p>
      </div>
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

  const timeAgo = (unixTimestamp: number) => {
    if (!unixTimestamp) return 'Just now';
    const seconds = Math.floor(Date.now()/1000 - unixTimestamp);
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
    <div className="w-[420px] h-full flex flex-col glass-panel border-r border-t-0 p-5 gap-4 overflow-y-auto z-10">
      <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-lg flex items-center gap-2 text-white">
            <Activity className="w-5 h-5 text-yellow-500" /> Deep Telemetry
          </h2>
          <span className="text-xs text-muted-foreground uppercase tracking-widest">ADS-B Stream</span>
      </div>

      {airportData ? (
        <div className="flex flex-col gap-4">
          <div className="bg-gradient-to-br from-[#121826] to-[#0A0D15] rounded-3xl p-5 border border-white/10 relative shadow-2xl overflow-hidden flex flex-col gap-4">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 blur-[50px] rounded-full"></div>
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg border border-white/20">
                  <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="z-10 relative text-right">
                  <div className="text-[10px] text-blue-400 uppercase tracking-widest font-bold mb-1">Airport Geocoded</div>
                  <h3 className="font-black text-3xl leading-none">{airportData.iata || 'N/A'}</h3>
              </div>
            </div>
            <div className="z-10 relative">
              <h4 className="text-xl font-bold text-white mb-1">{airportData.name}</h4>
              <div className="text-sm font-medium text-gray-400">{airportData.city}, {airportData.country}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/40 rounded-2xl p-4 border border-white/5 flex flex-col gap-1 hover:border-white/10 transition-colors">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">ICAO Code</span>
                <span className="font-mono text-white text-lg">{airportData.icao || 'None'}</span>
              </div>
              <div className="bg-black/40 rounded-2xl p-4 border border-white/5 flex flex-col gap-1 hover:border-white/10 transition-colors">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">Elevation</span>
                <span className="font-mono text-white text-lg">{airportData.elevation ? `${airportData.elevation}m` : 'N/A'}</span>
              </div>
              <div className="col-span-2 bg-black/40 rounded-2xl p-4 border border-white/5 flex flex-col gap-1 hover:border-white/10 transition-colors">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">Timezone</span>
                <span className="font-mono text-white text-lg">{airportData.timezone || 'Unknown'}</span>
              </div>
              <div className="col-span-2 bg-black/40 rounded-2xl p-4 border border-white/5 flex flex-col gap-1 hover:border-white/10 transition-colors">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">Global Coordinates</span>
                <span className="font-mono text-green-400 text-sm tracking-widest">{airportData.lat.toFixed(4)}°, {airportData.lng.toFixed(4)}°</span>
              </div>
          </div>
        </div>
      ) : selectedFlight ? (
        <div className="flex flex-col gap-4">
            {/* Primary Identifier */}
            <div className="bg-gradient-to-br from-[#121826] to-[#0A0D15] rounded-3xl p-5 border border-white/10 relative shadow-2xl overflow-hidden flex flex-col gap-4">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-500/10 blur-[50px] rounded-full"></div>
              
              <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-black border border-white/20 flex items-center justify-center shadow-lg transform -rotate-12 z-10 relative">
                        <Plane className="w-7 h-7 text-yellow-500 transform rotate-12" />
                    </div>
                    <div className="z-10 relative">
                        <div className="text-[10px] text-yellow-500 uppercase tracking-widest font-bold mb-1">Target Acquired</div>
                        <h3 className="font-black text-3xl leading-none">{selectedFlight.flightNumber || 'Unknown'}</h3>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20 uppercase tracking-widest z-10 relative">Airborne</span>
              </div>

              {/* Aircraft Image */}
              <div className="w-full h-40 rounded-xl overflow-hidden relative border border-white/5 bg-black/40 z-10 flex items-center justify-center group">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground z-0">
                  <Plane className="w-8 h-8 mb-2 opacity-30" />
                  <span className="text-[10px] uppercase tracking-widest opacity-50">No Photographic Data</span>
                </div>
                {flightPhotoUrl && (
                  <img 
                    key={flightPhotoUrl}
                    src={flightPhotoUrl} 
                    alt={`Aircraft ${selectedFlight.id}`} 
                    className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity relative z-10 block"
                    onError={(e) => { 
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>

              <div className="flex flex-1 items-center gap-4 text-sm font-medium text-gray-300 z-10 relative bg-black/20 p-3 rounded-xl border border-white/5">
                  <div className="flex-1">
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">Callsign / Ops</div>
                    <div className="font-bold text-white mb-0.5">{selectedFlight.flightNumber || 'N/A'}</div>
                    <div className="text-[9px] text-gray-400 font-medium truncate">{selectedFlight.airline}</div>
                  </div>
                  <div className="flex-1 border-l border-white/10 pl-4 overflow-hidden">
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">Aircraft Type</div>
                    <div className="font-bold text-white mb-0.5 truncate" title={aircraftMetadata?.manufacturer ? `${aircraftMetadata.manufacturer} ${aircraftMetadata.type}` : flightRouteData?.aircraftModel}>
                      {aircraftMetadata?.type || flightRouteData?.aircraftModel || 'Unknown Type'}
                    </div>
                    <div className="text-[9px] text-yellow-500 font-mono font-bold tracking-wider">{aircraftMetadata?.registration || flightRouteData?.registration || '---'}</div>
                  </div>
              </div>
              {/* Expanded Aircraft Metadata */}
              {aircraftMetadata && (
                <div className="flex flex-col gap-1 text-sm font-medium text-gray-300 z-10 relative bg-black/20 p-3 rounded-xl border border-white/5 mt-[-8px]">
                  <div className="flex justify-between border-b border-white/5 pb-1 mb-1">
                    <span className="text-[10px] text-gray-500 uppercase">Manufacturer</span>
                    <span className="text-[11px] text-white font-semibold">{aircraftMetadata.manufacturer || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-gray-500 uppercase">Registered Owner</span>
                    <span className="text-[11px] text-white font-semibold">{aircraftMetadata.registered_owner || 'Unknown'} ({aircraftMetadata.registered_owner_country_iso_name || 'N/A'})</span>
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
                    className={`flex-1 bg-black/40 rounded-2xl p-4 border flex flex-col gap-1 relative overflow-hidden group border-l-4 border-l-yellow-500 cursor-pointer hover:bg-white/5 transition-colors ${expandedRoute === 'origin' ? 'border-white/20' : 'border-white/5'}`}>
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-1"><MapPin className="w-3 h-3 text-yellow-500"/> Origin</span>
                      <span className="font-bold text-white leading-tight mt-1 truncate">{flightRouteData.origin}</span>
                      <span className="font-mono text-xs text-yellow-500/80">{flightRouteData.originIata} / {flightRouteData.originIcao}</span>
                  </div>
                  <div 
                    onClick={() => setExpandedRoute(expandedRoute === 'destination' ? null : 'destination')}
                    className={`flex-1 bg-black/40 rounded-2xl p-4 border flex flex-col gap-1 relative overflow-hidden group border-l-4 border-l-green-500 cursor-pointer hover:bg-white/5 transition-colors ${expandedRoute === 'destination' ? 'border-white/20' : 'border-white/5'}`}>
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-1"><Flag className="w-3 h-3 text-green-500"/> Destination</span>
                      <span className="font-bold text-white leading-tight mt-1 truncate">{flightRouteData.destination}</span>
                      <span className="font-mono text-xs text-green-500/80">{flightRouteData.destinationIata} / {flightRouteData.destinationIcao}</span>
                  </div>
                </div>
                {flightRouteData.source && (
                  <div className="text-[9px] text-muted-foreground/50 uppercase tracking-[0.2em] text-center mt-1">Data Source: {flightRouteData.source}</div>
                )}
                
                {/* Expanded Route Details */}
                {expandedRoute && (
                  <div className={`p-4 rounded-2xl border bg-black/60 shadow-inner flex flex-col gap-3 relative ${expandedRoute === 'origin' ? 'border-yellow-500/30' : 'border-green-500/30'}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        {expandedRoute === 'origin' ? <MapPin className="w-20 h-20" /> : <Flag className="w-20 h-20" />}
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-white border-b border-white/10 pb-2 flex items-center gap-2">
                      {expandedRoute === 'origin' ? <span className="text-yellow-500">Origin Details</span> : <span className="text-green-500">Destination Details</span>}
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm z-10 w-full relative">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] uppercase text-gray-500 tracking-wider">City / Region</span>
                          <span className="font-semibold text-gray-200">
                            {flightRouteData[`${expandedRoute}Timezone`] ? flightRouteData[`${expandedRoute}Timezone`].split('/').pop().replace(/_/g, ' ') : 'Unknown'}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] uppercase text-gray-500 tracking-wider">Airport Full Name</span>
                          <span className="font-semibold text-gray-200 truncate pr-2" title={flightRouteData[expandedRoute]}>{flightRouteData[expandedRoute]}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] uppercase text-gray-500 tracking-wider">Terminal</span>
                          <span className="font-mono text-white">{flightRouteData[`${expandedRoute}Terminal`] || 'TBD'}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] uppercase text-gray-500 tracking-wider">Gate</span>
                          <span className="font-mono text-white">{flightRouteData[`${expandedRoute}Gate`] || 'TBD'}</span>
                        </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Metric Grid */}
            <div className="grid grid-cols-2 gap-3">
              <MetricCard icon={<ArrowUp className="w-4 h-4 text-primary" />} label="Altitude" value={selectedFlight.altitude != null ? `${selectedFlight.altitude.toLocaleString()} ft` : 'Unknown'} />
              <MetricCard icon={<Activity className="w-4 h-4 text-green-400" />} label="Ground Speed" value={selectedFlight.speed != null ? `${selectedFlight.speed} km/h` : 'Unknown'} />
              <MetricCard icon={<Compass className="w-4 h-4 text-purple-400" />} label="True Heading" value={selectedFlight.heading != null ? `${Math.round(selectedFlight.heading)}°` : 'Unknown'} />
              <MetricCard icon={<Zap className="w-4 h-4 text-yellow-400" />} label="Vertical Rate" value={selectedFlight.verticalRate != null ? `${selectedFlight.verticalRate} m/s` : 'Level'} />
            </div>

            {/* ETA Card */}
            {eta && (
              <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/5 rounded-2xl p-4 border border-emerald-500/20 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Estimated Arrival</span>
                  <span className="font-bold text-white text-lg">~{eta.hours} hours</span>
                </div>
                <div className="flex flex-col gap-1 text-right">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">Distance Remaining</span>
                  <span className="font-mono text-emerald-400">{eta.distanceKm.toLocaleString()} km</span>
                </div>
              </div>
            )}

            {/* Additional Geographic Info */}
            <div className="bg-black/40 rounded-2xl p-5 border border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Live Latitude</span>
                  <span className="font-mono text-sm">{selectedFlight.lat.toFixed(4)}°</span>
              </div>
              <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Live Longitude</span>
                  <span className="font-mono text-sm">{selectedFlight.lng.toFixed(4)}°</span>
              </div>
              <div className="h-[1px] w-full bg-white/10"></div>
              <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Signal Ping</span>
                  <span className="text-sm font-medium flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    {timeAgo(selectedFlight.lastContact)}
                  </span>
              </div>
            </div>

            {/* Meteorological Data */}
            {weatherData && (
              <div className="bg-gradient-to-br from-[#121826]/80 to-[#0A0D15]/80 rounded-2xl p-5 border border-blue-500/10 space-y-4">
                  <h3 className="text-xs text-blue-400 font-bold uppercase tracking-widest flex items-center gap-2 mb-2">
                    <Cloud className="w-4 h-4" /> Ground Weather Below Aircraft
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1"><Thermometer className="w-3 h-3"/> Ground Temp</span>
                        <span className="font-mono text-lg">{weatherData.temperature_2m}°C</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1"><Wind className="w-3 h-3"/> Surface Wind</span>
                        <span className="font-mono text-lg">{weatherData.wind_speed_10m} km/h</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 mt-2">
                    <span className="text-xs text-gray-500">Weather Synopsis</span>
                    <span className="text-sm font-medium text-white">{
                      weatherData.weather_code === 0 ? 'Clear sky' : 
                      weatherData.weather_code <= 3 ? 'Partly cloudy' : 
                      weatherData.weather_code < 50 ? 'Fog / Haze' : 
                      weatherData.weather_code < 70 ? 'Rain / Drizzle' : 
                      weatherData.weather_code < 80 ? 'Snow' : 'Thunderstorm'
                    }</span>
                  </div>
              </div>
            )}

            {/* Trajectory message */}
            <p className="text-xs text-center text-muted-foreground mt-2">
              Map shows flight trajectory. Data provided by OpenSky Network.
            </p>
        </div>
      ) : (
        <div className="flex-1 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-muted-foreground bg-black/20">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Navigation className="w-6 h-6 opacity-60" />
            </div>
            <h3 className="font-semibold text-white mb-2">No Target Selected</h3>
            <p className="text-sm px-8 text-center text-gray-500">Tap an aircraft on the radar map to lock onto its transponder and view trajectory details.</p>
        </div>
      )}
    </div>
  );
}
