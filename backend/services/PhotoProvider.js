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
        timeout: 4000, // 4s timeout
        headers: {
          'User-Agent': 'Aervyn/1.0 (+https://aervyn.in/contact)',
          'Accept': 'application/json'
        }
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

    // No generic fallbacks allowed per user requirements
    return { data: null, source: 'none' };
  }
}

module.exports = PhotoProvider;
