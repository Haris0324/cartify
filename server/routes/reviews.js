const express = require('express');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/reviews/:productId
router.post('/:productId', protect, async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString());
  if (alreadyReviewed) return res.status(400).json({ message: 'Already reviewed' });

  product.reviews.push({
    user: req.user._id,
    name: req.user.name,
    rating,
    comment
  });
  product.numReviews = product.reviews.length;
  product.ratings = product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length;
  await product.save();
  res.status(201).json(product);
});

module.exports = router;
