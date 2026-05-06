const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Shop name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['food', 'xerox', 'cafe', 'stationery'],
    lowercase: true
  },
  distance: {
    type: String,
    required: [true, 'Distance is required'],
    default: '200m'
  },
  deliveryTime: {
    type: String,
    required: [true, 'Delivery time is required'],
    default: '15 mins'
  },
  image: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    default: 4.0,
    min: 0,
    max: 5
  },
  isOpen: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    default: ''
  },
  offer: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Shop', shopSchema);
