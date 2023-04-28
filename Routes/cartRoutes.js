const express = require('express');
const{
  removeFromCart,
  addToCart,
  getCartByUserId,
  updateCartItem
}= require('../Controllers/cartController.js'); // Adjust the path


const router = express.Router();
router.delete("/book/removeFromcart/:id",removeFromCart);
router.post('/cart/add', addToCart);
router.get('/cart/:userId', getCartByUserId);
router.put('/cart/updatecartItem/:id', updateCartItem);

module.exports = router;