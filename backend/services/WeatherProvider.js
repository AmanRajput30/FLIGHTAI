const axios = require('axios');
const { LRUCache } = require('lru-cache');

const weatherCache = new LRUCache({
  max: 500,
  ttl: 1000 * 60 * 15 // 15 minutes cache for weather
});

class WeatherProvider {
  /**
   * Fetch weather for a given lat/lng
   * @param {number} lat 
   * @param {number} lng 
   * @returns {Promise<{ data: Object|null, source: string }>}
   */
  static async getWeather(lat, lng) {
    if (lat == null || lng == null) return { data: null, source: 'none' };
    
    // Round to 1 decimal place to increase cache hits (approx 10km grid)
    const cacheKey = `${Number(lat).toFixed(1)},${Number(lng).toFixed(1)}`;
    const cached = weatherCache.get(cacheKey);
    if (cached) return { data: cached, source: 'open-meteo (cache)' };

    try {
      const res = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10m,wind_direction_10m,weather_code`, {
        timeout: 3000 // 3 second timeout circuit breaker
      });
      
      const weatherData = res.data?.current || null;
      if (weatherData) {
        weatherCache.set(cacheKey, weatherData);
        return { data: weatherData, source: 'open-meteo' };
      }
      return { data: null, source: 'open-meteo' };
    } catch (err) {
      console.warn(`[WeatherProvider] Failed to fetch weather for ${lat},${lng}:`, err.message);
      return { data: null, source: 'error' };
    }
  }
}

module.exports = WeatherProvider;
