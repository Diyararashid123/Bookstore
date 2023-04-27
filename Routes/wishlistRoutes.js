const express = require('express');

const {
  getWishlistByUserId,
  removeFromWishlist,
  addToWishlist,
} = require('../Controllers/bookcontroller.js'); // Adjust the path

const router = express.Router();
router.get("/book/getWishlist/:id", getWishlistByUserId);
router.post('/addwishlist/add', addToWishlist);
router.delete('/wishlist/remove/:id', removeFromWishlist);

module.exports = router;
