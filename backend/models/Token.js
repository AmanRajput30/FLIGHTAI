const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tokenHash: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ['VERIFY_EMAIL', 'RESET_PASSWORD'],
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  }
}, {
  timestamps: true
});

// TTL index to automatically delete expired tokens
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
