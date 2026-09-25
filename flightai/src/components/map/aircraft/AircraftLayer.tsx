import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import { useFlightStore } from '@/store/useFlightStore';

interface AircraftLayerProps {
  map: maplibregl.Map;
  onFlightSelect?: (id: string) => void;
}

// Professional, sleek airplane SVG facing exactly UP (0 degrees)
const PLANE_SVG_HTML = `
  <svg width="24" height="24" viewBox="0 0 24 24" style="transform: rotate(VAR_HEADINGdeg); transition: transform 0.3s ease; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));">
    <path d="M21,16V14L13,9V3.5A1.5,1.5 0 0,0 11.5,2A1.5,1.5 0 0,0 10,3.5V9L2,14V16L10,13.5V19L8,20.5V22L11.5,21L15,22V20.5L13,19V13.5L21,16Z" fill="#14F1D9" stroke="#000" stroke-width="0.5"/>
  </svg>
`;

export const AircraftLayer: React.FC<AircraftLayerProps> = ({ map, onFlightSelect }) => {
  const flights = useFlightStore((state) => state.flights);
  const selectedFlightId = useFlightStore((state) => state.selectedFlight?.id);
  const markersRef = useRef<{ [id: string]: maplibregl.Marker }>({});
  const [triggerUpdate, setTriggerUpdate] = useState(0);

  // Force recalculation when map moves
  useEffect(() => {
    if (!map) return;
    const onMoveEnd = () => setTriggerUpdate(v => v + 1);
    map.on('moveend', onMoveEnd);
    map.on('zoomend', onMoveEnd);
    return () => {
      map.off('moveend', onMoveEnd);
      map.off('zoomend', onMoveEnd);
    };
  }, [map]);

  // Clean up markers on unmount
  useEffect(() => {
    return () => {
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};
    };
  }, []);

  // Spatial Hashing & Marker rendering
  useEffect(() => {
    if (!map || flights.length === 0) return;

    const bounds = map.getBounds();
    const zoom = map.getZoom();

    // Expand bounds slightly to prevent popping
    const expandedBounds = {
      n: bounds.getNorth() + 5,
      s: bounds.getSouth() - 5,
      e: bounds.getEast() + 5,
      w: bounds.getWest() - 5
    };

    // Calculate grid size based on zoom.
    // At zoom 0, cells are massive (declutters whole world). At zoom 10, they are tiny.
    const gridSize = Math.max(0.02, 20 / Math.pow(2, zoom));
    
    const grid = new Set<string>();
    const visibleFlights = [];

    // Aggressively cull and declutter
    for (let i = 0; i < flights.length; i++) {
      const f = flights[i];
      const lng = Number(f.lng);
      const lat = Number(f.lat);
      
      if (isNaN(lng) || isNaN(lat)) continue;

      // Always render selected flight, bypass culling
      if (f.id === selectedFlightId) {
        visibleFlights.push(f);
        continue;
      }
      
      // Viewport culling
      if (lat < expandedBounds.s || lat > expandedBounds.n || lng < expandedBounds.w || lng > expandedBounds.e) {
        continue;
      }

      // Spatial Hashing (Grid Decluttering)
      const cellX = Math.floor(lng / gridSize);
      const cellY = Math.floor(lat / gridSize);
      const cellId = `${cellX},${cellY}`;

      if (!grid.has(cellId)) {
        grid.add(cellId);
        visibleFlights.push(f);
      }
    }

    const currentMarkers = markersRef.current;
    const newFlightIds = new Set(visibleFlights.map(f => f.id));

    // 1. Remove markers that are no longer visible or clustered out
    Object.keys(currentMarkers).forEach(id => {
      if (!newFlightIds.has(id)) {
        currentMarkers[id].remove();
        delete currentMarkers[id];
      }
    });

    // 2. Add or update visible markers
    visibleFlights.forEach(flight => {
      const lng = Number(flight.lng);
      const lat = Number(flight.lat);

      if (currentMarkers[flight.id]) {
        // Update existing marker
        currentMarkers[flight.id].setLngLat([lng, lat]);
        const el = currentMarkers[flight.id].getElement();
        const svg = el.querySelector('svg');
        if (svg) {
          svg.style.transform = `rotate(${Number(flight.heading) || 0}deg) ${flight.id === selectedFlightId ? 'scale(1.5)' : ''}`;
          const path = svg.querySelector('path');
          if (path) {
            path.setAttribute('fill', flight.id === selectedFlightId ? '#FF3366' : '#14F1D9');
          }
        }
        if (flight.id === selectedFlightId) {
          el.style.zIndex = '9999';
        } else {
          el.style.zIndex = '';
        }
      } else {
        // Create new marker
        const el = document.createElement('div');
        el.className = 'aircraft-marker cursor-pointer';
        el.innerHTML = PLANE_SVG_HTML.replace('VAR_HEADING', (flight.heading || 0).toString());
        
        if (flight.id === selectedFlightId) {
          el.style.zIndex = '9999';
          const svg = el.querySelector('svg');
          if (svg) {
            svg.style.transform = `rotate(${Number(flight.heading) || 0}deg) scale(1.5)`;
            const path = svg.querySelector('path');
            if (path) path.setAttribute('fill', '#FF3366');
          }
        }

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          if (onFlightSelect) onFlightSelect(flight.id);
        });

        el.addEventListener('mouseenter', () => {
          const svg = el.querySelector('svg');
          if (svg && flight.id !== selectedFlightId) svg.style.transform = `rotate(${Number(flight.heading) || 0}deg) scale(1.3)`;
        });
        
        el.addEventListener('mouseleave', () => {
          const svg = el.querySelector('svg');
          if (svg && flight.id !== selectedFlightId) svg.style.transform = `rotate(${Number(flight.heading) || 0}deg)`;
        });

        const marker = new maplibregl.Marker({
          element: el,
          anchor: 'center',
          rotationAlignment: 'map', // MapLibre 3+ handles rotation alignment via pitch naturally
          pitchAlignment: 'map'
        })
        .setLngLat([lng, lat])
        .addTo(map);

        currentMarkers[flight.id] = marker;
      }
    });

  }, [flights, map, onFlightSelect, triggerUpdate, selectedFlightId]);

  return null;
};
