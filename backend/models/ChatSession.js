const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, required: true, enum: ['user', 'assistant', 'system'] },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  referencedFlights: [{ type: String }]
}, { _id: false });

const chatSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  messages: [messageSchema]
}, { timestamps: true });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
