const express = require('express');
const {
  createUser,
  loginUser,
  deleteUser,
} = require('../Controllers/bookcontroller.js'); // Adjust the path 

const router = express.Router();

// User-related routes
router.post('/user/signup', createUser);
router.post('/user/login', loginUser);
router.delete('/user/delete/:id', deleteUser);

module.exports = router;
