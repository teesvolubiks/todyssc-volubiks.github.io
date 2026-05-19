const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true },
  price: { type: Number, required: true },
  currency: { type: String, default: 'NGN' },
  image: { type: String },
  images: { type: [String], default: [] },
  description: { type: String },
  category: { type: String },
  featured: { type: Boolean, default: false },
  inventory: { type: Number, default: 0 },
  tags: { type: [String], default: [] },
  setOptions: { type: mongoose.Schema.Types.Mixed, default: [] }
}, {
  timestamps: true
});

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);
