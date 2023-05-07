

  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  const getAllBooks = async (req, res) => {
    try {
      const books = await prisma.book.findMany();
      res.status(200).json(books);
    } catch (error) {
      res.status(500).json({ error: "There is no book " });
    }
  };

  const getBookById = async (req, res) => {
    const { id } = req.params;
    try {
      const book = await prisma.book.findUnique({ where: { id: parseInt(id) } });
      if (book) {
        res.status(200).json(book);
      } else {
        res.status(404).json({ message: 'Book not found' });
      }
    } catch (error) {
      res.status(500).json({ error: "BOOK ID DOSE NOT EXIST" });
    }
  };

  const createBook = async (req, res) => {
    const { title, description, price, categories } = req.body;
  
    try {
      const newBook = await prisma.book.create({
        data: {
          title,
          description,
          price,
        },
      });
  
      const bookCategories = categories.map(categoryId => ({
        categoryId,
        bookId: newBook.id,
      }));
  
      await prisma.bookCategories.createMany({ data: bookCategories });
  
      res.status(201).json(newBook);
    } catch (error) {
      console.error(error); // Add this line to log the error
      res.status(500).json({ error: "Failed to create book" });
    }
  };
  
  async function create() {
    const book = {
      title: "Asdwff Lover",
      price: 1299.99,
      description: "Hello test test",
      categories: [1], // Replace with an array of actual category IDs
    };
  
    const response = await fetch("https://bookstore-git-main-diyararashid123.vercel.app/book/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(book),
    });
  
    const data = await response.json();
    console.log(data);
  }
  
  create();
  

  const updateBook = async (req, res) => {
    const { id } = req.params;
    const { title, description, price, authorId, categoryId } = req.body;
    try {
      const updatedBook = await prisma.book.update({
        where: { id: parseInt(id) },
        data: { title, description, price, authorId, categoryId },
      });
      res.status(200).json(updatedBook);
    } catch (error) {
      res.status(500).json({ error: "THE BOOK CAN NOT BE UPDATED"});
    }
  };

  const deleteBook = async(req,res) =>{
    const {id} = req.params;
    try{
      await prisma.book.delete({
          where: {id: parseInt(id)}});
      res.status(404).send();
    } catch(error){
    res.status(404).json({error: "THE BOOK DOSE NOT EXIST"});
    }

  };

  const buyBook = async (req, res) => {
    const { userId, bookId } = req.body;
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const book = await prisma.book.findUnique({ where: { id: bookId } });

      if (!user || !book) {
        res.status(404).json({ error: 'User or book not found' });
        return;
      }

      if (user.balance >= book.price) {
        const newPurchase = await prisma.purchase.create({
          data: {
            user: { connect: { id: userId } },
            book: { connect: { id: bookId } },
          },
        });

        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { balance: user.balance - book.price },
        });

        res.status(201).json({ message: 'Book purchase successful', purchase: newPurchase });
      } else {
        res.status(400).json({ error: 'Insufficient balance' });
      }
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while buying the book' });
    }
  };

  module.exports = { getAllBooks, getBookById, createBook, updateBook, deleteBook, buyBook};

  /*
  const searchBooks = async (req, res) => {
    const { searchQuery, categories, minPrice, maxPrice, startDate, endDate, sortBy } = req.query;
  
    // Convert categories string to an array in javascript
    const categoryArray = categories ? categories.split(',') : null;
  
    // Prepare sorting options
    const orderBy = {};
    if (sortBy) {
      //desc from low to high
      orderBy[sortBy] = 'desc';
    }
  
    try {
      const books = await prisma.book.findMany({
        where: {
          AND: [
            {
              // make it easier for the user to serach by tille, author and category of the book and filtering it accouring to the users input
              OR: [
                { title: { contains: searchQuery, mode: 'insensitive' } },
                { author: { name: { contains: searchQuery, mode: 'insensitive' } } },
                { category: { name: { contains: searchQuery, mode: 'insensitive' } } },
              ],
            },
            categoryArray && { categoryId: { in: categoryArray } },
            minPrice && { price: { gte: parseFloat(minPrice) } },
            maxPrice && { price: { lte: parseFloat(maxPrice) } },
            startDate && { publicationDate: { gte: new Date(startDate) } },
            endDate && { publicationDate: { lte: new Date(endDate) } },
          ].filter(Boolean),
        },
        orderBy,
      });
  
      res.status(200).json(books);
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while searching for books' });
    }
  };
  
  */