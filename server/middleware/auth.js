const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cartify_secret');
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ message: 'User not found' });

    if (req.user.passwordChangedAt) {
      const changedTimestamp = parseInt(req.user.passwordChangedAt.getTime() / 1000, 10);
      if (decoded.iat < changedTimestamp) {
        return res.status(401).json({ message: 'Password recently changed. Please log in again.' });
      }
    }

    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }


exports.admin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
