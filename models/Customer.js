const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String },
  address: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
