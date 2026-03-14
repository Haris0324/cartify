const express = require('express');
const Wishlist = require('../models/Wishlist');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/wishlist
router.get('/', protect, async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
  res.json(wishlist?.products || []);
});

// @route   POST /api/wishlist
router.post('/', protect, async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  if (!wishlist.products.includes(req.body.productId)) {
    wishlist.products.push(req.body.productId);
    await wishlist.save();
  }
  res.json(wishlist);
});

// @route   DELETE /api/wishlist/:productId
router.delete('/:productId', protect, async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) return res.json({ products: [] });
  wishlist.products = wishlist.products.filter(p => p.toString() !== req.params.productId);
  await wishlist.save();
  res.json(wishlist);
});

module.exports = router;
