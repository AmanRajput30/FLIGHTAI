"use client";

import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getMapStyle } from './mapStyle';

interface MapLibreCanvasProps {
  onMapLoaded: (map: maplibregl.Map) => void;
  onMapError?: (error: any) => void;
  mapMode: 'satellite' | 'dark';
  is3D: boolean;
}

export const MapLibreCanvas: React.FC<MapLibreCanvasProps> = ({ onMapLoaded, onMapError, mapMode, is3D }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getMapStyle(mapMode, is3D),
      center: [0, 20],
      zoom: 3,
      pitch: is3D ? 60 : 0, // Start with a 3D perspective if enabled
      maxPitch: 85 // Allow dramatic low angles
    });

    mapInstanceRef.current = map;

    map.addControl(
      new maplibregl.NavigationControl({
        showZoom: true,
        showCompass: true,
        visualizePitch: true,
      }),
      'top-right'
    );

    map.addControl(
      new maplibregl.ScaleControl({
        maxWidth: 150,
        unit: 'nautical' // Aviation standard, supported by MapLibre
      }),
      'bottom-left'
    );

    map.on('load', () => {
      onMapLoaded(map);
    });

    map.on('error', (e) => {
      console.error('[MapLibre]', e.error?.message || e.error);
      if (onMapError) onMapError(e.error);
    });

    // Add ResizeObserver to handle sidebar toggles or container size changes
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.resize();
      }
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onMapLoaded]); // Do not re-init when mapMode changes

  // Update style when mapMode or is3D changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setStyle(getMapStyle(mapMode, is3D));
      mapInstanceRef.current.easeTo({
        pitch: is3D ? 60 : 0,
        duration: 1000
      });
    }
  }, [mapMode, is3D]);

  return (
    <div 
      ref={mapContainerRef} 
      className="absolute inset-0 w-full h-full"
      style={{ background: mapMode === 'satellite' ? '#020304' : '#000000' }}
    />
  );
};
