const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config();
require('./config/passport');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const stripeRoutes = require('./routes/stripe');
const cartRoutes = require('./routes/cart');
const reviewRoutes = require('./routes/reviews');
const wishlistRoutes = require('./routes/wishlist');

const app = express();

// Stripe webhook needs raw body
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000", 
    "https://cartify-frontend-khaki.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(require('passport').initialize());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Serve React Frontend: runs frontend and backend on the same route:
// const clientPath = path.join(__dirname, '..', 'client', 'dist');

// app.use(express.static(clientPath));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(clientPath, 'index.html'));
// });

// MongoDB

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cartify')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Cartify server running on port ${PORT}`);
});