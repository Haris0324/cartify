const express = require('express');
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/orders
router.post('/', protect, async (req, res) => {
  try {
    const order = await Order.create({ ...req.body, user: req.user._id });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/orders (user's orders)
router.get('/', protect, async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.json(orders);
});

// @route   GET /api/orders/:id
router.get('/:id', protect, async (req, res) => {
  const order = await Order.findById(req.params.id).populate('orderItems.product');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  res.json(order);
});

// Admin - Get all orders
router.get('/admin/all', protect, admin, async (req, res) => {
  const orders = await Order.find().populate('user', 'name email').sort('-createdAt');
  res.json(orders);
});

// Admin - Update order status
router.put('/:id/status', protect, admin, async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

module.exports = router;
