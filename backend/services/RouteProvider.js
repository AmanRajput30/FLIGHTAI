const axios = require('axios');
const { LRUCache } = require('lru-cache');

const routeCache = new LRUCache({
  max: 500,
  ttl: 1000 * 60 * 60 * 24 // 24 hours
});

class RouteProvider {
  /**
   * Fetch route data by flight number/callsign
   * @param {string} fn 
   * @returns {Promise<{ data: Object|null, source: string }>}
   */
  static async getRoute(fn) {
    if (!fn) return { data: null, source: 'none' };
    fn = fn.trim().toUpperCase();

    const cached = routeCache.get(fn);
    if (cached) return { data: cached, source: `${cached.source} (cache)` };

    // 1. AeroDataBox attempt
    try {
      if (process.env.RAPIDAPI_KEY && process.env.RAPIDAPI_HOST) {
        const aeroRes = await axios.get(`https://aerodatabox.p.rapidapi.com/flights/number/${fn}`, {
          timeout: 4000,
          headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': process.env.RAPIDAPI_HOST
          }
        });

        if (Array.isArray(aeroRes.data) && aeroRes.data.length > 0) {
          const f = aeroRes.data[0];
          const route = {
            origin: f.departure?.airport?.name || f.departure?.airport?.iata,
            originIata: f.departure?.airport?.iata,
            originIcao: f.departure?.airport?.icao,
            originLat: f.departure?.airport?.location?.lat,
            originLng: f.departure?.airport?.location?.lon,
            originTimezone: null,
            originTerminal: f.departure?.terminal,
            originGate: f.departure?.gate,
            
            destination: f.arrival?.airport?.name || f.arrival?.airport?.iata,
            destinationIata: f.arrival?.airport?.iata,
            destinationIcao: f.arrival?.airport?.icao,
            destLat: f.arrival?.airport?.location?.lat,
            destLng: f.arrival?.airport?.location?.lon,
            destinationTimezone: null,
            destinationTerminal: f.arrival?.terminal,
            destinationGate: f.arrival?.gate,

            registration: f.aircraft?.registration || f.aircraft?.reg,
            aircraftModel: f.aircraft?.model || f.aircraft?.modelCode || f.aircraft?.typeName,
            source: 'AeroDataBox'
          };
          routeCache.set(fn, route);
          return { data: route, source: 'aerodatabox' };
        } else if (aeroRes.data && (aeroRes.data.registration || aeroRes.data.reg || aeroRes.data.model)) {
          // This handles the fallback when aeroRes.data is aircraft info, though usually we hit a different endpoint for that.
          const f = aeroRes.data;
          const route = {
            registration: f.registration || f.reg,
            aircraftModel: f.model || f.modelCode || f.typeName,
            productionLine: f.productionLine,
            source: 'AeroDataBox (Aircraft Info)'
          };
          routeCache.set(fn, route);
          return { data: route, source: 'aerodatabox' };
        }
      }
    } catch (e) {
      console.warn(`[RouteProvider] AeroDataBox failed for ${fn}:`, e.message);
    }

    // 2. AviationStack fallback
    try {
      if (process.env.AVIATIONSTACK_API_KEY) {
        const urlIata = `http://api.aviationstack.com/v1/flights?access_key=${process.env.AVIATIONSTACK_API_KEY}&flight_iata=${fn}`;
        const response = await axios.get(urlIata, { timeout: 4000 });
        
        if(response.data && response.data.data && response.data.data.length > 0) {
          const flight = response.data.data[0];
          if (flight.departure && flight.arrival) {
            const route = { 
              origin: flight.departure.airport || flight.departure.iata,
              originIata: flight.departure.iata,
              originIcao: flight.departure.icao,
              originTimezone: flight.departure.timezone,
              originTerminal: flight.departure.terminal,
              originGate: flight.departure.gate,
              
              destination: flight.arrival.airport || flight.arrival.iata,
              destinationIata: flight.arrival.iata,
              destinationIcao: flight.arrival.icao,
              destinationTimezone: flight.arrival.timezone,
              destinationTerminal: flight.arrival.terminal,
              destinationGate: flight.arrival.gate,
              
              destLat: null,
              destLng: null,
              
              aircraftModel: null,
              registration: null,
              source: 'AviationStack'
            };
            routeCache.set(fn, route);
            return { data: route, source: 'aviationstack' };
          }
        }
      }
    } catch (e) {
      console.warn(`[RouteProvider] AviationStack failed for ${fn}:`, e.message);
    }

    return { data: null, source: 'none' };
  }
}

module.exports = RouteProvider;
