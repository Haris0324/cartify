const express = require('express');
const Stripe = require('stripe');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

const router = express.Router();
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// @route   POST /api/stripe/create-payment-intent
router.post('/create-payment-intent', protect, async (req, res) => {
  if (!stripe) return res.status(503).json({ message: 'Stripe not configured. Add STRIPE_SECRET_KEY to .env' });
  try {
    const { amount, orderId } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // cents
      currency: 'usd',
      metadata: { orderId: orderId || '' }
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/stripe/webhook (raw body - configured in server/index.js)
router.post('/webhook', async (req, res) => {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return res.status(503).json({ message: 'Webhook not configured' });
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    const orderId = pi.metadata?.orderId;
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        status: 'paid',
        paidAt: new Date(),
        'paymentResult.id': pi.id,
        'paymentResult.status': pi.status
      });
    }
  }
  res.json({ received: true });
});

// Config endpoint for frontend
router.get('/config', (req, res) => {
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

module.exports = router;
