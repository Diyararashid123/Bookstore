const express = require('express');
const {
  getUser,
  Cleark,
  createUser,
  createInteraction
} = require('../Controllers/userController.js'); // Adjust the path 

const router = express.Router();

// User-related route
router.get('/users/:id', getUser);
router.post('/clerk', Cleark);
router.get('/hahahha',createUser);
router.post('/interactions',createInteraction);

module.exports = router;
