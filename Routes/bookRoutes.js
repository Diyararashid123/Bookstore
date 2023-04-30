  // bookRoutes.js
  const express = require('express');
  const {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
    buyBook,
    createCategory
  } = require('../Controllers/bookcontroller.js'); // Adjust the path 

  const router = express.Router();

  // Book-related routes
  router.get('/books', getAllBooks);
  router.get('/book/:id', getBookById);
  router.post('/book/buy', buyBook);
  router.post('/book/create', createBook);
  router.put('/book/update/:id', updateBook);
  router.delete('/book/delete/:id', deleteBook);
  app.post('/category/create', createCategory);
  module.exports = router;
 