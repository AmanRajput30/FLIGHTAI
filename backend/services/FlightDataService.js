const { LRUCache } = require('lru-cache');
const adsbProvider = require('./ADSBLOLProvider');

// 5x5 degree buckets
const BUCKET_SIZE = 5;

class FlightDataService {
  constructor() {
    this.provider = adsbProvider;
    
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

    // 3. Fetch from Provider
    const promise = this.provider.getAircraftInViewport(
      bucket.minLat,
      bucket.minLng,
      bucket.maxLat,
      bucket.maxLng
    ).then(flights => {
      // 4. Cache Result
      this.cache.set(bucket.key, flights);
      this.pendingRequests.delete(bucket.key);
      return flights;
    }).catch(err => {
      this.pendingRequests.delete(bucket.key);
      console.error(`Failed to fetch bucket ${bucket.key}:`, err.message);
      return [];
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
    
    // Flatten and deduplicate (since boundaries might overlap slightly if a plane moves)
    const uniqueFlights = new Map();
    for (const bucketFlights of bucketResults) {
      for (const flight of bucketFlights) {
        uniqueFlights.set(flight.id, flight);
      }
    }
    
    return Array.from(uniqueFlights.values());
  }
}

module.exports = new FlightDataService();
