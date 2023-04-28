const express = require('express');
const{
  removeFromCart,
  addToCart
}= require('../Controllers/cartController.js'); // Adjust the path


const router = express.Router();
router.delete("/book/removeFromcart/:id",removeFromCart);
router.post('/cart/add', addToCart);


module.exports = router;