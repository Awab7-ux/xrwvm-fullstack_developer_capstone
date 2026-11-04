const mongoose = require('mongoose');

const dealerSchema = new mongoose.Schema({
  _id: Number,
  full_name: String,
  city: String,
  state: String,
  address: String,
  zip: String,
  lat: Number,
  long: Number
}, { versionKey: false });

const reviewSchema = new mongoose.Schema({
  dealerId: { type: Number, index: true },
  name: String,
  review: String,
  purchase: Boolean,
  purchase_date: String,
  car_make: String,
  car_model: String,
  sentiment: String,
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

module.exports = {
  Dealer: mongoose.model('Dealer', dealerSchema),
  Review: mongoose.model('Review', reviewSchema)
};