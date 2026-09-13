const crypto = require('crypto');

// Generate a random token
function generateToken(req) {
  return crypto.randomBytes(32).toString('hex');
}

// Middleware to protect routes
function csrfSynchronisedProtection(req, res, next) {
  // Methods that do not modify state are safe
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // 1. Get the token from the request header
  const headerToken = req.headers['x-csrf-token'];
  // 2. Get the token from the HttpOnly cookie
  const cookieToken = req.cookies['_csrf'];

  if (!headerToken || !cookieToken) {
    return res.status(403).json({ error: 'CSRF token missing' });
  }

  if (headerToken !== cookieToken) {
    return res.status(403).json({ error: 'CSRF token invalid' });
  }

  next();
}

// We don't use these functions but they are exported for compatibility with the old interface
function getTokenFromState(req) {
  return req.cookies['_csrf'];
}

function getTokenFromRequest(req) {
  return req.headers['x-csrf-token'];
}

function revokeToken(req) {
  // Clear the cookie if needed
}

module.exports = {
  csrfProtection: csrfSynchronisedProtection,
  generateToken,
  getTokenFromState,
  getTokenFromRequest,
  revokeToken
};
