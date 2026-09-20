const axios = require('axios');
const { FlightDataProvider, NormalizedAircraft } = require('./FlightDataProvider');
const TokenBucket = require('../utils/TokenBucket');

class OpenSkyProvider extends FlightDataProvider {
  constructor() {
    super('OpenSky');
    this.baseUrl = process.env.OPENSKY_BASE_URL || 'https://opensky-network.org';
    this.username = process.env.OPENSKY_USERNAME || '';
    this.password = process.env.OPENSKY_PASSWORD || '';
    
    // Circuit Breaker State
    this.failures = 0;
    this.circuitOpen = false;
    this.circuitOpenUntil = 0;
    this.circuitBreakerThreshold = parseInt(process.env.OPENSKY_CIRCUIT_BREAKER_THRESHOLD || '3', 10);
    this.timeoutMs = parseInt(process.env.OPENSKY_TIMEOUT_MS || '10000', 10);
    
    // Global Cost Ceiling (Token Bucket)
    // By default, OpenSky allows ~400 req/day anonymously (~0.27/sec). With auth, ~4000 req/day (~2.7/sec).
    const fillRate = parseFloat(process.env.OPENSKY_RATE_LIMIT_PER_SEC || '2.0');
    this.tokenBucket = new TokenBucket(Math.ceil(fillRate * 10), fillRate); // Allow small bursts
  }

  normalize(rawState, timestamp) {
    // OpenSky array format:
    // [0: icao24, 1: callsign, 2: origin_country, 3: time_position, 4: last_contact,
    //  5: longitude, 6: latitude, 7: baro_altitude (m), 8: on_ground, 9: velocity (m/s),
    //  10: true_track (deg), 11: vertical_rate (m/s), 12: sensors, 13: geo_altitude (m),
    //  14: squawk, 15: spi, 16: position_source, 17: category]
    
    const icao24 = rawState[0];
    const callsign = rawState[1] ? rawState[1].trim() : null;
    const timePosition = rawState[3];
    const lastContact = rawState[4];
    const longitude = rawState[5];
    const latitude = rawState[6];
    const baroAltitude = rawState[7]; // meters
    const onGround = rawState[8];
    const velocity = rawState[9]; // m/s
    const trueTrack = rawState[10]; // degrees
    const verticalRate = rawState[11]; // m/s
    const geoAltitude = rawState[13]; // meters
    const squawk = rawState[14];
    const categoryId = rawState[17]; // 0-18 integer

    // Map OpenSky category ID to broad category if possible, or leave as unknown
    let category = 'UNKNOWN';
    if (categoryId >= 1 && categoryId <= 6) category = 'LIGHT'; // Light/small
    if (categoryId >= 7 && categoryId <= 8) category = 'HELICOPTER';
    if (categoryId === 9) category = 'GLIDER';
    if (categoryId >= 10 && categoryId <= 11) category = 'LIGHT';
    if (categoryId === 14) category = 'MILITARY'; // Usually not shown on OpenSky but possible
    
    // OpenSky returns speed in m/s. Convert to km/h to match legacy backend assumptions.
    const speedKmh = velocity != null ? Math.round(velocity * 3.6) : null;
    
    // OpenSky altitudes are in meters. Convert to feet.
    const altFt = baroAltitude != null ? Math.round(baroAltitude * 3.28084) : 
                  (geoAltitude != null ? Math.round(geoAltitude * 3.28084) : 0);

    return new NormalizedAircraft({
      provider: this.name,
      providerAircraftId: icao24,
      icao24: icao24,
      callsign: callsign,
      registration: null, // Not typically in states/all
      aircraftType: category, // Fallback for airline/category
      latitude: latitude,
      longitude: longitude,
      barometricAltitude: altFt,
      geometricAltitude: altFt,
      groundSpeed: speedKmh,
      indicatedAirspeed: null,
      trueAirspeed: null,
      mach: null,
      track: trueTrack,
      heading: trueTrack,
      verticalRate: verticalRate, // m/s
      squawk: squawk,
      emergency: null,
      category: category,
      onGround: onGround,
      signalAge: lastContact,
      positionAge: timePosition,
      sourceType: rawState[16] === 0 ? 'ADSB' : (rawState[16] === 1 ? 'ASTERIX' : (rawState[16] === 2 ? 'MLAT' : 'OTHER')),
      timestamp: timestamp * 1000 || Date.now()
    });
  }

  async getAircraftInViewport(minLat, minLng, maxLat, maxLng) {
    if (process.env.OPENSKY_ENABLED === 'false') {
      return [];
    }

    if (this.circuitOpen && Date.now() < this.circuitOpenUntil) {
      console.warn(`[OpenSky] Circuit breaker is open. Skipping request.`);
      throw new Error('Circuit_Open');
    } else if (this.circuitOpen) {
      this.circuitOpen = false;
    }

    if (!this.tokenBucket.consume(1)) {
      console.warn(`[OpenSky] Global rate limit reached. Throttling request.`);
      // Graceful degradation: Throw a specific error so the FlightDataService knows it's a rate limit,
      // or we can just return an empty array here. We'll throw to trigger the fallback to ADSB.lol
      throw new Error('Rate_Limit_Exceeded');
    }

    try {
      const headers = { 'User-Agent': 'Aervyn/1.0' };
      let authConfig = {};
      if (this.username && this.password) {
        authConfig = {
          auth: {
            username: this.username,
            password: this.password
          }
        };
      }

      // /api/states/all?lamin={minLat}&lomin={minLng}&lamax={maxLat}&lomax={maxLng}
      // Note: OpenSky bounding box limits are strict
      const url = `${this.baseUrl}/api/states/all?lamin=${minLat.toFixed(4)}&lomin=${minLng.toFixed(4)}&lamax=${maxLat.toFixed(4)}&lomax=${maxLng.toFixed(4)}`;
      
      const response = await axios.get(url, {
        headers,
        timeout: this.timeoutMs,
        ...authConfig
      });

      this.failures = 0; // Reset on success

      if (response.data && response.data.states) {
        return response.data.states
          .filter(state => state[5] !== null && state[6] !== null) // must have pos
          .map(state => this.normalize(state, response.data.time));
      }
      return [];

    } catch (error) {
      this.failures++;
      const status = error.response ? error.response.status : 'NETWORK';
      console.error(`[OpenSky ERROR] Failure ${this.failures}/${this.circuitBreakerThreshold}: ${status}`);
      
      if (this.failures >= this.circuitBreakerThreshold || status === 429) {
        this.circuitOpen = true;
        this.circuitOpenUntil = Date.now() + 60000 * 5; // 5 minute backoff on rate limit or full failure
        console.error(`[OpenSky] Circuit breaker TRIPPED. Backing off for 5 minutes.`);
        throw new Error('Circuit_Tripped');
      }
      throw error; // Let FlightDataService handle fallback
    }
  }
}

module.exports = new OpenSkyProvider();
