const axios = require('axios');
const { LRUCache } = require('lru-cache');

const metadataCache = new LRUCache({
  max: 1000,
  ttl: 1000 * 60 * 60 * 24 * 7 // 7 days cache (metadata rarely changes)
});

class MetadataProvider {
  /**
   * Fetch aircraft metadata by hex
   * @param {string} hex 
   * @returns {Promise<{ data: Object|null, source: string }>}
   */
  static async getMetadata(hex) {
    if (!hex || hex === 'Unknown') return { data: null, source: 'none' };
    
    hex = hex.toLowerCase();
    const cached = metadataCache.get(hex);
    if (cached) return { data: cached, source: 'adsbdb (cache)' };

    try {
      const response = await axios.get(`https://api.adsbdb.com/v0/aircraft/${hex}`, {
        timeout: 4000,
        headers: { 'User-Agent': 'Aervyn/1.0' }
      });
      
      if (response.data && response.data.response && response.data.response.aircraft) {
        const metadata = response.data.response.aircraft;
        metadataCache.set(hex, metadata);
        return { data: metadata, source: 'adsbdb' };
      }
    } catch (error) {
      console.warn(`[MetadataProvider] Failed for ${hex}:`, error.message);
    }
    
    return { data: null, source: 'none' };
  }
}

module.exports = MetadataProvider;
