const mongoose = require('mongoose');

const securityEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  eventType: {
    type: String,
    enum: [
      'LOGIN_SUCCESS', 
      'LOGIN_FAILED', 
      'LOGOUT', 
      'PASSWORD_CHANGED', 
      'PASSWORD_RESET',
      'EMAIL_VERIFIED',
      'ACCOUNT_DELETED',
      'SESSION_REVOKED'
    ],
    required: true,
  },
  ipAddress: {
    type: String,
    default: 'Unknown IP',
  },
  deviceInfo: {
    type: String,
    default: 'Unknown Device',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
});

const SecurityEvent = mongoose.model('SecurityEvent', securityEventSchema);

module.exports = SecurityEvent;
