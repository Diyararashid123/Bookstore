  // bookRoutes.js
  const express = require('express');
  const {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getBooksInCategory
  } = require('../Controllers/categorycontroller.js'); // Adjust the path 

  const router = express.Router();

  router.get('/categories', getAllCategories);
  router.post('/categories', createCategory);
  router.put('/categories/:id', updateCategory);
  router.delete('/categories/:id', deleteCategory);
  router.get('/categories/books', getBooksInCategory);
  module.exports = router;
 