  // bookRoutes.js
  const express = require('express');
  const {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryWithBooks
  } = require('../Controllers/categorycontroller.js'); // Adjust the path 

  const router = express.Router();

  router.get('/categories', getAllCategories);
  router.post('/categories/create', createCategory);
  router.put('/categories/:id', updateCategory);
  router.delete('/categories/:id', deleteCategory);
  router.get('/categories/:id/books', getCategoryWithBooks);  // New route
  module.exports = router;
 