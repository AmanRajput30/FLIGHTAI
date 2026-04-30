"use client";

import { useEffect, useState, memo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { io } from 'socket.io-client';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const createPlaneIcon = (heading: number, isSelected: boolean, hasSelection: boolean) => {
  const color = isSelected ? '#38bdf8' : '#fbbf24'; // Cyan-sky highlight if selected, yellow otherwise
  const scale = isSelected ? 1.3 : 1.0;
  const dimClass = (!isSelected && hasSelection) ? 'dimmed-plane' : '';
  // Subtle glow ring for selected plane instead of aggressive radar pulse
  const glowRing = isSelected ? `<div class="selection-glow"></div>` : '';
  // FlightRadar-style solid commercial jet top-down outline
  return L.divIcon({
    className: `custom-plane-icon ${isSelected ? 'selected-plane' : ''} ${dimClass}`,
    html: `
      ${glowRing}
      <div style="transform: rotate(${heading}deg) scale(${scale}); transition: transform 0.3s ease;">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${color}" stroke="#111111" stroke-width="1.2" stroke-linejoin="round">
          <path d="M11.97,2.023c-1.391,0-1.84,1.385-1.84,1.936v6.232L2.528,14.659v2.181l7.602-2.386v5.823l-2.072,1.554v1.543l3.912-1.121l3.911,1.121v-1.543l-2.071-1.554v-5.823l7.602,2.386v-2.181l-7.602-4.468V3.959C13.809,3.407,13.36,2.023,11.97,2.023z"/>
        </svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

const iconCache: Record<string, L.DivIcon> = {};
const getPlaneIcon = (heading: number, isSelected: boolean, hasSelection: boolean) => {
  const roundedHeading = Math.round(heading);
  const cacheKey = `${roundedHeading}-${isSelected}-${hasSelection}`;
  if (!iconCache[cacheKey]) {
    iconCache[cacheKey] = createPlaneIcon(roundedHeading, isSelected, hasSelection);
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

function MarkerLayer({ flights, selectedFlightId, onFlightSelect, onFlightDeselect }: { flights: any[], selectedFlightId: string | null, onFlightSelect: (flight: any) => void, onFlightDeselect: () => void }) {
  const map = useMap();
  const [bounds, setBounds] = useState(() => map.getBounds().pad(1.0));
  const hasSelection = !!selectedFlightId;
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const updateBounds = () => {
      clearTimeout(timeoutId);
      // Debounce the state update to ensure it never triggers a synchronous infinite render loop
      timeoutId = setTimeout(() => {
        setBounds(map.getBounds().pad(1.0));
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
          icon={getPlaneIcon(flight.heading, flight.id === selectedFlightId, hasSelection)}
          eventHandlers={{
            click: () => onFlightSelect(flight)
          }}
        >
          <Popup className="glass-popup">
            <div className="font-sans min-w-[120px] text-center">
              <div className="font-bold">{flight.flightNumber || 'Unknown'}</div>
              <div className="text-xs text-gray-400">{flight.airline}</div>
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
  targetPos?: [number, number] | null;
}

const MapComponent = ({ onFlightSelect, onFlightDeselect, selectedFlightId, targetPos }: MapProps) => {
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
        style={{ width: '100%', height: '100%', background: '#0d1117' }}
        zoomControl={false}
      >
        <MapController targetPos={targetPos || null} />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {flightPath.length > 0 && (
          <Polyline positions={flightPath} pathOptions={{ color: '#fbbf24', weight: 3, dashArray: '5, 10', opacity: 0.8 }} />
        )}
        
        <MarkerLayer flights={flights} selectedFlightId={selectedFlightId} onFlightSelect={onFlightSelect} onFlightDeselect={onFlightDeselect} />
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
