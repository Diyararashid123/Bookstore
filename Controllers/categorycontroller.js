  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const limit = require('../store.js');
  
  const createCategory = async (req, res) => {
    const { name } = req.body;
    try {
      const newCategory = await prisma.category.create({
        data: { name },
      });
      res.status(201).json(newCategory);
    } catch (error) {
      res.status(500).json({ error: "Error creating category" });
    }
  };

  const getCategoryWithBooks = async (req, res) => {
    const names = req.query.names.split(',');
    try {
      const categories = await Promise.all(names.map(name => 
        prisma.category.findUnique({
          where: { name: name },
          include: { book: true },
        })
      ));
      const books = categories.flatMap(category => category ? category.book : []);
    
      // Create a map of book ids and their corresponding count
      const bookCountMap = new Map();
      books.forEach(book => {
        if (bookCountMap.has(book.id)) {
          bookCountMap.set(book.id, bookCountMap.get(book.id) + 1);
        } else {
          bookCountMap.set(book.id, 1);
        }
      });
    
      // Sort the books by count in descending order and then map it back to book objects
      // Only include books if their count matches the number of selected categories
      const sortedBooks = Array.from(bookCountMap.entries())
        .filter(([_, count]) => count === names.length)
        .sort((a, b) => b[1] - a[1])
        .map(([id, _]) => books.find(book => book.id === id));
    
      res.status(200).json(sortedBooks);
    } catch (error) {
      res.status(500).json({ error: "Error retrieving category and its books" });
    }
  };

  module.exports = {getCategoryWithBooks ,createCategory};
