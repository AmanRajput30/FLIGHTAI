const express = require('express');
const axios = require('axios');
const User = require('../models/User');
const Session = require('../models/Session');
const SecurityEvent = require('../models/SecurityEvent');
const cryptoUtils = require('../utils/crypto');
const { OAuth2Client } = require('google-auth-library');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const logSecurityEvent = async (userId, eventType, req, metadata = {}) => {
  try {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'Unknown IP';
    const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
    await SecurityEvent.create({ userId, eventType, ipAddress, deviceInfo, metadata });
  } catch (error) {
    console.error('Error logging security event:', error);
  }
};

/**
 * POST /api/oauth/google
 * Verify Google token and login/register
 */
router.post('/google', async (req, res) => {
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
      console.error('Token verification failed:', err.response?.data || err.message);
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    const { sub: googleId, email, name, picture } = payload;
    const normalizedEmail = email.toLowerCase();

    // Find user by Google ID or Email
    let user = await User.findOne({ $or: [{ googleId }, { email: normalizedEmail }] });

    if (!user) {
      // Create new user if not found
      // Generate a safe unique username
      let username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        username = `${username}${cryptoUtils.generateSecureToken(4).token.substring(0, 4).toLowerCase()}`;
      }

      user = await User.create({
        name,
        username,
        email: normalizedEmail,
        googleId,
        isEmailVerified: true, // Google verifies emails
        avatar: picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=eab308&color=000`,
        // passwordHash is optional
      });
    } else if (!user.googleId) {
      // Link account
      user.googleId = googleId;
      user.isEmailVerified = true;
      await user.save();
    }

    // Create Session
    const { token: sessionId, hash: sessionTokenHash } = cryptoUtils.generateSecureToken(64);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'Unknown IP';
    const deviceInfo = req.headers['user-agent'] || 'Unknown Device';

    await Session.create({
      userId: user._id,
      sessionTokenHash,
      ipAddress,
      deviceInfo,
      expiresAt,
    });

    await logSecurityEvent(user._id, 'LOGIN_SUCCESS', req, { provider: 'google' });

    // Set HttpOnly Cookie
    res.cookie('_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      expires: expiresAt,
    });

    res.json({ message: 'Google Login successful', user });
  } catch (error) {
    console.error('Google OAuth Error:', error);
    res.status(500).json({ error: 'Server error during Google OAuth' });
  }
});

/**
 * POST /api/oauth/apple
 * Verify Apple token and login/register
 */
const appleSignin = require('apple-signin-auth');

router.post('/apple', async (req, res) => {
  try {
    const { token, name: appleName } = req.body;
    if (!token) return res.status(400).json({ error: 'Token is required' });

    // Verify Apple identity token
    // Without client_id, appleSignin can verify the signature, but we should specify audience in production.
    let payload;
    try {
      payload = await appleSignin.verifyIdToken(token, {
        audience: process.env.APPLE_CLIENT_ID,
        ignoreExpiration: false,
      });
    } catch (err) {
      console.error('Apple token verification failed:', err);
      return res.status(401).json({ error: 'Invalid Apple token' });
    }

    const { sub: appleId, email } = payload;
    const normalizedEmail = email ? email.toLowerCase() : null;

    if (!normalizedEmail) {
       return res.status(400).json({ error: 'Email is required from Apple Auth' });
    }

    // Find user by Apple ID or Email
    let user = await User.findOne({ $or: [{ appleId }, { email: normalizedEmail }] });

    if (!user) {
      let username = normalizedEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        username = `${username}${cryptoUtils.generateSecureToken(4).token.substring(0, 4).toLowerCase()}`;
      }

      user = await User.create({
        name: appleName || 'Apple User',
        username,
        email: normalizedEmail,
        appleId,
        isEmailVerified: true,
      });
    } else if (!user.appleId) {
      // Link account
      user.appleId = appleId;
      user.isEmailVerified = true;
      await user.save();
    }

    // Create Session
    const { token: sessionId, hash: sessionTokenHash } = cryptoUtils.generateSecureToken(64);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'Unknown IP';
    const deviceInfo = req.headers['user-agent'] || 'Unknown Device';

    await Session.create({
      userId: user._id,
      sessionTokenHash,
      ipAddress,
      deviceInfo,
      expiresAt,
    });

    await logSecurityEvent(user._id, 'LOGIN_SUCCESS', req, { provider: 'apple' });

    res.cookie('_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      expires: expiresAt,
    });

    res.json({ message: 'Apple Login successful', user });
  } catch (error) {
    console.error('Apple OAuth Error:', error);
    res.status(500).json({ error: 'Server error during Apple OAuth' });
  }
});

module.exports = router;
