import React, { useEffect } from 'react';
import * as maplibregl from 'maplibre-gl';
import { useFlightStore } from '@/store/useFlightStore';
import { routeToFeature } from '../utils/routeToFeature';

interface RouteLayerProps {
  map: maplibregl.Map;
  selectedFlightId: string | null;
}

export const RouteLayer: React.FC<RouteLayerProps> = ({ map, selectedFlightId }) => {
  const flight = useFlightStore(state => state.flights.find(f => f.id === selectedFlightId));
  const routeData = useFlightStore(state => state.flightRouteData);

  useEffect(() => {
    const setupLayer = () => {
      if (!map.getSource('route-source')) {
        map.addSource('route-source', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });
      }

      if (!map.getLayer('route-layer')) {
        map.addLayer({
          id: 'route-layer',
          type: 'line',
          source: 'route-source',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3b82f6',
            'line-width': 3,
            'line-opacity': 0.8,
            'line-dasharray': [2, 3]
          }
        }, 'aircraft-layer'); // Render underneath aircraft
      }
    };

    setupLayer();
    map.on('style.load', setupLayer);
    
    return () => {
      map.off('style.load', setupLayer);
    };
  }, [map]);

  useEffect(() => {
    const source = map.getSource('route-source') as maplibregl.GeoJSONSource;
    if (source) {
      if (flight && routeData) {
        const feature = routeToFeature(flight, routeData);
        if (feature) {
          source.setData({
            type: 'FeatureCollection',
            features: [feature]
          });
          return;
        }
      }
      
      // Clear route if no valid data
      source.setData({ type: 'FeatureCollection', features: [] });
    }
  }, [flight, routeData, map]);

  return null;
};
