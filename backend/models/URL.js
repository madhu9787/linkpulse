const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  clickCount: {
    type: Number,
    default: 0,
  },
  lastVisited: {
    type: Date,
  },
  expiresAt: {
    type: Date,
  },
  password: {
    type: String,
  },
  fallbackUrl: {
    type: String,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('URL', urlSchema);
