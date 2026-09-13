const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Session = require('../models/Session');
const Token = require('../models/Token');
const SecurityEvent = require('../models/SecurityEvent');
const { requireAuth } = require('../middleware/auth');
const { generateToken: generateCsrfToken } = require('../middleware/csrf');
const cryptoUtils = require('../utils/crypto');
const emailService = require('../utils/emailService');

const router = express.Router();

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
 * GET /api/auth/csrf-token
 * Dispense CSRF token for the frontend
 */
router.get('/csrf-token', (req, res) => {
  const token = generateCsrfToken(req);
  res.cookie('_csrf', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  });
  res.json({ csrfToken: token });
});

/**
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (typeof name !== 'string' || typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Invalid input types' });
    }

    if (password.length < 8 || password.length > 100) {
      return res.status(400).json({ error: 'Password must be between 8 and 100 characters' });
    }

    // Check if email or username exists safely
    const existingUser = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] 
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await User.create({
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      passwordHash,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=eab308&color=000`
    });

    // Create Verification Token
    const { token: verifyToken, hash: verifyTokenHash } = cryptoUtils.generateSecureToken();
    
    await Token.create({
      userId: newUser._id,
      tokenHash: verifyTokenHash,
      type: 'VERIFY_EMAIL',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    // Send Verification Email
    try {
      const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verifyToken}`;
      // Fire-and-forget to prevent blocking the UI if SMTP is slow or times out
      emailService.sendEmail({
        to: newUser.email,
        subject: 'Verify your SkyIntel Account',
        html: `<p>Welcome to SkyIntel!</p><p>Please verify your email by clicking the link below:</p><a href="${verificationLink}">Verify Email</a>`
      }).catch(emailErr => {
        console.error('Failed to send verification email (background task):', emailErr.message);
      });
    } catch (err) {
      console.error('Error during email logic:', err);
      // We do not return here, we let the registration succeed.
    }

    res.status(201).json({ message: 'Registration successful.' });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { identifier, password, rememberMe } = req.body; // identifier can be email or username

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Please provide credentials' });
    }

    if (typeof identifier !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Invalid input types' });
    }

    const normalizedIdentifier = identifier.toLowerCase();
    const user = await User.findOne({
      $or: [{ email: normalizedIdentifier }, { username: normalizedIdentifier }]
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      await logSecurityEvent(user._id, 'LOGIN_FAILED', req);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create Session
    const { token: sessionId, hash: sessionTokenHash } = cryptoUtils.generateSecureToken(64);
    
    const expiresInDays = rememberMe ? 30 : 1;
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'Unknown IP';
    const deviceInfo = req.headers['user-agent'] || 'Unknown Device';

    await Session.create({
      userId: user._id,
      sessionTokenHash,
      ipAddress,
      deviceInfo,
      expiresAt,
    });

    // Log Event
    await logSecurityEvent(user._id, 'LOGIN_SUCCESS', req);

    // Set HttpOnly Cookie
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      expires: expiresAt,
    });

    res.json({ message: 'Login successful', user });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

/**
 * POST /api/auth/resend-verification
 * Allows a logged in user to request a fresh verification email.
 */
router.post('/resend-verification', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Delete any existing unused tokens for this user to prevent spam/confusion
    await Token.deleteMany({ userId: user._id, type: 'VERIFY_EMAIL' });

    // Create Verification Token
    const { token: verifyToken, hash: verifyTokenHash } = cryptoUtils.generateSecureToken();
    
    await Token.create({
      userId: user._id,
      tokenHash: verifyTokenHash,
      type: 'VERIFY_EMAIL',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    // Send Verification Email
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verifyToken}`;
    
    // Fire-and-forget to prevent blocking the UI
    emailService.sendEmail({
      to: user.email,
      subject: 'Verify your SkyIntel Account (Resend)',
      html: `<p>Welcome back to SkyIntel!</p><p>Please verify your email by clicking the link below:</p><a href="${verificationLink}">Verify Email</a>`
    }).catch(emailErr => {
      console.error('Failed to send resend verification email (background task):', emailErr.message);
    });

    res.json({ message: 'Verification email sent successfully' });
  } catch (error) {
    console.error('Resend Verification Error:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', requireAuth, async (req, res) => {
  try {
    await Session.findByIdAndDelete(req.session._id);
    await logSecurityEvent(req.user._id, 'LOGOUT', req);
    
    res.clearCookie('sessionId', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    });
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ error: 'Server error during logout' });
  }
});

/**
 * POST /api/auth/verify-email
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token is required' });
    if (typeof token !== 'string') return res.status(400).json({ error: 'Invalid input types' });

    const tokenHash = cryptoUtils.hashToken(token);
    const verifyToken = await Token.findOne({ tokenHash, type: 'VERIFY_EMAIL' });

    if (!verifyToken || verifyToken.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired verification link' });
    }

    const user = await User.findById(verifyToken.userId);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    user.isEmailVerified = true;
    await user.save();
    
    // Delete the token
    await Token.findByIdAndDelete(verifyToken._id);
    
    await logSecurityEvent(user._id, 'EMAIL_VERIFIED', req);

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify Email Error:', error);
    res.status(500).json({ error: 'Server error during verification' });
  }
});

/**
 * POST /api/auth/forgot-password
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    if (typeof email !== 'string') return res.status(400).json({ error: 'Invalid input types' });

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ error: 'No account found with that email address.' });
    }

    const { token: resetToken, hash: resetTokenHash } = cryptoUtils.generateSecureToken();
    
    await Token.create({
      userId: user._id,
      tokenHash: resetTokenHash,
      type: 'RESET_PASSWORD',
      expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour
    });

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    try {
      // Fire-and-forget to prevent blocking the UI
      emailService.sendEmail({
        to: user.email,
        subject: 'Reset your SkyIntel Password',
        html: `<p>You requested a password reset.</p><p>Click the link below to reset your password:</p><a href="${resetLink}">Reset Password</a>`
      }).catch(emailErr => {
        console.error('Failed to send password reset email (background task):', emailErr.message);
      });
    } catch (emailErr) {
      console.error('Failed to send reset email:', emailErr);
    }

    res.json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/auth/reset-password
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    if (typeof token !== 'string' || typeof newPassword !== 'string') {
      return res.status(400).json({ error: 'Invalid input types' });
    }
    if (newPassword.length < 8 || newPassword.length > 100) {
      return res.status(400).json({ error: 'Password must be between 8 and 100 characters' });
    }

    const tokenHash = cryptoUtils.hashToken(token);
    const resetToken = await Token.findOne({ tokenHash, type: 'RESET_PASSWORD' });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    const user = await User.findById(resetToken.userId);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Delete token
    await Token.findByIdAndDelete(resetToken._id);
    
    // Revoke all existing sessions so old logins are booted
    await Session.deleteMany({ userId: user._id });

    await logSecurityEvent(user._id, 'PASSWORD_RESET', req);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
