import React, { useEffect } from 'react';
import * as maplibregl from 'maplibre-gl';
import { useFlightStore } from '@/store/useFlightStore';
import { flightsToFeatureCollection } from '../utils/flightsToFeatureCollection';

interface AircraftLayerProps {
  map: maplibregl.Map;
  onFlightSelect?: (id: string) => void;
}

const PLANE_SVG = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M14 12L21 9V7L14 9.5V3C14 1.89543 13.1046 1 12 1C10.8954 1 10 1.89543 10 3V9.5L3 7V9L10 12V18L7 20V22L12 21L17 22V20L14 18V12Z" fill="#14F1D9"/>
</svg>
`.trim();

const SVG_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(PLANE_SVG)}`;

export const AircraftLayer: React.FC<AircraftLayerProps> = ({ map, onFlightSelect }) => {

  useEffect(() => {
    const setupLayer = () => {
      if (!map.hasImage('plane-icon')) {
        const img = new Image();
        img.src = SVG_URL;
        img.onload = () => {
          if (!map.hasImage('plane-icon')) map.addImage('plane-icon', img);
        };
      }

      if (!map.getSource('aircraft-source')) {
        map.addSource('aircraft-source', {
          type: 'geojson',
          data: flightsToFeatureCollection(useFlightStore.getState().flights),
          tolerance: 0
        });
      }

      if (!map.getLayer('aircraft-layer')) {
        map.addLayer({
          id: 'aircraft-layer',
          type: 'symbol',
          source: 'aircraft-source',
          layout: {
            'icon-image': 'plane-icon',
            'icon-size': 0.8,
            'icon-rotate': ['get', 'heading'],
            'icon-rotation-alignment': 'map',
            'icon-allow-overlap': true,
            'icon-ignore-placement': true
          }
        });
      }
    };

    setupLayer();
    map.on('style.load', setupLayer);
    
    return () => {
      map.off('style.load', setupLayer);
    };
  }, [map]);

  // Handle interactions
  useEffect(() => {
    const onClick = (e: maplibregl.MapLayerMouseEvent) => {
      if (!e.features || e.features.length === 0) return;
      const feature = e.features[0];
      if (feature.properties?.id && onFlightSelect) {
        onFlightSelect(feature.properties.id);
      }
    };

    const onMouseEnter = () => {
      map.getCanvas().style.cursor = 'pointer';
    };

    const onMouseLeave = () => {
      map.getCanvas().style.cursor = '';
    };

    map.on('click', 'aircraft-layer', onClick);
    map.on('mouseenter', 'aircraft-layer', onMouseEnter);
    map.on('mouseleave', 'aircraft-layer', onMouseLeave);

    return () => {
      map.off('click', 'aircraft-layer', onClick);
      map.off('mouseenter', 'aircraft-layer', onMouseEnter);
      map.off('mouseleave', 'aircraft-layer', onMouseLeave);
    };
  }, [map, onFlightSelect]);

  useEffect(() => {
    const unsub = useFlightStore.subscribe((state) => {
      const source = map.getSource('aircraft-source') as maplibregl.GeoJSONSource;
      if (source) {
        source.setData(flightsToFeatureCollection(state.flights));
      }
    });
    return unsub;
  }, [map]);

  return null;
};
