const express = require('express');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/products
router.get('/', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };

    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { name: regex },
        { description: regex },
        { tags: regex }
      ];
    }
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortOpt = {};
    if (sort === 'price-asc') sortOpt.price = 1;
    else if (sort === 'price-desc') sortOpt.price = -1;
    else if (sort === 'newest') sortOpt.createdAt = -1;
    else if (sort === 'rating') sortOpt.ratings = -1;
    else sortOpt.createdAt = -1;

    const products = await Product.find(query)
      .sort(sortOpt)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Product.countDocuments(query);
    res.json({ products, totalPages: Math.ceil(total / limit), currentPage: +page });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/products/featured
router.get('/featured', async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true }).limit(8).lean();
  res.json(products);
});

// @route   GET /api/products/categories
router.get('/categories', async (req, res) => {
  const categories = await Product.distinct('category');
  res.json(categories);
});

// @route   GET /api/products/admin/all (admin - all products including inactive)
router.get('/admin/all', protect, admin, async (req, res) => {
  const products = await Product.find().sort('-createdAt').lean();
  res.json(products);
});

// @route   GET /api/products/:id
router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id).populate('reviews.user', 'name');
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// Admin - Create product
router.post('/', protect, admin, async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

// Admin - Update product
router.put('/:id', protect, admin, async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// Admin - Delete product
router.delete('/:id', protect, admin, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Product deleted' });
});

module.exports = router;
