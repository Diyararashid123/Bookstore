  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const limit = require('../store.js');
    
    // This function is responsible for creating a new category in the database.
const createCategory = async (req, res) => {
  // Destructure 'name' from the request body.
  const { name } = req.body;

  try {
    // Use Prisma's `create` method on `category` model to create a new category in the database.
    // This will insert a new record into the categories table with the 'name' provided in the request body.
    const newCategory = await prisma.category.create({
      data: { name },
    });

    // If the category is successfully created, return a 201 status code (indicating a resource was successfully created)
    // along with the data of the new category.
    res.status(201).json(newCategory);

  } catch (error) { // If an error is encountered while trying to execute the try block, it is caught here.

    // Send a 500 status code (Internal Server Error) and an error message indicating an error occurred while creating the category.
    res.status(500).json({ error: "Error creating category" });
  }
};

// This function is responsible for retrieving a category and its related books from the database.
const getCategoryWithBooks = async (req, res) => {
  // Destructure 'names' from the request query, convert it to an array by splitting on comma.
  const names = req.query.names.split(',');
  
  // Destructure 'page' from the request query, default to 1 if it's not provided.
  const { page = 1 } = req.query;

  // Convert 'page' to a number.
  const pageNumber = Number(page);
  
  try {
    // Loop over each name in the 'names' array.
    // For each name, use Prisma's `findUnique` method on the `category` model to find a category with the given name.
    // The `include: { book: true }` option ensures that the related books are also retrieved.
    // Use `Promise.all` to run these database queries in parallel.
    const categories = await Promise.all(names.map(name => 
      prisma.category.findUnique({
        where: { name: name },
        include: { book: true },
      })
    ));

    // Use 'flatMap' to flatten the nested arrays of books into a single array.
    // If a category wasn't found (i.e., is null), replace it with an empty array.
    const Books = categories.flatMap(category => category ? category.book : []);

    // Create a map to store the count of each book (keyed by book id).
    const bookCountMap = new Map();
    Books.forEach(book => {
      if (bookCountMap.has(book.id)) {
        bookCountMap.set(book.id, bookCountMap.get(book.id) + 1);
      } else {
        bookCountMap.set(book.id, 1);
      }
    });

    // Filter and sort the books based on their count, then map them back to book objects.
    const allBooks = Array.from(bookCountMap.entries())
      .filter(([_, count]) => count === names.length)
      .sort((a, b) => b[1] - a[1])
      .map(([id, _]) => books.find(book => book.id === id));

    // Calculate the total count of books and the total number of pages.
    const totalCount = allBooks.length;
    const totalPages = Math.ceil(totalCount / maxbooksnum);

    // Use the 'slice' method to get the books for the current page.
    const sortedBooks = allBooks.slice((pageNumber - 1) * maxbooksnum, pageNumber * maxbooksnum);

    // Send a 200 status code (OK) along with the books and pagination information.
    res.status(200).json({
      Books: sortedBooks,
      totalPages,
      currentPage: pageNumber,
      totalCount,
    });
  } catch (error) { // If an error is encountered while trying to execute the try block, it is caught here.

    // Log the error details and send a 500 status code (Internal Server Error) along with an error message.
    console.error('Error details:', error);
    res.status(500).json({ error: "Error retrieving category and its books" });
  }
};

  
  module.exports = {getCategoryWithBooks ,createCategory};
