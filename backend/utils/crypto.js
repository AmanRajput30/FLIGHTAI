const crypto = require('crypto');

/**
 * Generates a random secure token (in hex format) and its SHA-256 hash.
 * 
 * @param {number} bytes - Number of random bytes.
 * @returns {Object} { token, hash }
 */
exports.generateSecureToken = (bytes = 32) => {
  const token = crypto.randomBytes(bytes).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hash };
};

/**
 * Hashes an existing token for database comparison.
 * 
 * @param {string} token 
 * @returns {string} The SHA-256 hash.
 */
exports.hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
