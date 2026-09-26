const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    },
    passwordHash: {
      type: String,
      required: false, // Optional for OAuth users
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    appleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
      maxlength: 500,
    },
    role: {
      type: String,
      default: 'Mission Commander',
    },
    plan: {
      type: String,
      default: 'AERVYN Professional',
    },
    preferences: {
      type: Object,
      default: { alerts: true, fleet: true, weather: false, updates: false },
    },
    apiKey: {
      type: String,
      default: ''
    },
    team: {
      type: Array,
      default: []
    },
    paymentMethod: {
      type: Object,
      default: { brand: 'VISA', last4: '4242', exp: '12/28' }
    },
    invoices: {
      type: Array,
      default: [
        { date: 'Sep 1, 2026', amount: '$299.00', status: 'Paid', id: 'INV-2026-09' },
        { date: 'Aug 1, 2026', amount: '$299.00', status: 'Paid', id: 'INV-2026-08' },
        { date: 'Jul 1, 2026', amount: '$299.00', status: 'Paid', id: 'INV-2026-07' }
      ]
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    // Future-proofing for 2FA as requested by user
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      default: null,
    },
    twoFactorRecoveryCodes: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Strip sensitive data when converting to JSON (e.g. res.json)
userSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    delete ret.passwordHash;
    delete ret.twoFactorSecret;
    delete ret.twoFactorRecoveryCodes;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
