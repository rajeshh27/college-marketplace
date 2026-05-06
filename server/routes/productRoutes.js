const express = require('express');
const router = express.Router();
const {
  getProductsByShop,
  getAllProducts,
  createProduct,
  deleteProduct
} = require('../controllers/productController');

router.route('/').get(getAllProducts).post(createProduct);
router.route('/shop/:shopId').get(getProductsByShop);
router.route('/:id').delete(deleteProduct);

module.exports = router;
