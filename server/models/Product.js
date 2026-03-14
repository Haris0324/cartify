const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  compareAtPrice: { type: Number },
  images: [{ type: String }],
  category: { type: String, required: true },
  subcategory: { type: String },
  brand: { type: String },
  tags: [String],
  sku: { type: String },
  stock: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  ratings: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  reviews: [reviewSchema],
  attributes: mongoose.Schema.Types.Mixed,
  weight: Number,
  dimensions: { length: Number, width: Number, height: Number }
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isFeatured: 1 });

module.exports = mongoose.model('Product', productSchema);
