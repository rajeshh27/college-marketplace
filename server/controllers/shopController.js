const Shop = require('../models/Shop');

// @desc    Get all shops
// @route   GET /api/shops
const getShops = async (req, res) => {
  try {
    const { category, sort } = req.query;
    let query = {};

    if (category && category !== 'all') {
      query.category = category.toLowerCase();
    }

    let shops = await Shop.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: shops.length,
      data: shops
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single shop
// @route   GET /api/shops/:id
const getShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }
    res.json({ success: true, data: shop });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create a shop
// @route   POST /api/shops
const createShop = async (req, res) => {
  try {
    const shop = await Shop.create(req.body);
    res.status(201).json({
      success: true,
      data: shop
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update a shop
// @route   PUT /api/shops/:id
const updateShop = async (req, res) => {
  try {
    const shop = await Shop.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }
    res.json({ success: true, data: shop });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete a shop
// @route   DELETE /api/shops/:id
const deleteShop = async (req, res) => {
  try {
    const shop = await Shop.findByIdAndDelete(req.params.id);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = { getShops, getShop, createShop, updateShop, deleteShop };
