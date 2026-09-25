import React, { useEffect } from 'react';
import * as maplibregl from 'maplibre-gl';
import { useFlightStore } from '@/store/useFlightStore';
import { airportToFeature } from '../utils/airportToFeature';

interface AirportLayerProps {
  map: maplibregl.Map;
}

const AIRPORT_SVG = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="8" fill="#a855f7" stroke="#ffffff" stroke-width="2"/>
  <circle cx="12" cy="12" r="3" fill="#ffffff"/>
</svg>
`.trim();

const SVG_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(AIRPORT_SVG)}`;

export const AirportLayer: React.FC<AirportLayerProps> = ({ map }) => {
  const airportData = useFlightStore(state => state.airportData);

  useEffect(() => {
    const setupLayer = () => {
      if (!map.hasImage('airport-icon')) {
        const img = new Image();
        img.src = SVG_URL;
        img.onload = () => {
          if (!map.hasImage('airport-icon')) map.addImage('airport-icon', img);
        };
      }

      if (!map.getSource('airport-source')) {
        map.addSource('airport-source', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });
      }

      if (!map.getLayer('airport-layer')) {
        map.addLayer({
          id: 'airport-layer',
          type: 'symbol',
          source: 'airport-source',
          layout: {
            'icon-image': 'airport-icon',
            'icon-size': 1.0,
            'icon-allow-overlap': true
          },
          paint: {}
        }); // Render naturally
      }
    };

    if (map.isStyleLoaded()) {
      setupLayer();
    }
    map.on('style.load', setupLayer);
    
    return () => {
      map.off('style.load', setupLayer);
    };
  }, [map]);

  useEffect(() => {
    const source = map.getSource('airport-source') as maplibregl.GeoJSONSource;
    if (source) {
      const feature = airportToFeature(airportData);
      if (feature) {
        source.setData({
          type: 'FeatureCollection',
          features: [feature]
        });
      } else {
        source.setData({ type: 'FeatureCollection', features: [] });
      }
    }
  }, [airportData, map]);

  return null;
};
