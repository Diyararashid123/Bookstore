

  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  const getAllBooks = async (req, res) => {
    try {
      const books = await prisma.book.findMany({
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
      });
      res.status(200).json(books);
    } catch (error) {
      console.log(error)
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

 const buyBook = async (req, res) => {
  // Extract user ID and cart from request body
  const { userId, cart } = req.body;

  try {
    // Find user in database
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Check if user exists
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Initialize total cost
    let totalCost = 0;

    // Iterate over all items in the cart
    for (let i = 0; i < cart.length; i++) {
      // Extract book ID and quantity from the current cart item
      const { id: bookId, quantity } = cart[i];

      // Find the corresponding book in the database
      const book = await prisma.book.findUnique({ where: { id: bookId } });

      // If the book doesn't exist, skip to the next item in the cart
      if (!book) {
        res.status(404).jso({error: 'The book dosnt exist'})
      }

      // Check if the quantity requested is more than the books stock
      if (book.stock < quantity) {

        // If it is, return an error message
        res.status(400).json({ error: `Requested quantity for ${book.title} exceeds book stock` });
        return;
      }

      // Calculate the cost for this book and add it to the total cost
      totalCost += book.price * quantity;

      // Updat the book sold count and stock in the databas
      const updatedBook = await prisma.book.update({
        where: { id: bookId },
        data: { totalSold: book.totalSold + quantity, stock: book.stock - quantity },
      });

      // Create a new purchase in the database
      const newPurchase = await prisma.purchase.create({
        data: {
          user: { connect: { id: userId } },
          book: { connect: { id: bookId } },
          quantity,
        },
      });
    }

    
    if (user.balance >= totalCost) {
      // If they do update the user's balance in the database
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { balance: user.balance - totalCost },
      });

      // Then return a successful purchase message
      res.status(201).json({ message: 'Book purchase successful' });
    } else {
      // If the user doesn't have enough balance, return an error message
      res.status(400).json({ error: 'Insufficient balance' });
    }
  } catch (error) {
    // If something went wrong during the process, return an error message
    res.status(500).json({ error: 'An error occurred while buying the book' });
  }
};

  
  const createBook = async (req, res) => {
    console.log('Request body:', req.body); // Log the request body
  
    const { title, description, price, categories } = req.body;
  
    try {
      const newBook = await prisma.book.create({
        data: {
          title,
          description,
          price,
          releaseDate: new Date(releaseDate),
          category:{
            connect: categories.map((categoryID) =>{
              return ({id: categoryID})
            })
          }
        },
      });

      res.status(201).json(newBook);
    } catch (error) {
      console.error('Error details:', error); // Log the error details
      res.status(500).json({ error: "Failed to create book" });
    }
  };
  

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
  
  
  module.exports = { getAllBooks, getBookById, createBook, updateBook, deleteBook, buyBook,searchBooks};