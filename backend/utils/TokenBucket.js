/**
 * TokenBucket Rate Limiter
 * Ensures we do not exceed a strict number of requests per second/minute 
 * to upstream providers, capping the global cost ceiling.
 */
class TokenBucket {
  constructor(capacity, fillPerSecond) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.fillPerSecond = fillPerSecond;
    this.lastFill = Date.now();
  }

  /**
   * Attempts to consume a token.
   * @param {number} tokens - Number of tokens to consume
   * @returns {boolean} true if successful, false if rate limited
   */
  consume(tokens = 1) {
    this.refill();
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }

  /**
   * Refills the bucket based on time elapsed since last fill.
   */
  refill() {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastFill) / 1000;
    const newTokens = elapsedSeconds * this.fillPerSecond;
    
    if (newTokens > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + newTokens);
      this.lastFill = now;
    }
  }
}

module.exports = TokenBucket;
