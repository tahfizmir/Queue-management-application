const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  queue: { type: mongoose.Schema.Types.ObjectId, ref: 'Queue' },
  name: String,
  status: { type: String, enum: ['waiting', 'assigned', 'cancelled'], default: 'waiting' },
  position: Number,
  createdAt: { type: Date, default: Date.now },
  assignedAt: Date,
  cancelledAt: Date,
});

module.exports = mongoose.model('Token', tokenSchema);
