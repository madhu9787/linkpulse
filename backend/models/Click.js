const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema({
  url: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'URL',
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  userAgent: String,
  ipAddress: String,
  referrer: String,
  
  // Geolocation Data
  country: String,
  city: String,
  latitude: Number,
  longitude: Number,
  
  // Device & Browser Info
  browser: String,
  device: String,
  os: String,
}, { timestamps: true });

module.exports = mongoose.model('Click', clickSchema);
