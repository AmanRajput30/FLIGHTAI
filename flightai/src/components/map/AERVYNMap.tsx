"use client";

import React, { memo, useState } from 'react';
import { MapLibreCanvas } from './MapLibreCanvas';
import { MapProps } from './types';
import * as maplibregl from 'maplibre-gl';
import { AircraftLayer } from './aircraft/AircraftLayer';
import { RouteLayer } from './aircraft/RouteLayer';
import { AirportLayer } from './aircraft/AirportLayer';
import { useMapCamera } from './utils/camera';
import { CockpitButton } from '../ui/CockpitButton';

const AERVYNMap: React.FC<MapProps> = ({ 
  mapMode = 'dark',
  onFlightSelect,
  targetPos,
  selectedFlightId
}) => {
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [is3D, setIs3D] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  useMapCamera(map, targetPos);

  const handleMapLoaded = (mapInstance: maplibregl.Map) => {
    setMap(mapInstance);
    setMapError(null);
  };

  const handleMapError = (error: any) => {
    setMapError('Map rendered in degraded state. Some data layers or terrain may be unavailable.');
  };

  return (
    <div className="w-full h-full relative z-0 bg-aervyn-bg-dark">
      <MapLibreCanvas onMapLoaded={handleMapLoaded} onMapError={handleMapError} mapMode={mapMode} is3D={is3D} />
      {map && (
        <>
          <RouteLayer map={map} selectedFlightId={selectedFlightId} />
          <AirportLayer map={map} />
          <AircraftLayer map={map} onFlightSelect={onFlightSelect} />
          
          <div className="absolute top-[176px] right-[364px] z-50 flex gap-2">
            <CockpitButton
              variant="toggle"
              isActive={is3D}
              aria-label={is3D ? "Switch to 2D map mode" : "Switch to 3D terrain mode"}
              onClick={() => setIs3D(!is3D)}
              className="px-3 py-1.5 min-w-[40px] shadow-none"
            >
              {is3D ? '2D' : '3D'}
            </CockpitButton>
          </div>

          {mapError && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-aervyn-panel-base/90 backdrop-blur border border-aervyn-status-yellow text-aervyn-status-yellow px-4 py-2 rounded shadow-lg font-labels text-[10px] uppercase tracking-widest flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {mapError}
            </div>
          )}
        </>
      )}
      
      {/* Loading overlay if map isn't ready */}
      {!map && !mapError && (
        <div className="absolute inset-0 z-50 flex items-center justify-center font-labels text-aervyn-text-primary bg-aervyn-bg-dark">
          <div className="flex flex-col items-center gap-4">
            <svg className="animate-spin h-8 w-8 text-aervyn-status-cyan" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div className="text-xs uppercase tracking-widest font-bold">Initializing MapLibre Engine</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(AERVYNMap);
