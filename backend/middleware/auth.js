const Session = require('../models/Session');
const User = require('../models/User');
const cryptoUtils = require('../utils/crypto');

/**
 * Middleware to check if user is authenticated via Session.
 * It checks the HttpOnly cookie for a _session, hashes it, and looks it up.
 */
const requireAuth = async (req, res, next) => {
  try {
    const sessionId = req.cookies._session;
    if (!sessionId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const sessionTokenHash = cryptoUtils.hashToken(sessionId);
    const session = await Session.findOne({ sessionTokenHash }).populate('userId');

    if (!session || session.expiresAt < new Date()) {
      // Clean up expired session if found
      if (session) await Session.findByIdAndDelete(session._id);
      
      res.clearCookie('_session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      });
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Attach user and session to request
    req.user = session.userId;
    req.session = session;

    // Update lastActiveAt in the background
    session.lastActiveAt = new Date();
    // Extending the session expiration automatically if it's active
    session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days rolling
    session.save().catch(console.error);

    next();
  } catch (error) {
    console.error('requireAuth Error:', error);
    res.status(500).json({ error: 'Server error during authentication' });
  }
};

/**
 * Middleware that parses session if available but continues if not.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const sessionId = req.cookies._session;
    if (!sessionId) {
      return next();
    }

    const sessionTokenHash = cryptoUtils.hashToken(sessionId);
    const session = await Session.findOne({ sessionTokenHash }).populate('userId');

    if (!session || session.expiresAt < new Date()) {
      if (session) await Session.findByIdAndDelete(session._id);
      res.clearCookie('_session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      });
      return next();
    }

    req.user = session.userId;
    req.session = session;

    session.lastActiveAt = new Date();
    session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    session.save().catch(console.error);

    next();
  } catch (error) {
    console.error('optionalAuth Error:', error);
    next();
  }
};

/**
 * Middleware to require specific roles
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

/**
 * Middleware to require email verification
 * Must be used AFTER requireAuth so req.user is populated.
 */
const requireVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (!req.user.isEmailVerified) {
    return res.status(403).json({ error: 'EMAIL_NOT_VERIFIED', message: 'Please verify your email address to access this feature.' });
  }
  
  next();
};

module.exports = {
  requireAuth,
  optionalAuth,
  requireRole,
  requireVerified,
};
