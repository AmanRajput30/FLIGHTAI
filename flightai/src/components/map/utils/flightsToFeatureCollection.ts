import { Flight } from '@/types';
import { FeatureCollection, Point, Feature } from 'geojson';

export const flightsToFeatureCollection = (flights: Flight[]): FeatureCollection<Point> => {
  const validFlights = flights.filter(f => {
    const lng = Number(f.lng);
    const lat = Number(f.lat);
    return (
      f.lng != null && 
      f.lat != null && 
      !isNaN(lng) && 
      !isNaN(lat) &&
      lat >= -90 && lat <= 90 &&
      lng >= -180 && lng <= 180
    );
  });
  
  const features: Feature<Point>[] = validFlights.map((flight) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [Number(flight.lng), Number(flight.lat)] // GeoJSON is [lng, lat]
    },
    properties: {
      id: flight.id,
      flightNumber: flight.flightNumber,
      callsign: flight.callsign || '',
      aircraftType: flight.aircraftType || '',
      heading: Number(flight.heading) || 0,
      alt: Number(flight.alt) || 0,
      speed: Number(flight.speed) || 0,
      status: flight.status,
      category: 'commercial'
    }
  }));

  return {
    type: 'FeatureCollection',
    features
  };
};
