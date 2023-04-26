// bookRoutes.js
const express = require('express');

const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
} = require('../controllers/bookController.js'); // Adjust the path based on your project structure

const router = express.Router();

// Book-related routes
router.get('/books', getAllBooks);
router.get('/book/:id', getBookById);
router.post('/book/create', createBook);
router.put('/book/update/:id', updateBook);
router.delete('/book/delete/:id', deleteBook);

module.exports = router;
