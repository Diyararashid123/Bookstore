const express = require('express');
const {
  getUser
} = require('../Controllers/userController.js'); // Adjust the path 

const router = express.Router();

// User-related route
router.get('/users/:id', getUser);

module.exports = router;
