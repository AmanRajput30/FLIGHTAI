const axios = require('axios');
const { FlightDataProvider, NormalizedAircraft } = require('./FlightDataProvider');
const TokenBucket = require('../utils/TokenBucket');

class ADSBLOLProvider extends FlightDataProvider {
  constructor() {
    super('ADSBLOL');
    this.baseUrl = process.env.ADSBLOL_BASE_URL || 'https://api.adsb.lol';
    this.apiKey = process.env.ADSBLOL_API_KEY || ''; // Future-proofing
    
    // Circuit Breaker State
    this.failures = 0;
    this.circuitOpen = false;
    this.circuitOpenUntil = 0;
    this.circuitBreakerThreshold = parseInt(process.env.ADSBLOL_CIRCUIT_BREAKER_THRESHOLD || '5', 10);
    this.timeoutMs = parseInt(process.env.ADSBLOL_TIMEOUT_MS || '10000', 10);
    
    // Global Cost Ceiling (Token Bucket)
    // ADSB.lol is generous but we don't want to get banned. ~10 req/sec limit locally.
    const fillRate = parseFloat(process.env.ADSBLOL_RATE_LIMIT_PER_SEC || '10.0');
    this.tokenBucket = new TokenBucket(Math.ceil(fillRate * 5), fillRate);
  }

  normalize(rawData) {
    return new NormalizedAircraft({
      provider: this.name,
      providerAircraftId: rawData.hex,
      icao24: rawData.hex,
      callsign: rawData.flight ? rawData.flight.trim() : null,
      registration: rawData.r,
      aircraftType: rawData.t,
      latitude: rawData.lat,
      longitude: rawData.lon,
      barometricAltitude: rawData.alt_baro,
      geometricAltitude: rawData.alt_geom,
      groundSpeed: rawData.gs != null ? Math.round(rawData.gs * 1.852) : null, // Convert knots to km/h if needed, or keep standard. Previously server.js did Math.round(gs * 1.852)
      indicatedAirspeed: rawData.ias,
      trueAirspeed: rawData.tas,
      mach: rawData.mach,
      track: rawData.track,
      heading: rawData.mag_heading || rawData.true_heading,
      verticalRate: rawData.baro_rate ? Math.round(rawData.baro_rate * 0.00508) : 0, // Convert ft/min to m/s
      squawk: rawData.squawk,
      emergency: rawData.emergency,
      category: rawData.category,
      onGround: rawData.alt_baro === 'ground',
      signalAge: rawData.seen,
      positionAge: rawData.seen_pos,
      sourceType: rawData.type,
      timestamp: Date.now()
    });
  }

  async getAircraftInViewport(minLat, minLng, maxLat, maxLng) {
    if (process.env.ADSBLOL_ENABLED === 'false') {
      return [];
    }

    if (this.circuitOpen && Date.now() < this.circuitOpenUntil) {
      console.warn(`[ADSBLOL] Circuit breaker is open. Skipping request.`);
      return [];
    } else if (this.circuitOpen) {
      // Half-open state
      this.circuitOpen = false;
    }

    if (!this.tokenBucket.consume(1)) {
      console.warn(`[ADSBLOL] Global rate limit reached. Throttling request.`);
      // Graceful degradation: throw to let FlightDataService know
      throw new Error('Rate_Limit_Exceeded');
    }

    // Calculate center and radius for the bounding box
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    
    // Calculate rough distance from center to corner in NM (1 deg lat ~ 60NM)
    const latDiffNM = Math.abs(maxLat - minLat) * 60;
    const lngDiffNM = Math.abs(maxLng - minLng) * 60 * Math.cos(centerLat * Math.PI / 180);
    let radiusNM = Math.sqrt(Math.pow(latDiffNM/2, 2) + Math.pow(lngDiffNM/2, 2));
    
    // ADSB.lol imposes a 250NM limit
    if (radiusNM > 250) {
      radiusNM = 250;
    }

    try {
      const headers = { 'User-Agent': 'Aervyn/1.0' };
      if (this.apiKey) {
        headers['x-api-key'] = this.apiKey; // Hypothetical future header
      }

      // v2/point/{lat}/{lon}/{radius}
      const url = `${this.baseUrl}/v2/point/${centerLat.toFixed(4)}/${centerLng.toFixed(4)}/${Math.ceil(radiusNM)}`;
      
      const response = await axios.get(url, {
        headers,
        timeout: this.timeoutMs
      });

      this.failures = 0; // Reset on success

      if (response.data && response.data.ac) {
        return response.data.ac
          .filter(ac => ac.lat !== undefined && ac.lon !== undefined)
          .map(ac => this.normalize(ac));
      }
      return [];

    } catch (error) {
      this.failures++;
      const status = error.response ? error.response.status : 'NETWORK';
      console.error(`[ADSBLOL ERROR] Failure ${this.failures}/${this.circuitBreakerThreshold}: ${status}`);
      
      if (this.failures >= this.circuitBreakerThreshold) {
        this.circuitOpen = true;
        this.circuitOpenUntil = Date.now() + 60000; // 1 minute backoff
        console.error(`[ADSBLOL] Circuit breaker TRIPPED. Backing off for 1 minute.`);
        throw new Error('Circuit_Tripped');
      }
      throw error;
    }
  }
}

module.exports = new ADSBLOLProvider();
