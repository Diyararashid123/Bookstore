  // bookRoutes.js
  const express = require('express');
  const {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
    buyBook,
    getCartByUserId,
    updateCartItem
  } = require('../Controllers/bookcontroller.js'); // Adjust the path 

  const router = express.Router();

  // Book-related routes
  router.get('/books', getAllBooks);
  router.get('/book/:id', getBookById);
  router.post('/book/buy', buyBook);
  router.post('/book/create', createBook);
  router.put('/book/update/:id', updateBook);
  router.delete('/book/delete/:id', deleteBook);
  router.get('/cart/:userId', getCartByUserId);
  router.put('/cart/updatecartItem/:id', updateCartItem);
  module.exports = router;
 