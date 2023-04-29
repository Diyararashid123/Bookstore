const express = require('express');
const {
  createUser,
  loginUser,
  deleteUser,
  getUser,
  getAllUsers
} = require('../Controllers/userController.js'); // Adjust the path 

const router = express.Router();

// User-related routes
router.post('/user/signup', createUser);
router.post('/user/login', loginUser);
router.delete('/user/delete/:id', deleteUser);
router.get('/users/:id', getUser);
router.get('/users', getAllUsers);
module.exports = router;
