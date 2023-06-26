const express = require('express');
const { ClerkExpressWithAuth } = require ("@clerk/clerk-sdk-node");
  const cors = require('cors');


const {
  getUser,
  Cleark,
  createInteraction
} = require('../Controllers/userController.js'); // Adjust the path 

const router = express.Router();
router.use(cors());

// User-related route
router.get('/users/:id', getUser);
router.post('/clerk', Cleark);
router.post('/interactions', ClerkExpressWithAuth(),createInteraction);

module.exports = router;
