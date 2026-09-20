import { Flight } from '@/types';
import { FeatureCollection, Point, Feature } from 'geojson';

export const flightsToFeatureCollection = (flights: Flight[]): FeatureCollection<Point> => {
  const validFlights = flights.filter(f => typeof f.lng === 'number' && typeof f.lat === 'number');
  
  const features: Feature<Point>[] = validFlights.map((flight) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [flight.lng, flight.lat] // GeoJSON is [lng, lat]
    },
    properties: {
      id: flight.id,
      flightNumber: flight.flightNumber,
      callsign: flight.callsign || '',
      aircraftType: flight.aircraftType || '',
      heading: flight.heading || 0,
      alt: flight.alt || 0,
      speed: flight.speed || 0,
      status: flight.status,
      category: 'commercial'
    }
  }));

  return {
    type: 'FeatureCollection',
    features
  };
};
