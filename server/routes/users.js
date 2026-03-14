const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
router.get('/profile', protect, (req, res) => {
  res.json(req.user);
});

// @route   PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  const { name, address, phone } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { name, address, phone }, { new: true });
  res.json(user);
});

module.exports = router;
