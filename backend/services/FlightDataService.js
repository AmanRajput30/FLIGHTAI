const { LRUCache } = require('lru-cache');
const openSkyProvider = require('./OpenSkyProvider');
const adsbProvider = require('./ADSBLOLProvider');

// 5x5 degree buckets
const BUCKET_SIZE = 5;

class FlightDataService {
  constructor() {
    this.primaryProvider = openSkyProvider;
    this.fallbackProvider = adsbProvider;
    
    // Cache for normalized flights by bucket
    this.cache = new LRUCache({
      max: 1000, // Max 1000 buckets cached
      ttl: parseInt(process.env.ADSBLOL_CACHE_TTL || '5000', 10), // Default 5 seconds TTL
    });

    // In-flight request coalescer
    this.pendingRequests = new Map();
  }

  getBucketKey(lat, lng) {
    const bucketLat = Math.floor(lat / BUCKET_SIZE) * BUCKET_SIZE;
    const bucketLng = Math.floor(lng / BUCKET_SIZE) * BUCKET_SIZE;
    return `bucket:${bucketLat}:${bucketLng}`;
  }

  getBucketsForViewport(minLat, minLng, maxLat, maxLng) {
    const buckets = [];
    const startLat = Math.floor(minLat / BUCKET_SIZE) * BUCKET_SIZE;
    const endLat = Math.floor(maxLat / BUCKET_SIZE) * BUCKET_SIZE;
    const startLng = Math.floor(minLng / BUCKET_SIZE) * BUCKET_SIZE;
    const endLng = Math.floor(maxLng / BUCKET_SIZE) * BUCKET_SIZE;

    // Safety limit on number of buckets requested to prevent abuse when zoomed way out
    // If a user requests a huge area, the frontend shouldn't send it, but we guard it here.
    let count = 0;

    for (let lat = startLat; lat <= endLat; lat += BUCKET_SIZE) {
      for (let lng = startLng; lng <= endLng; lng += BUCKET_SIZE) {
        if (count++ > 50) return buckets; // Hard cap on buckets per request
        buckets.push({
          key: this.getBucketKey(lat, lng),
          minLat: lat,
          maxLat: lat + BUCKET_SIZE,
          minLng: lng,
          maxLng: lng + BUCKET_SIZE
        });
      }
    }
    return buckets;
  }

  async fetchBucket(bucket) {
    // 1. Check Cache
    if (this.cache.has(bucket.key)) {
      return this.cache.get(bucket.key);
    }

    // 2. Request Coalescing (Wait if someone else is already fetching this bucket)
    if (this.pendingRequests.has(bucket.key)) {
      return this.pendingRequests.get(bucket.key);
    }

    // 3. Fetch from Primary Provider with Fallback
    const fetchWithFallback = async () => {
      try {
        const flights = await this.primaryProvider.getAircraftInViewport(
          bucket.minLat,
          bucket.minLng,
          bucket.maxLat,
          bucket.maxLng
        );
        return { flights, status: 'OK' };
      } catch (err) {
        console.warn(`[FlightDataService] Primary provider failed for bucket ${bucket.key}, falling back to ADSB.lol...`);
        try {
          const fallbackFlights = await this.fallbackProvider.getAircraftInViewport(
            bucket.minLat,
            bucket.minLng,
            bucket.maxLat,
            bucket.maxLng
          );
          return { flights: fallbackFlights, status: 'DEGRADED' }; // Primary down, using fallback
        } catch (fallbackErr) {
          console.error(`[FlightDataService] Fallback provider also failed for bucket ${bucket.key}:`, fallbackErr.message);
          return { flights: [], status: 'OUTAGE' }; // Both down
        }
      }
    };

    const promise = fetchWithFallback().then(({ flights, status }) => {
      // 4. Cache Result (only cache actual flights)
      this.cache.set(bucket.key, flights);
      this.pendingRequests.delete(bucket.key);
      
      // We attach the status so the orchestrator can track global state
      flights.__bucketStatus = status;
      return flights;
    });

    this.pendingRequests.set(bucket.key, promise);
    return promise;
  }

  /**
   * Retrieves flights for a given viewport.
   */
  async getFlightsInViewport(minLat, minLng, maxLat, maxLng) {
    const buckets = this.getBucketsForViewport(minLat, minLng, maxLat, maxLng);
    
    // Fetch all required buckets in parallel
    const bucketResults = await Promise.all(buckets.map(b => this.fetchBucket(b)));
    
    let isOutage = bucketResults.length > 0;
    
    // Flatten and deduplicate (since boundaries might overlap slightly if a plane moves)
    const uniqueFlights = new Map();
    for (const bucketFlights of bucketResults) {
      if (bucketFlights.__bucketStatus !== 'OUTAGE') {
        isOutage = false; // If at least one bucket succeeded, we don't declare a full outage
      }
      for (const flight of bucketFlights) {
        uniqueFlights.set(flight.id, flight);
      }
    }
    
    const results = Array.from(uniqueFlights.values());
    if (isOutage) {
      // Tag the array so the server can emit an outage event
      results.__isOutage = true;
    }
    
    return results;
  }

  // Phase 5 Search: Find a live tracked flight by callsign, hex, or reg in our current cache
  searchFlight(identifier) {
    if (!identifier) return null;
    identifier = identifier.toUpperCase();
    
    for (const bucketFlights of this.cache.values()) {
      const flight = bucketFlights.find(f => 
        f.callsign === identifier || 
        f.icao24 === identifier || 
        f.registration === identifier || 
        f.flightNumber === identifier
      );
      if (flight) return flight;
    }
    return null;
  }
}

module.exports = new FlightDataService();
