const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: String,
  image: String,
  price: Number,
  quantity: Number,
  size: String,
  color: String
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  orderItems: [orderItemSchema],
  shippingAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    phone: String
  },
  paymentMethod: { type: String, default: 'stripe' },
  paymentResult: {
    id: String,
    status: String,
    email: String
  },
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  shippingCost: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paidAt: Date,
  deliveredAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
