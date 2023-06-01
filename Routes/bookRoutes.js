  // bookRoutes.js
  const express = require('express');
  const {
    getAllBooks,
    
    createBook,
    updateBook,
    deleteBook,
    buyBook,
    searchBooks
  } = require('../Controllers/bookcontroller.js'); // Adjust the path 

  const router = express.Router();

  // Book-related routes
  router.get('/books', getAllBooks);
  router.get('/books/search', searchBooks);
  router.post('/book/buy', buyBook);
  router.post('/book/create', createBook);
  router.put('/book/update/:id', updateBook);
  router.delete('/book/delete/:id', deleteBook);
  module.exports = router;
