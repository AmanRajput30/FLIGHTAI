const FlightDataService = require('./FlightDataService');
const RouteProvider = require('./RouteProvider');
const WeatherProvider = require('./WeatherProvider');
const PhotoProvider = require('./PhotoProvider');
const MetadataProvider = require('./MetadataProvider');

class FlightSelectionService {
  /**
   * Get complete normalized flight details
   * @param {string} flightId 
   */
  static async getDetails(flightId) {
    if (!flightId) throw new Error("Flight ID is required");

    // 1. Get base flight telemetry
    const flight = FlightDataService.searchFlight(flightId);
    if (!flight) {
      throw new Error(`Flight ${flightId} not found or no longer active.`);
    }

    const lookupId = (flight.flightNumber && flight.flightNumber !== 'Unknown') 
      ? flight.flightNumber 
      : flight.id;

    // 2. Fetch all providers in parallel, gracefully handling individual failures
    const results = await Promise.allSettled([
      RouteProvider.getRoute(lookupId),
      WeatherProvider.getWeather(flight.lat, flight.lng),
      MetadataProvider.getMetadata(flight.id),
      PhotoProvider.getPhoto(flight.id)
    ]);

    // Extract results
    const routeRes = results[0].status === 'fulfilled' ? results[0].value : { data: null, source: 'error' };
    const weatherRes = results[1].status === 'fulfilled' ? results[1].value : { data: null, source: 'error' };
    const metadataRes = results[2].status === 'fulfilled' ? results[2].value : { data: null, source: 'error' };
    const photoRes = results[3].status === 'fulfilled' ? results[3].value : { data: null, source: 'error' };

    // 3. Normalize into the agreed contract
    return {
      flight: flight,
      route: routeRes.data,
      weather: weatherRes.data,
      aircraft: metadataRes.data,
      photo: photoRes.data,
      provenance: {
        route: routeRes.source,
        weather: weatherRes.source,
        aircraft: metadataRes.source,
        photo: photoRes.source
      },
      fetchedAt: new Date().toISOString()
    };
  }
}

module.exports = FlightSelectionService;
