"use client";

import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getMapStyle } from './mapStyle';
import { socket } from '@/lib/socket';

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
      center: [10.0, 50.0], // Central Europe (high density)
      zoom: 4,
      minZoom: 2, // Prevent zooming out too far
      renderWorldCopies: false, // Prevent infinite map repetition horizontally
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
      'bottom-right'
    );

    const geolocate = new maplibregl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showAccuracyCircle: false
    });
    map.addControl(geolocate, 'bottom-right');

    map.addControl(
      new maplibregl.ScaleControl({
        maxWidth: 150,
        unit: 'nautical' // Aviation standard, supported by MapLibre
      }),
      'bottom-left'
    );

    map.on('load', () => {
      // CRITICAL FIX: Only execute if this map is still the active one!
      if (mapInstanceRef.current !== map) return;
      
      (window as any).map = map;
      onMapLoaded(map);
      
      // Initial fetch
      const bounds = map.getBounds();
      let minLng = bounds.getWest();
      let maxLng = bounds.getEast();
      // Normalize longitudes to avoid server-side rejection for wrapped maps
      if (minLng < -180) minLng = -180;
      if (maxLng > 180) maxLng = 180;
      
      socket.emit('viewport_update', {
        minLat: Math.max(-90, bounds.getSouth()),
        minLng: minLng,
        maxLat: Math.min(90, bounds.getNorth()),
        maxLng: maxLng
      });
    });

    map.on('moveend', () => {
      const bounds = map.getBounds();
      let minLng = bounds.getWest();
      let maxLng = bounds.getEast();
      if (minLng < -180) minLng = -180;
      if (maxLng > 180) maxLng = 180;
      
      socket.emit('viewport_update', {
        minLat: Math.max(-90, bounds.getSouth()),
        minLng: minLng,
        maxLat: Math.min(90, bounds.getNorth()),
        maxLng: maxLng
      });
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

  /* 
  const isFirstMount = useRef(true);

  // Update style when mapMode or is3D changes
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    
    if (mapInstanceRef.current && mapInstanceRef.current.isStyleLoaded()) {
      mapInstanceRef.current.setStyle(getMapStyle(mapMode, is3D));
      mapInstanceRef.current.easeTo({
        pitch: is3D ? 60 : 0,
        duration: 1000
      });
    } else if (mapInstanceRef.current) {
      mapInstanceRef.current.once('style.load', () => {
        mapInstanceRef.current?.setStyle(getMapStyle(mapMode, is3D));
      });
    }
  }, [mapMode, is3D]);
  */

  return (
    <div 
      ref={mapContainerRef} 
      className="absolute inset-0 w-full h-full"
      style={{ background: mapMode === 'satellite' ? '#020304' : '#000000' }}
    />
  );
};
