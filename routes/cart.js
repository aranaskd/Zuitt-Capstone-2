const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart');
const { verify } = require('../auth');

// [SECTION] Get User's Cart
router.get('/get-cart', verify, cartController.getCart);

// [SECTION] Add Cart
router.post('/add-to-cart', verify, cartController.addToCart);

// [SECTION] Change Product Quantities
router.patch('/update-cart-quantity', verify, cartController.updateCartQuantity);

// [SECTION] Remove products in the cart
router.patch('/:productId/remove-from-cart', verify, cartController.removeItem);

// [SECTION] Clear Cart
router.put('/clear-cart', verify, cartController.clearCart);

module.exports = router;