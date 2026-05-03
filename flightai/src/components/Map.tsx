"use client";

import { useEffect, useState, memo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { io } from 'socket.io-client';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

const createAircraftIcon = (category: AircraftCategory, heading: number, isSelected: boolean, hasSelection: boolean, zoom: number, performanceMode: boolean) => {
  const isDetailed = zoom >= 6 && !performanceMode;
  
  const color = isSelected ? '#38bdf8' : '#fbbf24'; 
  const strokeColor = isSelected ? '#ffffff' : '#111111';
  let scale = isSelected ? 1.4 : 1.0;
  
  // Zoom scaling
  if (zoom < 5) scale *= 0.6;
  else if (zoom < 7) scale *= 0.8;

  const dimClass = (!isSelected && hasSelection) ? 'dimmed-plane' : '';
  const glowRing = isSelected ? `<div class="selection-glow"></div>` : '';
  const size = isDetailed ? SIZES[category] : Math.max(16, SIZES[category] * 0.7);
  const svgPath = PATHS[category];
  
  const filter = isDetailed ? `filter="drop-shadow(0px 8px 8px rgba(0,0,0,0.6))"` : '';
  
  // Metallic gradient simulation
  const fillStyle = isDetailed ? `url(#metallic-${isSelected ? 'selected' : 'normal'})` : color;

  return L.divIcon({
    className: `custom-plane-icon ${isSelected ? 'selected-plane' : ''} ${dimClass}`,
    html: `
      ${glowRing}
      <div style="transform: rotate(${heading}deg) scale(${scale}); transition: transform 0.3s ease; will-change: transform;">
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
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)],
  });
};

const iconCache: Record<string, L.DivIcon> = {};
const getAircraftIcon = (flight: any, routeData: any, isSelected: boolean, hasSelection: boolean, zoom: number, performanceMode: boolean) => {
  const category = classifyAircraft(flight, isSelected ? routeData : null);
  
  // Bucket headings into 15 degree increments to save cache memory and DOM generation
  const bucketedHeading = Math.round((flight.heading || 0) / 15) * 15;
  const zoomBucket = zoom < 5 ? 'low' : zoom < 7 ? 'mid' : 'high';
  
  const cacheKey = `${category}-${bucketedHeading}-${isSelected}-${hasSelection}-${zoomBucket}-${performanceMode}`;
  
  if (!iconCache[cacheKey]) {
    iconCache[cacheKey] = createAircraftIcon(category, bucketedHeading, isSelected, hasSelection, zoom, performanceMode);
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
    const socket = io(API_URL);
    socket.on('command_focus_map', (data) => {
      map.flyTo([data.lat, data.lng], data.zoom || 8, { duration: 2 });
    });
    return () => { socket.disconnect(); };
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

function MarkerLayer({ flights, selectedFlightId, routeData, onFlightSelect, onFlightDeselect, performanceMode }: { flights: any[], selectedFlightId: string | null, routeData: any, onFlightSelect: (flight: any) => void, onFlightDeselect: () => void, performanceMode: boolean }) {
  const map = useMap();
  const [bounds, setBounds] = useState(() => map.getBounds().pad(1.0));
  const [zoom, setZoom] = useState(() => map.getZoom());
  const hasSelection = !!selectedFlightId;
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const updateBounds = () => {
      clearTimeout(timeoutId);
      // Debounce the state update to ensure it never triggers a synchronous infinite render loop
      timeoutId = setTimeout(() => {
        setBounds(map.getBounds().pad(1.0));
        setZoom(map.getZoom());
      }, 150);
    };
    
    map.on('moveend', updateBounds);
    map.on('zoomend', updateBounds);
    
    return () => {
      clearTimeout(timeoutId);
      map.off('moveend', updateBounds);
      map.off('zoomend', updateBounds);
    };
  }, [map]);

  const visibleFlights = flights.filter(flight => {
    // Always render the selected flight so it never vanishes during target acquisition
    if (flight.id === selectedFlightId) return true;
    try {
      return bounds.contains(L.latLng(flight.lat, flight.lng));
    } catch {
      return true;
    }
  }).slice(0, 1500); // Strict safety cap: Browsers physically crash rendering > 2000 complex SVG markers. 1500 provides massive density without hanging the DOM.

  return (
    <>
      <PopupHandler onClose={onFlightDeselect} />
      {visibleFlights.map(flight => (
        <Marker 
          key={flight.id} 
          position={[flight.lat, flight.lng]}
          icon={getAircraftIcon(flight, routeData, flight.id === selectedFlightId, hasSelection, zoom, performanceMode)}
          eventHandlers={{
            click: () => onFlightSelect(flight)
          }}
        >
          <Popup className="glass-popup">
            <div className="font-sans min-w-[120px] text-center">
              <div className="font-bold">{flight.flightNumber || 'Unknown'}</div>
              <div className="text-xs text-gray-400 font-medium mb-1 truncate max-w-[150px]">{flight.airline}</div>
              {flight.id === selectedFlightId && routeData?.aircraftModel && (
                <div className="text-[10px] text-yellow-400 mt-1 uppercase tracking-wider">{routeData.aircraftModel}</div>
              )}
            </div>
          </Popup>
        </Marker>
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
  mapMode?: 'satellite' | 'dark' | 'hybrid';
  performanceMode?: boolean;
}

const MapComponent = ({ onFlightSelect, onFlightDeselect, selectedFlightId, routeData, targetPos, mapMode = 'dark', performanceMode = false }: MapProps) => {
  const [flights, setFlights] = useState<any[]>([]);
  const [flightPath, setFlightPath] = useState<[number, number][]>([]);

  useEffect(() => {
    const socket = io(API_URL);
    socket.on('flights_update', (updatedFlights) => {
      setFlights(updatedFlights);
    });
    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    if (selectedFlightId) {
      // Fetch historical path
      axios.get(`${API_URL}/api/flight-path/${selectedFlightId}`)
        .then(res => {
          if (res.data && res.data.path) {
             // Path object is [time, lat, lng, ...]
             const pathPoints: [number, number][] = res.data.path.map((pt: any) => [pt[1], pt[2]]);
             setFlightPath(pathPoints);
          } else {
             setFlightPath([]);
          }
        })
        .catch(() => setFlightPath([]));
    } else {
      setFlightPath([]);
    }
  }, [selectedFlightId]);

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={[20, 0]} 
        zoom={3} 
        style={{ width: '100%', height: '100%', background: mapMode === 'satellite' ? '#020304' : '#0d1117' }}
        zoomControl={false}
      >
        <MapController targetPos={targetPos || null} />
        
        {mapMode === 'satellite' ? (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='Tiles &copy; Esri'
            maxZoom={19}
          />
        ) : (
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={19}
          />
        )}
        
        {flightPath.length > 0 && (
          <Polyline positions={flightPath} pathOptions={{ color: '#fbbf24', weight: 3, dashArray: '5, 10', opacity: 0.8 }} />
        )}
        
        <MarkerLayer flights={flights} selectedFlightId={selectedFlightId} routeData={routeData} onFlightSelect={onFlightSelect} onFlightDeselect={onFlightDeselect} performanceMode={performanceMode} />
      </MapContainer>
      

      
      <style jsx global>{`
        .leaflet-container { background: #0d1117 !important; }
        .leaflet-popup-content-wrapper { background: rgba(15, 23, 42, 0.9) !important; backdrop-filter: blur(12px) !important; border: 1px solid rgba(255, 255, 255, 0.1); color: #fafafa; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .leaflet-popup-tip { background: rgba(15, 23, 42, 0.9) !important; border-top: 1px solid rgba(255, 255, 255, 0.1); border-left: 1px solid rgba(255, 255, 255, 0.1); }
      `}</style>
    </div>
  );
}

export default memo(MapComponent);
