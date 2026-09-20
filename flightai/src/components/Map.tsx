"use client";

import { useEffect, useState, memo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { socket } from '@/lib/socket';
import axios from 'axios';


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aervyn.in';

const CATEGORIES = {
  COMMERCIAL: 'COMMERCIAL',
  PRIVATE: 'PRIVATE',
  CARGO: 'CARGO',
  HELICOPTER: 'HELICOPTER',
  MILITARY: 'MILITARY',
  SMALL_PROP: 'SMALL_PROP',
  GLIDER: 'GLIDER',
  UNKNOWN: 'UNKNOWN'
} as const;

type AircraftCategory = typeof CATEGORIES[keyof typeof CATEGORIES];

const SIZES: Record<AircraftCategory, number> = {
  [CATEGORIES.COMMERCIAL]: 34,
  [CATEGORIES.CARGO]: 36,
  [CATEGORIES.PRIVATE]: 28,
  [CATEGORIES.MILITARY]: 30,
  [CATEGORIES.HELICOPTER]: 24,
  [CATEGORIES.SMALL_PROP]: 22,
  [CATEGORIES.GLIDER]: 24,
  [CATEGORIES.UNKNOWN]: 26,
};

const PATHS: Record<AircraftCategory, string> = {
  // Classic top-down airliner
  [CATEGORIES.COMMERCIAL]: 'M11.97,2.023c-1.391,0-1.84,1.385-1.84,1.936v6.232L2.528,14.659v2.181l7.602-2.386v5.823l-2.072,1.554v1.543l3.912-1.121l3.911,1.121v-1.543l-2.071-1.554v-5.823l7.602,2.386v-2.181l-7.602-4.468V3.959C13.809,3.407,13.36,2.023,11.97,2.023z',
  // Thicker body, shorter wings for cargo
  [CATEGORIES.CARGO]: 'M11,1 L13,1 C14,1 15,2 15,3 L15,12 L22,14 L22,16 L15,15 L15,20 L17,22 L7,22 L9,20 L9,15 L2,16 L2,14 L9,12 L9,3 C9,2 10,1 11,1 Z',
  // Sleek, swept wings, T-tail (Private Jet)
  [CATEGORIES.PRIVATE]: 'M12,2 C10.5,2 9.5,3.5 9.5,5 L9.5,11 L3,16 L3,18 L9.5,15 L9.5,19 L6,21 L6,22.5 L12,21.5 L18,22.5 L18,21 L14.5,19 L14.5,15 L21,18 L21,16 L14.5,11 L14.5,5 C14.5,3.5 13.5,2 12,2 Z',
  // Sharp delta wing for fighter jet
  [CATEGORIES.MILITARY]: 'M12 2 L14 14 L22 18 L22 20 L14 18 L12 22 L10 18 L2 20 L2 18 L10 14 Z',
  // Standard Helicopter (cabin, tail boom, tail rotor, main rotor)
  [CATEGORIES.HELICOPTER]: 'M12 6 C14 6 15.5 8 15.5 10.5 C15.5 13 14 15 12 15 C10 15 8.5 13 8.5 10.5 C8.5 8 10 6 12 6 Z M11 15 L11 21 L8 21 L8 23 L16 23 L16 21 L13 21 L13 15 Z M1 9.5 L23 9.5 L23 11.5 L1 11.5 Z',
  // Straight wings, prop in front
  [CATEGORIES.SMALL_PROP]: 'M11,4 L13,4 L13,9 L22,9 L22,11 L13,11 L13,18 L15,20 L9,20 L11,18 L11,11 L2,11 L2,9 L11,9 Z M10,2 L14,2 L14,4 L10,4 Z',
  // Long thin wings
  [CATEGORIES.GLIDER]: 'M11.5,4 L12.5,4 L12.5,11 L23,11 L23,12 L12.5,12 L12.5,18 L14,20 L10,20 L11.5,18 L11.5,12 L1,12 L1,11 L11.5,11 Z',
  // Generic fallback aircraft (was chevron, now standard plane)
  [CATEGORIES.UNKNOWN]: 'M11.97,2.023c-1.391,0-1.84,1.385-1.84,1.936v6.232L2.528,14.659v2.181l7.602-2.386v5.823l-2.072,1.554v1.543l3.912-1.121l3.911,1.121v-1.543l-2.071-1.554v-5.823l7.602,2.386v-2.181l-7.602-4.468V3.959C13.809,3.407,13.36,2.023,11.97,2.023z',
};

// Advanced Heuristic Engine
const classifyAircraft = (flight: any, routeData?: any): AircraftCategory => {
  const callsign = (flight.flightNumber || '').toUpperCase();
  const model = (routeData?.aircraftModel || '').toUpperCase();
  const typeCode = (flight.airline || '').toUpperCase();
  const speed = flight.speed || 0;
  const alt = flight.altitude || 0;

  // 1. Helicopter
  if (model.includes('HELICOPTER') || model.includes('ROTOR') || 
      typeCode.startsWith('H') || ['EC35', 'R22', 'R44', 'R66', 'B06', 'A109'].includes(typeCode) ||
      (speed < 200 && alt < 5000 && speed > 0 && !model.includes('GLIDER'))) {
    return CATEGORIES.HELICOPTER;
  }

  // 2. Military
  if (callsign.startsWith('MIL') || callsign.startsWith('NAVY') || callsign.startsWith('AF') ||
      model.includes('MILITARY') || ['F16', 'F18', 'F22', 'F35', 'C130', 'A10', 'K35R'].includes(typeCode)) {
    return CATEGORIES.MILITARY;
  }

  // 3. Cargo
  if (callsign.includes('CARGO') || callsign.includes('DHL') || callsign.includes('FDX') || 
      callsign.includes('UPS') || callsign.includes('GTI') || model.includes('CARGO') ||
      (typeCode.endsWith('F') && typeCode.length > 3)) { // e.g. B744F
    return CATEGORIES.CARGO;
  }

  // 4. Glider
  if (model.includes('GLIDER') || (speed < 120 && alt < 10000 && speed > 20)) {
    return CATEGORIES.GLIDER;
  }

  // 5. Small Prop
  if (['C172', 'C152', 'P28A', 'SR22', 'BE36'].includes(typeCode) || 
      (speed < 300 && alt < 12000 && speed > 0)) {
    return CATEGORIES.SMALL_PROP;
  }

  // 6. Private Jet
  if (['GLF', 'CL60', 'C560', 'E55P', 'FA7X', 'LJ'].includes(typeCode) || 
      (speed > 400 && alt > 25000 && (typeCode === 'N/A' || typeCode === 'PRIVATE/UNKNOWN' || typeCode === 'PRIVATE'))) {
    return CATEGORIES.PRIVATE;
  }

  // 7. Commercial Jet (Default for high speed/alt)
  if (speed >= 400 || alt >= 20000 || model.includes('BOEING') || model.includes('AIRBUS')) {
    return CATEGORIES.COMMERCIAL;
  }

  return CATEGORIES.UNKNOWN;
};

const createAircraftIcon = (category: AircraftCategory, heading: number, isSelected: boolean, hasSelection: boolean, zoom: number, performanceMode: boolean, flight: any) => {
  const isDetailed = zoom >= 6 && !performanceMode;
  
  const color = isSelected ? '#38bdf8' : '#fbbf24'; 
  const strokeColor = isSelected ? '#ffffff' : '#111111';
  let scale = isSelected ? 1.4 : 1.0;
  
  if (zoom < 5) scale *= 0.6;
  else if (zoom < 7) scale *= 0.8;

  const dimClass = (!isSelected && hasSelection) ? 'dimmed-plane' : '';
  const size = isDetailed ? SIZES[category] : Math.max(16, SIZES[category] * 0.7);
  const svgPath = PATHS[category];
  const filter = isDetailed ? `filter="drop-shadow(0px 8px 8px rgba(0,0,0,0.6))"` : '';
  const fillStyle = isDetailed ? `url(#metallic-${isSelected ? 'selected' : 'normal'})` : color;
  
  let labelHtml = '';
  if (isSelected) {
    const callsign = flight.flightNumber || flight.callsign || 'UNK';
    const alt = flight.altitude ? `${flight.altitude} FT` : '---';
    const speed = flight.speed ? `${flight.speed} KT` : '---';
    labelHtml = `
      <div class="absolute left-8 top-1/2 -translate-y-1/2 bg-aervyn-panel-base border border-aervyn-status-cyan text-aervyn-text-primary px-2 py-1 rounded shadow-lg pointer-events-none flex flex-col whitespace-nowrap z-50">
        <span class="font-labels text-xs font-bold text-aervyn-status-cyan tracking-widest">${callsign}</span>
        <span class="font-labels text-[9px] font-bold text-aervyn-text-tertiary tracking-widest mt-0.5">ALT <span class="text-aervyn-text-secondary">${alt}</span> | GS <span class="text-aervyn-text-secondary">${speed}</span></span>
      </div>
    `;
  }

  return L.divIcon({
    className: `custom-plane-icon ${isSelected ? 'selected-plane z-50' : ''} ${dimClass}`,
    html: `
      <div class="relative w-full h-full">
        ${isSelected ? `<div class="selection-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-aervyn-status-cyan"></div>` : ''}
        <div style="transform: rotate(${heading}deg) scale(${scale}); transition: transform 0.3s ease; will-change: transform;" class="absolute inset-0 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" ${filter}>
            ${isDetailed ? `
            <defs>
              <linearGradient id="metallic-normal" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#fcd34d;stop-opacity:1" />
                <stop offset="50%" style="stop-color:#fbbf24;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#d97706;stop-opacity:1" />
              </linearGradient>
              <linearGradient id="metallic-selected" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#7dd3fc;stop-opacity:1" />
                <stop offset="50%" style="stop-color:#38bdf8;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#0284c7;stop-opacity:1" />
              </linearGradient>
            </defs>
            ` : ''}
            <path d="${svgPath}" fill="${fillStyle}" stroke="${strokeColor}" stroke-width="${isDetailed ? '0.8' : '1.2'}" stroke-linejoin="round" />
          </svg>
        </div>
        ${labelHtml}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)],
  });
};

const iconCache: Record<string, L.DivIcon> = {};
const getAircraftIcon = (flight: any, routeData: any, isSelected: boolean, hasSelection: boolean, zoom: number, performanceMode: boolean) => {
  const category = classifyAircraft(flight, isSelected ? routeData : null);
  
  const bucketedHeading = Math.round((flight.heading || 0) / 15) * 15;
  const zoomBucket = zoom < 5 ? 'low' : zoom < 7 ? 'mid' : 'high';
  
  // Do not cache selected aircraft icons as their altitude/speed data changes constantly
  if (isSelected) {
    return createAircraftIcon(category, flight.heading || 0, isSelected, hasSelection, zoom, performanceMode, flight);
  }
  
  const cacheKey = `${category}-${bucketedHeading}-${isSelected}-${hasSelection}-${zoomBucket}-${performanceMode}`;
  
  if (!iconCache[cacheKey]) {
    iconCache[cacheKey] = createAircraftIcon(category, bucketedHeading, isSelected, hasSelection, zoom, performanceMode, flight);
  }
  return iconCache[cacheKey];
};

function MapController({ targetPos }: { targetPos: [number, number] | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (targetPos) {
       map.flyTo(targetPos, 8, { duration: 1.5 });
    }
  }, [targetPos, map]);

  useEffect(() => {
    socket.on('command_focus_map', (data: any) => {
      map.flyTo([data.lat, data.lng], data.zoom || 8, { duration: 2 });
    });
    return () => { socket.off('command_focus_map'); };
  }, [map]);
  return null;
}

function PopupHandler({ onClose }: { onClose: () => void }) {
  const map = useMap();
  useEffect(() => {
    const handler = () => onClose();
    map.on('popupclose', handler);
    return () => { map.off('popupclose', handler); };
  }, [map, onClose]);
  return null;
}

const PureMarker = ({ targetPosition, icon, eventHandlers, children }: any) => {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng(targetPosition);
    }
  }, [targetPosition[0], targetPosition[1]]);

  return (
    <Marker 
      ref={markerRef} 
      position={targetPosition} 
      icon={icon} 
      eventHandlers={eventHandlers}
    >
      {children}
    </Marker>
  );
};

function MarkerLayer({ flights, selectedFlightId, routeData, onFlightSelect, onFlightDeselect, performanceMode }: { flights: any[], selectedFlightId: string | null, routeData: any, onFlightSelect: (flight: any) => void, onFlightDeselect: () => void, performanceMode: boolean }) {
  const map = useMap();
  const [bounds, setBounds] = useState(() => map.getBounds().pad(1.0));
  const [zoom, setZoom] = useState(() => map.getZoom());
  const hasSelection = !!selectedFlightId;
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;
    
    const updateBounds = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const currentBounds = map.getBounds().pad(0.2); // Smaller pad to avoid over-fetching
        const currentZoom = map.getZoom();
        setBounds(currentBounds);
        setZoom(currentZoom);
        
        if (currentZoom >= 5 && !document.hidden) {
          socket.volatile.emit('viewport_update', {
            minLat: currentBounds.getSouth(),
            maxLat: currentBounds.getNorth(),
            minLng: currentBounds.getWest(),
            maxLng: currentBounds.getEast()
          });
        }
      }, 750); // 750ms debounce
    };
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(intervalId);
        socket.emit('pause_updates');
      } else {
        socket.emit('resume_updates');
        updateBounds(); // Immediate fetch on foreground
        intervalId = setInterval(updateBounds, 5000); // Resume polling
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    map.on('moveend', updateBounds);
    map.on('zoomend', updateBounds);
    
    // Initial fetch and poll setup
    if (!document.hidden) {
      updateBounds();
      intervalId = setInterval(updateBounds, 5000);
    }
    
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      map.off('moveend', updateBounds);
      map.off('zoomend', updateBounds);
    };
  }, [map]);

  const center = map.getCenter();
  const visibleFlights = flights.filter(flight => {
    // Always render the selected flight so it never vanishes during target acquisition
    if (flight.id === selectedFlightId) return true;
    try {
      return bounds.contains(L.latLng(flight.lat, flight.lng));
    } catch {
      return true;
    }
  })
  .sort((a, b) => {
    // Keep selected flight at the very top of the list always
    if (a.id === selectedFlightId) return -1;
    if (b.id === selectedFlightId) return 1;
    
    // Sort by proximity to viewport center
    const distA = Math.pow(a.lat - center.lat, 2) + Math.pow(a.lng - center.lng, 2);
    const distB = Math.pow(b.lat - center.lat, 2) + Math.pow(b.lng - center.lng, 2);
    return distA - distB;
  })
  .slice(0, 1500); // Strict safety cap prioritizing closest to center

  return (
    <>
      <PopupHandler onClose={onFlightDeselect} />
      {visibleFlights.map(flight => (
        <PureMarker 
          key={flight.id} 
          targetPosition={[flight.lat, flight.lng]}
          icon={getAircraftIcon(flight, routeData, flight.id === selectedFlightId, hasSelection, zoom, performanceMode)}
          eventHandlers={{
            click: () => onFlightSelect(flight)
          }}
        >
          <Popup className="glass-popup">
            <div className="font-labels min-w-[120px] text-center">
              <div className="font-extrabold text-xs uppercase tracking-widest text-aervyn-text-primary">{flight.flightNumber || 'Unknown'}</div>
              <div className="text-[10px] text-aervyn-text-secondary font-bold mb-1 truncate max-w-[150px] uppercase tracking-widest">{flight.airline}</div>
              {flight.id === selectedFlightId && routeData?.aircraftModel && (
                <div className="text-[9px] text-aervyn-status-cyan font-bold mt-1 uppercase tracking-widest border-t border-aervyn-border-subtle pt-1">{routeData.aircraftModel}</div>
              )}
            </div>
          </Popup>
        </PureMarker>
      ))}
    </>
  );
}

interface MapProps {
  onFlightSelect: (flight: any) => void;
  onFlightDeselect: () => void;
  selectedFlightId: string | null;
  routeData?: any;
  targetPos?: [number, number] | null;
  mapMode?: 'satellite' | 'dark';
  performanceMode?: boolean;
}

const pathCache = new Map<string, [number, number][]>();

const MapComponent = ({ onFlightSelect, onFlightDeselect, selectedFlightId, routeData, targetPos, mapMode = 'dark', performanceMode = false }: MapProps) => {
  const [flights, setFlights] = useState<any[]>([]);
  const [flightPath, setFlightPath] = useState<[number, number][]>([]);
  const [isZoomedOut, setIsZoomedOut] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoadingTrail, setIsLoadingTrail] = useState(false);

  useEffect(() => {
    socket.on('flights_update', (updatedFlights: any[]) => {
      setFlights(updatedFlights);
    });
    
    socket.on('viewport_error', (data) => {
      if (data.reason === 'zoom_too_wide') {
        setMapError('Zoom in to see live traffic');
        setFlights([]);
      }
    });

    socket.on('data_outage', (data) => {
      if (data.active) {
        setMapError('Live data temporarily unavailable');
      } else {
        setMapError(null);
      }
    });

    return () => { 
      socket.off('flights_update'); 
      socket.off('viewport_error');
      socket.off('data_outage');
    };
  }, []);

  useEffect(() => {
    if (selectedFlightId) {
      if (pathCache.has(selectedFlightId)) {
        setFlightPath(pathCache.get(selectedFlightId)!);
        setIsLoadingTrail(false); // We have cached data
      } else {
        setFlightPath([]);
        setIsLoadingTrail(true); // First time fetch
      }
      
      // Fetch fresh historical path
      axios.get(`${API_URL}/api/flight-path/${selectedFlightId}`)
        .then(res => {
          if (res.data && res.data.path) {
             const pathPoints: [number, number][] = res.data.path.map((pt: any) => [pt[1], pt[2]]);
             pathCache.set(selectedFlightId, pathPoints);
             setFlightPath(pathPoints);
          } else {
             pathCache.set(selectedFlightId, []);
             setFlightPath([]);
          }
          setIsLoadingTrail(false);
        })
        .catch(() => {
          setIsLoadingTrail(false);
          if (!pathCache.has(selectedFlightId)) {
             setFlightPath([]);
          }
        });
    } else {
      setTimeout(() => {
        setFlightPath([]);
        setIsLoadingTrail(false);
      }, 0);
    }
  }, [selectedFlightId]);

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={[20, 0]} 
        zoom={4} 
        minZoom={4}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
        style={{ width: '100%', height: '100%', background: mapMode === 'satellite' ? '#020304' : '#000000' }}
        zoomControl={false}
        attributionControl={true}
        // @ts-expect-error - react-leaflet typing issue
        whenReady={(mapEvent: any) => {
           const map = mapEvent.target;
           const checkZoom = () => setIsZoomedOut(map.getZoom() < 5);
           checkZoom();
           map.on('zoomend', checkZoom);
        }}
      >
        <MapController targetPos={targetPos || null} />
        
        {mapMode === 'satellite' ? (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
            noWrap={true}
            attribution='&copy; <a href="https://www.esri.com/">Esri</a> | Flight data provided by <a href="https://adsb.lol">ADSB.lol</a> (ODbL)'
          />
        ) : (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            maxZoom={16}
            noWrap={true}
            className="map-tiles"
            attribution='&copy; <a href="https://www.esri.com/">Esri</a> | Flight data provided by <a href="https://adsb.lol">ADSB.lol</a> (ODbL)'
          />
        )}
        
        {flightPath.length > 0 && (
          <Polyline positions={flightPath} pathOptions={{ color: '#3b82f6', weight: 3, dashArray: '5, 10', opacity: 0.8 }} />
        )}
        
        <MarkerLayer flights={flights} selectedFlightId={selectedFlightId} routeData={routeData} onFlightSelect={onFlightSelect} onFlightDeselect={onFlightDeselect} performanceMode={performanceMode} />
      </MapContainer>
      
      {/* Dynamic Map Overlays (Errors) */}
      {mapError && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] pointer-events-none font-labels">
          <div className="bg-aervyn-panel-base/80 backdrop-blur-md border border-aervyn-border-subtle text-aervyn-text-primary px-6 py-2 rounded font-bold text-[10px] tracking-widest uppercase shadow-lg flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-aervyn-status-amber" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {mapError}
          </div>
        </div>
      )}

      {/* Loading Trail Indicator */}
      {isLoadingTrail && (
        <div className="absolute top-4 right-4 z-[1000] pointer-events-none font-labels">
          <div className="bg-aervyn-panel-base/80 backdrop-blur-md border border-aervyn-border-subtle text-aervyn-text-primary px-4 py-2 rounded font-bold text-[10px] tracking-widest uppercase shadow-lg flex items-center gap-2">
            <svg className="animate-spin h-3 w-3 text-aervyn-status-cyan" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading trail...
          </div>
        </div>
      )}

      <style jsx global>{`
        .leaflet-container { background: aervyn-bg-dark !important; }
        .leaflet-popup-content-wrapper { background: aervyn-panel-base !important; border: 1px solid aervyn-border-subtle !important; color: aervyn-text-primary !important; border-radius: 4px !important; box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important; }
        .leaflet-popup-tip { background: aervyn-panel-base !important; border-top: 1px solid aervyn-border-subtle !important; border-left: 1px solid aervyn-border-subtle !important; box-shadow: none !important; }
        .leaflet-popup-content { margin: 8px !important; font-family: labels !important; }
      `}</style>
    </div>
  );
}

export default memo(MapComponent);
