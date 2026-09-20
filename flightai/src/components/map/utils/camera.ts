import { useEffect } from 'react';
import * as maplibregl from 'maplibre-gl';
import { socket } from '@/lib/socket';

export const useMapCamera = (map: maplibregl.Map | null, targetPos: [number, number] | null | undefined) => {
  // 1. Handle explicit targetPos changes (e.g. from UI search/selection)
  useEffect(() => {
    if (!map || !targetPos) return;
    
    // MapLibre uses [lng, lat] while react-leaflet passed [lat, lng]
    // If the backend/dashboard is sending [lat, lng], we flip it.
    // Dashboard passes: setTargetPos([data.lat, data.lon]) typically? 
    // Let's assume dashboard passes [lat, lng] as it was built for Leaflet.
    const [lat, lng] = targetPos;
    
    map.flyTo({
      center: [lng, lat],
      zoom: 8,
      duration: 1500, // ms
      essential: true
    });
  }, [map, targetPos]);

  // 2. Handle SkyLord 'command_focus_map' sockets directly (as in old map)
  useEffect(() => {
    if (!map) return;

    const handleFocusCommand = (data: { lat: number, lng: number, zoom?: number }) => {
      map.flyTo({
        center: [data.lng, data.lat],
        zoom: data.zoom || 8,
        duration: 2000,
        essential: true
      });
    };

    socket.on('command_focus_map', handleFocusCommand);
    
    return () => {
      socket.off('command_focus_map', handleFocusCommand);
    };
  }, [map]);
};
