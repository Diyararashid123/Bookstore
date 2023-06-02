  // bookRoutes.js
  const express = require('express');
  const {
    getAllBooks,
    createBook,
    updateBook,
    deleteBook,
    buyBook,
    searchBooks,
    getMostPopularBooks,
    getLatestReleasedBooks,
    getMostWishedBooks,
    getTopSellingBooks
  } = require('../Controllers/bookcontroller.js'); // Adjust the path 

  const router = express.Router();

  // Book-related routes
  router.get('/books', getAllBooks);
  router.get('/books/search', searchBooks);
  router.post('/book/buy', buyBook);
  router.post('/book/create', createBook);
  router.put('/book/update/:id', updateBook);
  router.delete('/book/delete/:id', deleteBook);
  router.get('/books/popular', getMostPopularBooks);
  router.get('/books/Latest', getLatestReleasedBooks);
  router.get('/books/Wished', getMostWishedBooks);
  router.get('/books/Sell', getTopSellingBooks);

  module.exports = router;