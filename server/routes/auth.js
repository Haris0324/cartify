const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) => jwt.sign(
  { id },
  process.env.JWT_SECRET || 'cartify_secret',
  { expiresIn: process.env.JWT_EXPIRE || '7d' }
);

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// @route   POST /api/auth/register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array(), message: errors.array()[0]?.msg });

    const { name, email, password } = req.body;
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);
    res.cookie('token', token, cookieOptions);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/auth/login
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = generateToken(user._id);
    res.cookie('token', token, cookieOptions);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.cookie('token', '', { ...cookieOptions, maxAge: 0 });
  res.json({ message: 'Logged out' });
});

// @route   GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

// @route   POST /api/auth/forgot-password
router.post('/forgot-password', [
  body('email').isEmail()
], async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.json({ message: 'If that email exists, a reset link was sent' });
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${CLIENT_URL}/reset-password/${token}`;
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });
      await transporter.sendMail({
        to: user.email,
        from: process.env.SMTP_FROM || 'noreply@cartify.com',
        subject: 'Cartify - Reset Password',
        html: `Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.`
      });
    } else {
      console.log('Reset link (configure SMTP in .env to send email):', resetUrl);
    }
    res.json({ message: 'If that email exists, a reset link was sent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/auth/reset-password
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.body.token,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+password');
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// OAuth - Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: `${CLIENT_URL}/login?error=oauth_failed` }),
  (req, res) => {
    const token = generateToken(req.user._id);
    res.cookie('token', token, cookieOptions);
    res.redirect(`${CLIENT_URL}/auth/callback?token=${token}`);
  }
);

// OAuth - GitHub
router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));

router.get('/github/callback', passport.authenticate('github', { session: false, failureRedirect: `${CLIENT_URL}/login?error=oauth_failed` }),
  (req, res) => {
    const token = generateToken(req.user._id);
    res.cookie('token', token, cookieOptions);
    res.redirect(`${CLIENT_URL}/auth/callback?token=${token}`);
  }
);

module.exports = router;
