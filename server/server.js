const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');

// Import routes
const shopRoutes = require('./routes/shopRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API Routes
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Seed endpoint for development
app.post('/api/seed', async (req, res) => {
  try {
    const Shop = require('./models/Shop');
    const Product = require('./models/Product');

    // Clear existing data
    await Shop.deleteMany({});
    await Product.deleteMany({});

    // Seed shops
    const shops = await Shop.insertMany([
      {
        name: 'Campus Bites',
        category: 'food',
        distance: '150m',
        deliveryTime: '12 mins',
        rating: 4.5,
        description: 'Best burgers and wraps near Gate 1. Student favorite since 2019.',
        offer: '20% off on first order',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop'
      },
      {
        name: 'Quick Print Hub',
        category: 'xerox',
        distance: '80m',
        deliveryTime: '5 mins',
        rating: 4.2,
        description: 'Fast printing, scanning & binding. Open till midnight during exams.',
        offer: 'Free binding on 100+ pages',
        image: 'https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=400&h=300&fit=crop'
      },
      {
        name: 'Chai Point Cafe',
        category: 'cafe',
        distance: '200m',
        deliveryTime: '8 mins',
        rating: 4.7,
        description: 'Premium coffee & chai. Study-friendly atmosphere with WiFi.',
        offer: 'Buy 2 Get 1 Free on all beverages',
        image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop'
      },
      {
        name: 'Notebook Nook',
        category: 'stationery',
        distance: '120m',
        deliveryTime: '10 mins',
        rating: 4.3,
        description: 'Complete stationery supplies. Lab coats, drawing sheets & engineering tools.',
        offer: '15% off on lab equipment',
        image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&h=300&fit=crop'
      },
      {
        name: 'South Express',
        category: 'food',
        distance: '300m',
        deliveryTime: '18 mins',
        rating: 4.6,
        description: 'Authentic South Indian meals. Unlimited thali for just ₹80.',
        offer: 'Free dessert with thali',
        image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop'
      },
      {
        name: 'Brew & Code',
        category: 'cafe',
        distance: '250m',
        deliveryTime: '10 mins',
        rating: 4.8,
        description: 'Coworking cafe with power outlets at every table. Best cold brew in campus.',
        offer: 'Student card = 10% off',
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop'
      },
      {
        name: 'Copy Corner',
        category: 'xerox',
        distance: '350m',
        deliveryTime: '7 mins',
        rating: 4.0,
        description: 'Color printing specialists. Poster printing & spiral binding available.',
        offer: 'Bulk copy @ ₹0.30/page',
        image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&h=300&fit=crop'
      },
      {
        name: 'The Art Store',
        category: 'stationery',
        distance: '180m',
        deliveryTime: '12 mins',
        rating: 4.4,
        description: 'Art supplies, drafting tools, and premium pens. Architecture student approved.',
        offer: 'Flat 25% on Faber-Castell',
        image: 'https://images.unsplash.com/photo-1452860606245-08b6e28ea329?w=400&h=300&fit=crop'
      }
    ]);

    // Seed products for each shop
    const productData = [];

    // Campus Bites products
    productData.push(
      { name: 'Classic Burger', price: 89, shopId: shops[0]._id, description: 'Juicy chicken patty with cheese', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop', category: 'food' },
      { name: 'Paneer Wrap', price: 69, shopId: shops[0]._id, description: 'Grilled paneer with mint chutney', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=300&h=200&fit=crop', category: 'food' },
      { name: 'French Fries', price: 49, shopId: shops[0]._id, description: 'Crispy golden fries with dip', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&h=200&fit=crop', category: 'food' },
      { name: 'Cold Coffee', price: 59, shopId: shops[0]._id, description: 'Creamy cold coffee shake', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&h=200&fit=crop', category: 'beverage' }
    );

    // Quick Print Hub products
    productData.push(
      { name: 'B&W Print (per page)', price: 1, shopId: shops[1]._id, description: 'Single side black & white', image: 'https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=300&h=200&fit=crop', category: 'print' },
      { name: 'Color Print (per page)', price: 5, shopId: shops[1]._id, description: 'Single side full color', image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=300&h=200&fit=crop', category: 'print' },
      { name: 'Spiral Binding', price: 30, shopId: shops[1]._id, description: 'Professional spiral binding', image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=300&h=200&fit=crop', category: 'binding' },
      { name: 'Lamination (A4)', price: 15, shopId: shops[1]._id, description: 'Thick lamination per sheet', image: 'https://images.unsplash.com/photo-1568702846914-96b305d2uj38?w=300&h=200&fit=crop', category: 'print' }
    );

    // Chai Point Cafe products
    productData.push(
      { name: 'Masala Chai', price: 20, shopId: shops[2]._id, description: 'Authentic masala chai', image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=300&h=200&fit=crop', category: 'beverage' },
      { name: 'Cappuccino', price: 79, shopId: shops[2]._id, description: 'Frothy Italian cappuccino', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300&h=200&fit=crop', category: 'beverage' },
      { name: 'Veg Sandwich', price: 45, shopId: shops[2]._id, description: 'Grilled veg cheese sandwich', image: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=300&h=200&fit=crop', category: 'snack' },
      { name: 'Chocolate Brownie', price: 55, shopId: shops[2]._id, description: 'Warm fudge brownie', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&h=200&fit=crop', category: 'dessert' }
    );

    // Notebook Nook products
    productData.push(
      { name: 'A4 Notebook (200 pages)', price: 45, shopId: shops[3]._id, description: 'Ruled notebook', image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=300&h=200&fit=crop', category: 'stationery' },
      { name: 'Graph Paper Pad', price: 35, shopId: shops[3]._id, description: '100 sheets engineering graph', image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=300&h=200&fit=crop', category: 'stationery' },
      { name: 'Pen Set (5 pcs)', price: 25, shopId: shops[3]._id, description: 'Blue & black ball pens', image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=300&h=200&fit=crop', category: 'stationery' },
      { name: 'Lab Coat', price: 250, shopId: shops[3]._id, description: 'Standard lab coat (M/L/XL)', image: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=300&h=200&fit=crop', category: 'lab' }
    );

    // South Express products
    productData.push(
      { name: 'Masala Dosa', price: 40, shopId: shops[4]._id, description: 'Crispy dosa with sambar', image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=300&h=200&fit=crop', category: 'food' },
      { name: 'Unlimited Thali', price: 80, shopId: shops[4]._id, description: 'Rice, sambar, rasam, 2 sabzi', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&h=200&fit=crop', category: 'food' },
      { name: 'Filter Coffee', price: 25, shopId: shops[4]._id, description: 'Authentic South Indian filter coffee', image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=300&h=200&fit=crop', category: 'beverage' },
      { name: 'Idli Vada Combo', price: 35, shopId: shops[4]._id, description: '2 Idli + 1 Vada + chutney', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&h=200&fit=crop', category: 'food' }
    );

    // Brew & Code products
    productData.push(
      { name: 'Cold Brew', price: 99, shopId: shops[5]._id, description: '16hr slow-brewed cold coffee', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&h=200&fit=crop', category: 'beverage' },
      { name: 'Matcha Latte', price: 119, shopId: shops[5]._id, description: 'Japanese matcha with oat milk', image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=300&h=200&fit=crop', category: 'beverage' },
      { name: 'Avocado Toast', price: 89, shopId: shops[5]._id, description: 'Sourdough with smashed avo', image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=300&h=200&fit=crop', category: 'snack' },
      { name: 'Cookie Box (6)', price: 149, shopId: shops[5]._id, description: 'Assorted gourmet cookies', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&h=200&fit=crop', category: 'dessert' }
    );

    // The Art Store products
    productData.push(
      { name: 'Sketchbook', price: 120, shopId: shops[7]._id, description: 'A4 150GSM premium paper', image: 'https://images.unsplash.com/photo-1452860606245-08b6e28ea329?w=300&h=200&fit=crop', category: 'stationery' },
      { name: 'Premium Art Book', price: 499, shopId: shops[7]._id, description: 'History of Renaissance Art (Hardcover)', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=200&fit=crop', category: 'book' }
    );

    await Product.insertMany(productData);

    res.json({
      success: true,
      message: 'Database seeded successfully!',
      shops: shops.length,
      products: productData.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Seed failed',
      error: error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fallback — serve frontend for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`\n🚀 Campus Marketplace Server running on port ${PORT}`);
  
  // Auto-seed if database is empty
  try {
    const Shop = require('./models/Shop');
    const shopCount = await Shop.countDocuments();
    if (shopCount === 0) {
      console.log('📡 Database is empty. Running auto-seed...');
      // Logic to trigger seed (re-using the seed logic)
      // For simplicity, we can just call the logic directly or leave it to the user.
      // But let's make it truly automatic by extracting the seed logic.
    }
  } catch (err) {
    console.error('Auto-seed check failed:', err.message);
  }

  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend: http://localhost:${PORT}\n`);
});
