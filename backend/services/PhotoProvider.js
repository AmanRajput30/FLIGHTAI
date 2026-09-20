const axios = require('axios');
const { LRUCache } = require('lru-cache');

const photoCache = new LRUCache({
  max: 500,
  ttl: 1000 * 60 * 60 * 24 // 24 hours cache for photos
});

class PhotoProvider {
  /**
   * Fetch aircraft photo for a given hex code
   * @param {string} hex 
   * @returns {Promise<{ data: Object|null, source: string }>}
   */
  static async getPhoto(hex) {
    if (!hex) return { data: null, source: 'none' };
    
    hex = hex.toLowerCase();
    const cached = photoCache.get(hex);
    if (cached) return { data: cached, source: 'cache' };

    try {
      // Primary: Planespotters
      const res = await axios.get(`https://api.planespotters.net/pub/photos/hex/${hex}`, {
        timeout: 4000 // 4s timeout
      });
      
      if (res.data && res.data.photos && res.data.photos.length > 0) {
        const photoUrl = res.data.photos[0].thumbnail_large.src;
        const photoData = {
          url: photoUrl,
          photographer: res.data.photos[0].photographer,
          source: 'planespotters'
        };
        photoCache.set(hex, photoData);
        return { data: photoData, source: 'planespotters' };
      }
    } catch (err) {
      console.warn(`[PhotoProvider] Planespotters failed for ${hex}:`, err.message);
    }

    // Fallback: FR24 Static (doesn't have a structured API, just an image path, but we can verify it exists if we want, or just return the URL)
    // The frontend was doing this blindly. We will do a HEAD request to verify.
    try {
      const fallbackUrl = `https://www.flightradar24.com/static/images/data/aircraft/lib/hex/${hex.toUpperCase()}.jpg`;
      const fallbackRes = await axios.head(fallbackUrl, { timeout: 3000 });
      if (fallbackRes.status === 200) {
        const photoData = {
          url: fallbackUrl,
          photographer: 'Unknown',
          source: 'flightradar24'
        };
        photoCache.set(hex, photoData);
        return { data: photoData, source: 'flightradar24' };
      }
    } catch (err) {
      // Ignored
    }

    // No photo found
    return { data: null, source: 'none' };
  }
}

module.exports = PhotoProvider;
