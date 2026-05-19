const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  order_id: { type: String, required: true, unique: true },
  customer_name: { type: String, required: true },
  customer_email: { type: String },
  customer_phone: { type: String },
  customer_address: { type: String },
  items: { type: mongoose.Schema.Types.Mixed, required: true },
  total_amount: { type: Number, required: true },
  currency: { type: String, default: 'NGN' },
  payment_status: { type: String, default: 'pending' },
  order_status: { type: String, default: 'pending' }
}, {
  timestamps: true
});

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
