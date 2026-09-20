import { RouteInfo, Flight } from '@/types';
import { Feature, LineString } from 'geojson';

export const routeToFeature = (
  flight: Flight,
  route: RouteInfo | null
): Feature<LineString> | null => {
  if (!route) return null;

  const coordinates: [number, number][] = [];

  // If origin is known, start the line there
  if (typeof route.originLng === 'number' && typeof route.originLat === 'number') {
    coordinates.push([route.originLng, route.originLat]);
  }

  // Include the current aircraft position if valid
  if (typeof flight.lng === 'number' && typeof flight.lat === 'number') {
    coordinates.push([flight.lng, flight.lat]);
  }

  // If destination is known, end the line there
  if (typeof route.destLng === 'number' && typeof route.destLat === 'number') {
    coordinates.push([route.destLng, route.destLat]);
  }

  // A valid LineString needs at least 2 points
  if (coordinates.length < 2) return null;

  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates
    },
    properties: {
      id: flight.id,
      flightNumber: flight.flightNumber
    }
  };
};
