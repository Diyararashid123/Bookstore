const express = require('express');
const {
  getUser,
  Cleark,
  createUser
} = require('../Controllers/userController.js'); // Adjust the path 

const router = express.Router();

// User-related route
router.get('/users/:id', getUser);
router.get('/users/gethis', Cleark);
router.get('/hahahha',createUser);

module.exports = router;
