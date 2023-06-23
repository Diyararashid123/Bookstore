  // bookRoutes.js
  const express = require('express');
  const {
    createCategory,
    getCategoryWithBooks
  } = require('../Controllers/categorycontroller.js'); // Adjust the path 

  const router = express.Router();

  router.post('/categories/create', createCategory);
  router.get('/categories/books', getCategoryWithBooks);

  module.exports = router;
 