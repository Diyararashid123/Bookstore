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
    getTopSellingBooks,
    getBookById,
    getSimilarBooks,
    getBookRecommendations,
    getFeaturedBooks,
    getPurchaseHistory
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
  router.get('/books/latest', getLatestReleasedBooks);
  router.get('/books/topwished', getMostWishedBooks);
  router.get('/books/sell', getTopSellingBooks);
  router.get('/book/:id', getBookById);
  router.get('/books/similar/:id',getSimilarBooks);
  router.get('/books/recommended',getBookRecommendations);
  router.get('/books/featured',getFeaturedBooks);
  router.get('/books/:id/purchases', getPurchaseHistory);
  module.exports = router;