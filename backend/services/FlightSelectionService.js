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
  static async getDetails(flightId, frontendCallsign = null, frontendLat = null, frontendLng = null) {
    if (!flightId) throw new Error("Flight ID is required");

    // 1. Get base flight telemetry (may be null if backend cache is empty due to rate limits)
    const flight = FlightDataService.searchFlight(flightId);

    let lookupId = flightId;
    if (flight && flight.flightNumber && flight.flightNumber !== 'Unknown') {
      lookupId = flight.flightNumber;
    } else if (flight && flight.callsign && flight.callsign !== 'Unknown') {
      lookupId = flight.callsign;
    } else if (frontendCallsign && frontendCallsign !== 'Unknown') {
      lookupId = frontendCallsign;
    }

    const lat = flight ? flight.lat : frontendLat;
    const lng = flight ? flight.lng : frontendLng;

    // 2. Fetch all providers in parallel, gracefully handling individual failures
    const results = await Promise.allSettled([
      RouteProvider.getRoute(lookupId),
      lat && lng ? WeatherProvider.getWeather(lat, lng) : Promise.resolve({ data: null, source: 'skipped' }),
      MetadataProvider.getMetadata(flightId),
      PhotoProvider.getPhoto(flightId)
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
