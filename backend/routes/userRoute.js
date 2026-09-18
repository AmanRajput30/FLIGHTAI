const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Session = require('../models/Session');
const SecurityEvent = require('../models/SecurityEvent');
const Token = require('../models/Token');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const axios = require('axios');
const appleSignin = require('apple-signin-auth');

/**
 * Helper: Log Security Event
 */
const logSecurityEvent = async (userId, eventType, req, metadata = {}) => {
  try {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'Unknown IP';
    const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
    await SecurityEvent.create({
      userId,
      eventType,
      ipAddress,
      deviceInfo,
      metadata
    });
  } catch (error) {
    console.error('Error logging security event:', error);
  }
};

/**
 * PATCH /api/user/profile
 */
router.patch('/profile', requireAuth, async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    
    // Allow updating these fields
    if (name) req.user.name = name;
    if (bio !== undefined) req.user.bio = bio;
    if (avatar !== undefined) req.user.avatar = avatar;

    await req.user.save();
    res.json({ message: 'Profile updated successfully', user: req.user });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/user/link/google
 * Link Google account to current user
 */
router.post('/link/google', requireAuth, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token is required' });

    let payload;
    try {
      const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      payload = response.data;
    } catch (err) {
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    const { sub: googleId } = payload;
    
    const existing = await User.findOne({ googleId });
    if (existing && existing._id.toString() !== req.user._id.toString()) {
      return res.status(400).json({ error: 'This Google account is already linked to another user.' });
    }

    req.user.googleId = googleId;
    await req.user.save();
    
    await logSecurityEvent(req.user._id, 'ACCOUNT_LINKED', req, { provider: 'google' });
    res.json({ message: 'Google account linked successfully', user: req.user });
  } catch (error) {
    console.error('Google Link Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/user/link/apple
 * Link Apple account to current user
 */
router.post('/link/apple', requireAuth, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token is required' });

    let payload;
    try {
      payload = await appleSignin.verifyIdToken(token, {
        audience: process.env.APPLE_CLIENT_ID,
        ignoreExpiration: false,
      });
    } catch (err) {
      return res.status(401).json({ error: 'Invalid Apple token' });
    }

    const { sub: appleId } = payload;
    
    const existing = await User.findOne({ appleId });
    if (existing && existing._id.toString() !== req.user._id.toString()) {
      return res.status(400).json({ error: 'This Apple account is already linked to another user.' });
    }

    req.user.appleId = appleId;
    await req.user.save();
    
    await logSecurityEvent(req.user._id, 'ACCOUNT_LINKED', req, { provider: 'apple' });
    res.json({ message: 'Apple account linked successfully', user: req.user });
  } catch (error) {
    console.error('Apple Link Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/user/unlink/:provider
 */
router.post('/unlink/:provider', requireAuth, async (req, res) => {
  try {
    const { provider } = req.params;
    
    if (!req.user.passwordHash) {
      const hasGoogle = provider !== 'google' && req.user.googleId;
      const hasApple = provider !== 'apple' && req.user.appleId;
      
      if (!hasGoogle && !hasApple) {
        return res.status(400).json({ error: 'You must set a password before unlinking your only authentication method.' });
      }
    }

    if (provider === 'google') {
      req.user.googleId = undefined;
    } else if (provider === 'apple') {
      req.user.appleId = undefined;
    } else {
      return res.status(400).json({ error: 'Unknown provider' });
    }

    await req.user.save();
    await logSecurityEvent(req.user._id, 'ACCOUNT_UNLINKED', req, { provider });
    res.json({ message: `${provider} unlinked successfully`, user: req.user });
  } catch (error) {
    console.error('Unlink Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * PATCH /api/user/password
 */
router.patch('/password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    const isMatch = await bcrypt.compare(currentPassword, req.user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(12);
    req.user.passwordHash = await bcrypt.hash(newPassword, salt);
    await req.user.save();

    // Invalidate all OTHER sessions
    await Session.deleteMany({ 
      userId: req.user._id, 
      _id: { $ne: req.session._id } 
    });

    await logSecurityEvent(req.user._id, 'PASSWORD_CHANGED', req);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/user/sessions
 */
router.get('/sessions', requireAuth, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user._id })
      .select('-sessionTokenHash') // Do not expose hashes
      .sort({ lastActiveAt: -1 });
    
    res.json({ 
      sessions,
      currentSessionId: req.session._id 
    });
  } catch (error) {
    console.error('Get Sessions Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * DELETE /api/user/sessions/:id
 * Revoke a specific session
 */
router.delete('/sessions/:id', requireAuth, async (req, res) => {
  try {
    const sessionToDelete = await Session.findOne({ _id: req.params.id, userId: req.user._id });
    if (!sessionToDelete) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (sessionToDelete._id.toString() === req.session._id.toString()) {
      return res.status(400).json({ error: 'Cannot revoke current session. Use logout instead.' });
    }

    await Session.findByIdAndDelete(sessionToDelete._id);
    await logSecurityEvent(req.user._id, 'SESSION_REVOKED', req, { revokedSessionId: req.params.id });

    res.json({ message: 'Session revoked successfully' });
  } catch (error) {
    console.error('Revoke Session Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/user/logout-all
 */
router.post('/logout-all', requireAuth, async (req, res) => {
  try {
    // Delete all sessions for this user EXCEPT the current one
    await Session.deleteMany({ 
      userId: req.user._id, 
      _id: { $ne: req.session._id } 
    });
    
    res.json({ message: 'Logged out from all other devices' });
  } catch (error) {
    console.error('Logout All Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * DELETE /api/user/account
 */
router.delete('/account', requireAuth, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password confirmation required' });
    }

    const isMatch = await bcrypt.compare(password, req.user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const userId = req.user._id;

    // Log the event BEFORE we delete the user
    await logSecurityEvent(userId, 'ACCOUNT_DELETED', req);

    // Delete user
    await User.findByIdAndDelete(userId);
    
    // Cleanup cascade
    await Session.deleteMany({ userId });
    await Token.deleteMany({ userId });
    // Keep SecurityEvents for audit trailing if desired, or delete them. We will keep them for auditing.

    res.clearCookie('sessionId', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    });

    res.json({ message: 'Account permanently deleted' });
  } catch (error) {
    console.error('Delete Account Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
