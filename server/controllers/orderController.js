const Order = require('../models/Order');

// @desc    Create an order
// @route   POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { customerName, customerPhone, items, totalAmount, shopId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items in order'
      });
    }

    const order = await Order.create({
      customerName,
      customerPhone,
      items,
      totalAmount,
      shopId,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      data: order
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

// @desc    Get all orders
// @route   GET /api/orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('shopId', 'name')
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get orders by phone (for user tracking)
// @route   GET /api/orders/user/:phone
const getOrdersByPhone = async (req, res) => {
  try {
    const orders = await Order.find({ customerPhone: req.params.phone })
      .populate('shopId', 'name')
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = { createOrder, getOrders, updateOrderStatus, getOrdersByPhone };
