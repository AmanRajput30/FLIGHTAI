/**
 * Base Interface for Flight Data Providers
 * Defines the contract for fetching normalized aircraft data.
 */

class FlightDataProvider {
  constructor(name) {
    this.name = name;
  }

  /**
   * Retrieves aircraft within a geographic bounding box.
   * @param {number} minLat 
   * @param {number} minLng 
   * @param {number} maxLat 
   * @param {number} maxLng 
   * @returns {Promise<Array<NormalizedAircraft>>}
   */
  async getAircraftInViewport(minLat, minLng, maxLat, maxLng) {
    throw new Error('Method not implemented.');
  }

  /**
   * Normalizes provider-specific aircraft data to the Aervyn standard model.
   * @param {Object} rawData 
   * @returns {NormalizedAircraft}
   */
  normalize(rawData) {
    throw new Error('Method not implemented.');
  }
}

/**
 * Normalized Aircraft schema defining standard fields expected by Aervyn.
 */
class NormalizedAircraft {
  constructor({
    provider,
    providerAircraftId,
    icao24,
    callsign,
    registration,
    aircraftType,
    latitude,
    longitude,
    barometricAltitude,
    geometricAltitude,
    groundSpeed,
    indicatedAirspeed,
    trueAirspeed,
    mach,
    track,
    heading,
    verticalRate,
    squawk,
    emergency,
    category,
    onGround,
    signalAge,
    positionAge,
    sourceType,
    timestamp
  }) {
    this.provider = provider;
    this.providerAircraftId = providerAircraftId;
    this.id = icao24 || providerAircraftId || 'Unknown'; // Primary key for frontend rendering (id)
    this.icao24 = icao24 || providerAircraftId; // Store for backend search indexing
    this.callsign = callsign; // Store for backend search indexing
    this.registration = registration; // Store for backend search indexing
    this.flightNumber = callsign || 'Unknown'; // Mapped to callsign for legacy frontend compatibility
    this.airline = aircraftType || 'Private/Unknown'; // Legacy mapping
    this.lat = latitude;
    this.lng = longitude;
    this.altitude = barometricAltitude || geometricAltitude;
    this.speed = groundSpeed;
    this.heading = heading || track || 0;
    this.verticalRate = verticalRate || 0;
    this.lastContact = positionAge || signalAge || Math.floor(Date.now() / 1000);
    this.isLive = true;
    
    // Provenance
    this.providerTimestamp = timestamp || Date.now();
    this.retrievedAt = Date.now();
  }
}

module.exports = { FlightDataProvider, NormalizedAircraft };
