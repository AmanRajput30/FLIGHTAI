const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // We store the hash of the token, not the plaintext token.
  // If the database is compromised, the attacker cannot steal the sessions.
  sessionTokenHash: {
    type: String,
    required: true,
    unique: true,
  },
  deviceInfo: {
    type: String, // e.g., "Chrome on Windows"
    default: 'Unknown Device',
  },
  ipAddress: {
    type: String,
    default: 'Unknown IP',
  },
  lastActiveAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  }
}, {
  timestamps: true
});

// Create a TTL index so MongoDB automatically deletes the session 
// when the current time passes expiresAt.
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
