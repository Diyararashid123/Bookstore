const express = require('express');

const {
  getWishlistByUserId,
  removeFromWishlist,
  addToWishlist,
} = require('../Controllers/wishColtroller.js'); // Adjust the path

const router = express.Router();
router.get("/wishlist", getWishlistByUserId);
router.post('/wishlist/add', addToWishlist);
router.delete('/wishlist/remove', removeFromWishlist);
module.exports = router;
