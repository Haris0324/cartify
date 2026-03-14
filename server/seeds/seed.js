require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');

const products = [
  { name: 'Premium Wireless Headphones', description: 'Crystal clear sound with 40hr battery life. Active noise cancellation.', price: 249.99, compareAtPrice: 299.99, images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'], category: 'Electronics', brand: 'SoundPro', tags: ['audio', 'wireless'], stock: 50, isFeatured: true, sku: 'SP-WH-001' },
  { name: 'Minimalist Watch', description: 'Sleek stainless steel design with sapphire crystal. Water resistant 50m.', price: 189.00, images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'], category: 'Accessories', brand: 'TimeEssence', tags: ['watch', 'minimal'], stock: 100, isFeatured: true, sku: 'TE-WT-001' },
  { name: 'Organic Cotton T-Shirt', description: '100% organic cotton. Relaxed fit. Available in multiple colors.', price: 39.99, compareAtPrice: 49.99, images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'], category: 'Clothing', tags: ['t-shirt', 'organic'], stock: 200, sku: 'CT-TS-001' },
  { name: 'Smart Fitness Tracker', description: 'Track heart rate, sleep, and 20+ activities. 7-day battery.', price: 129.99, images: ['https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500'], category: 'Electronics', brand: 'FitTrack', tags: ['fitness', 'wearable'], stock: 75, isFeatured: true, sku: 'FT-BND-001' },
  { name: 'Leather Messenger Bag', description: 'Handcrafted full-grain leather. Laptop compartment for 15" devices.', price: 159.99, images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500'], category: 'Accessories', tags: ['bag', 'leather'], stock: 30, sku: 'LB-MS-001' },
  { name: 'Bluetooth Speaker', description: '360° sound. IPX7 waterproof. 12hr playtime.', price: 79.99, images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500'], category: 'Electronics', tags: ['speaker', 'portable'], stock: 120, sku: 'BS-PRT-001' },
  { name: 'Running Sneakers', description: 'Lightweight cushioning. Breathable mesh upper. Perfect for daily runs.', price: 119.99, compareAtPrice: 139.99, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'], category: 'Footwear', tags: ['shoes', 'running'], stock: 80, isFeatured: true, sku: 'RS-SNK-001' },
  { name: 'Sunglasses Classic', description: 'UV400 protection. Polarized lenses. Titanium frame.', price: 149.00, images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500'], category: 'Accessories', tags: ['sunglasses'], stock: 60, sku: 'SG-CLS-001' },
  { name: 'Mechanical Keyboard', description: 'Cherry MX switches. RGB backlight. Aluminum body.', price: 169.99, images: ['https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500'], category: 'Electronics', tags: ['keyboard', 'gaming'], stock: 45, sku: 'MK-MEC-001' },
  { name: 'Yoga Mat Premium', description: 'Non-slip surface. 6mm thick. Eco-friendly material.', price: 49.99, images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500'], category: 'Sports', tags: ['yoga', 'fitness'], stock: 90, sku: 'YM-PRM-001' },
  { name: 'Designer Perfume', description: 'Elegant fragrance. Long-lasting. 50ml eau de parfum.', price: 89.99, images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=500'], category: 'Beauty', tags: ['perfume', 'fragrance'], stock: 70, sku: 'DP-001' },
  { name: 'Portable Power Bank', description: '20000mAh. Dual USB. Fast charging. Airport approved.', price: 45.99, images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500'], category: 'Electronics', tags: ['power', 'charger'], stock: 150, sku: 'PB-20K-001' }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cartify');

  // Drop the old slug unique index if it exists (fixes existing DBs)
  try {
    await Product.collection.dropIndex('slug_1');
  } catch (e) {
    // Index may not exist
  }

  await Product.deleteMany({});
  const created = await Product.insertMany(products);

  const adminExists = await User.findOne({ email: 'admin@cartify.com' });
  if (!adminExists) {
    await User.create({ name: 'Admin', email: 'admin@cartify.com', password: 'admin123', role: 'admin' });
    console.log('Admin created: admin@cartify.com / admin123');
  } else {
    console.log('Admin already exists: admin@cartify.com');
  }

  console.log(`Seeded ${created.length} products`);
  process.exit(0);
}
seed().catch(e => { console.error(e); process.exit(1); });
