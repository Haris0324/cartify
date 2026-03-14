const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

const getCartQuery = (req) => {
  if (req.user) return { user: req.user._id };
  const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
  return sessionId ? { sessionId } : {};
};

// @route   GET /api/cart
router.get('/', async (req, res) => {
  try {
    const q = getCartQuery(req);
    if (Object.keys(q).length === 0) return res.json({ items: [] });
    let cart = await Cart.findOne(q).populate('items.product');
    if (!cart) cart = { items: [] };
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/cart
router.post('/', async (req, res) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const q = getCartQuery(req);
    let cart = await Cart.findOne(q);

    const baseQuery = req.user ? { user: req.user._id } : {};
    if (!cart) {
      cart = await Cart.create({
        ...baseQuery,
        sessionId: req.user ? undefined : (req.headers['x-session-id'] || require('crypto').randomUUID())
      });
    }

    const existing = cart.items.find(
      i => i.product.toString() === productId && i.size === size && i.color === color
    );
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        name: product.name,
        image: product.images?.[0],
        price: product.price,
        quantity,
        size,
        color,
        stock: product.stock
      });
    }
    cart.updatedAt = new Date();
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/cart/:itemId
router.put('/:itemId', async (req, res) => {
  const q = getCartQuery(req);
  const cart = await Cart.findOne(q);
  if (!cart) return res.status(404).json({ message: 'Cart not found' });
  const item = cart.items.id(req.params.itemId);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  item.quantity = req.body.quantity || item.quantity;
  await cart.save();
  res.json(cart);
});

// @route   DELETE /api/cart/:itemId
router.delete('/:itemId', async (req, res) => {
  const q = getCartQuery(req);
  const cart = await Cart.findOne(q);
  if (!cart) return res.status(404).json({ message: 'Cart not found' });
  cart.items = cart.items.filter(i => i._id.toString() !== req.params.itemId);
  await cart.save();
  res.json(cart);
});

// Merge guest cart with user cart after login
router.post('/merge', protect, async (req, res) => {
  const sessionId = req.headers['x-session-id'];
  if (!sessionId) return res.json({ message: 'Nothing to merge' });
  const guestCart = await Cart.findOne({ sessionId });
  if (!guestCart || guestCart.items.length === 0) return res.json({ message: 'Nothing to merge' });

  let userCart = await Cart.findOne({ user: req.user._id });
  if (!userCart) userCart = await Cart.create({ user: req.user._id, items: [] });

  for (const item of guestCart.items) {
    const exists = userCart.items.find(
      i => i.product.toString() === item.product.toString()
    );
    if (exists) exists.quantity += item.quantity;
    else userCart.items.push(item);
  }
  await userCart.save();
  await Cart.deleteOne({ sessionId });
  res.json(userCart);
});

module.exports = router;
