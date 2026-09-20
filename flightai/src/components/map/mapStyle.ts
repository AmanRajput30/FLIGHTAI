import { StyleSpecification } from 'maplibre-gl';

// Fallback providers if env vars are missing
const DEFAULT_DARK_BASEMAP = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
const DEFAULT_SATELLITE_BASEMAP = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

export const getMapStyle = (mode: 'dark' | 'satellite', is3D: boolean = true): StyleSpecification => {
  const isSatellite = mode === 'satellite';
  
  const tileUrl = isSatellite 
    ? (process.env.NEXT_PUBLIC_SATELLITE_URL || DEFAULT_SATELLITE_BASEMAP)
    : (process.env.NEXT_PUBLIC_MAP_STYLE_URL || DEFAULT_DARK_BASEMAP);

  const terrainUrl = process.env.NEXT_PUBLIC_TERRAIN_URL || 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';

  const style: StyleSpecification = {
    version: 8,
    sources: {
      'basemap-source': {
        type: 'raster',
        tiles: [tileUrl],
        tileSize: 256,
        attribution: '&copy; <a href="https://www.esri.com/">Esri</a>'
      }
    },
    layers: [
      {
        id: 'basemap-layer',
        type: 'raster',
        source: 'basemap-source',
        minzoom: 0,
        maxzoom: isSatellite ? 19 : 16 // Match previous ArcGIS limits
      }
    ]
  };

  if (is3D) {
    style.sources['terrain-source'] = {
      type: 'raster-dem',
      tiles: [terrainUrl],
      encoding: 'terrarium',
      tileSize: 256,
      maxzoom: 14
    };
    style.terrain = {
      source: 'terrain-source',
      exaggeration: 1.5
    };
  }

  return style;
};
