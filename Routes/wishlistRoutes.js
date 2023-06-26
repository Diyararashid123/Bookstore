const express = require('express');
const { ClerkExpressWithAuth } = require ("@clerk/clerk-sdk-node");
  const cors = require('cors');
const {
  getWishlistByUserId,
  removeFromWishlist,
  addToWishlist,
} = require('../Controllers/wishColtroller.js'); // Adjust the path

const router = express.Router();
router.use(cors());


router.get("/wishlist", ClerkExpressWithAuth(),getWishlistByUserId);
router.post('/wishlist/add', ClerkExpressWithAuth() ,addToWishlist);
router.delete('/wishlist/remove', ClerkExpressWithAuth(),removeFromWishlist);
module.exports = router;
