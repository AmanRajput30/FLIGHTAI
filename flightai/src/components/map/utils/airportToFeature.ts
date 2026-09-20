import { Feature, Point } from 'geojson';

export const airportToFeature = (airportData: any): Feature<Point> | null => {
  if (!airportData || typeof airportData.lat !== 'number' || typeof airportData.lng !== 'number') {
    return null;
  }

  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [airportData.lng, airportData.lat]
    },
    properties: {
      id: airportData.icao || airportData.iata || airportData.id || 'airport',
      name: airportData.name || '',
      iata: airportData.iata || '',
      icao: airportData.icao || ''
    }
  };
};
