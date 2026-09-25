"use client";

import React, { memo, useState, useCallback } from 'react';
import { MapLibreCanvas } from './MapLibreCanvas';
import { MapProps } from './types';
import * as maplibregl from 'maplibre-gl';
import { AircraftLayer } from './aircraft/AircraftLayer';
import { RouteLayer } from './aircraft/RouteLayer';
import { AirportLayer } from './aircraft/AirportLayer';
import { useMapCamera } from './utils/camera';

const AERVYNMap: React.FC<MapProps> = ({ 
  mapMode = 'dark',
  onFlightSelect,
  targetPos,
  selectedFlightId
}) => {
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [is3D, setIs3D] = useState(false); // User requested map 3D stuck fix - default to 2D
  const [mapError, setMapError] = useState<string | null>(null);

  useMapCamera(map, targetPos);

  const handleMapLoaded = useCallback((mapInstance: maplibregl.Map) => {
    setMap(mapInstance);
    setMapError(null);
  }, []);

  const handleMapError = useCallback((error: any) => {
    setMapError('Map rendered in degraded state. Some data layers or terrain may be unavailable.');
  }, []);

  return (
    <div className="w-full h-full relative z-0 bg-aervyn-bg-dark">
      <MapLibreCanvas onMapLoaded={handleMapLoaded} onMapError={handleMapError} mapMode={mapMode} is3D={is3D} />
      {map && (
        <>
          <RouteLayer map={map} selectedFlightId={selectedFlightId} />
          <AirportLayer map={map} />
          <AircraftLayer map={map} onFlightSelect={onFlightSelect} />
          
          {mapError && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-aervyn-surface-dark-elevated border border-aervyn-status-warning text-aervyn-text-dark-primary px-4 py-3 rounded-lg shadow-xl text-sm font-medium flex items-center gap-3">
              <svg className="w-5 h-5 text-aervyn-status-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {mapError}
            </div>
          )}
        </>
      )}
      
      {/* Loading overlay if map isn't ready */}
      {!map && !mapError && (
        <div className="absolute inset-0 z-50 flex items-center justify-center text-aervyn-text-dark-primary bg-aervyn-bg-dark">
          <div className="flex flex-col items-center gap-4">
             <div className="w-8 h-8 rounded-full border-2 border-aervyn-border-dark border-t-aervyn-primary animate-spin"></div>
            <div className="text-sm font-medium">Initializing Map...</div>
          </div>
        </div>
      )}

    </div>
  );
};

export default memo(AERVYNMap);
