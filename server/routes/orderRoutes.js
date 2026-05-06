const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  updateOrderStatus,
  getOrdersByPhone
} = require('../controllers/orderController');

router.route('/').get(getOrders).post(createOrder);
router.route('/user/:phone').get(getOrdersByPhone);
router.route('/:id').put(updateOrderStatus);

module.exports = router;
