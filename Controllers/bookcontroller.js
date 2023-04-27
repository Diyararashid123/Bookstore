

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
  console.log("The req quest body is:", req.body);
  const { title, description, price, authorId, categoryId } = req.body;
  try {
    const newBook = await prisma.book.create({
      data: { title, description, price, authorId, categoryId },
    });
    res.status(200).json(newBook);
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'The book already exists' });
    } else {
      res.status(500).json({ error: 'An error occurred while creating the book' });
    }
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

const createUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const newUser = await prisma.user.create({
      data: { username, password },
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error:"YOUU CAN NOT CREATE A NEW ACCOUNT"});
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (user && user.password === password) {
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ error: "YOU NEED TO CREATE AN ACCOUNT"});
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "USER DOES NOT EXIST"});
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

const addToWishlist = async (req, res) => {
  const { userId, bookId } = req.body;
  try {
    const wishlistItem = await prisma.wishlist.create({
      data: {
        user: { connect: { id: userId } },
        book: { connect: { id: bookId } },
      },
    });
    res.status(201).json(wishlistItem);
  } catch (error) {
    res.status(500).json({ error: 'Error adding book to wishlist' });
  }
};

const removeFromWishlist = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.wishlist.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error removing book from wishlist' });
  }
};

const getWishlistByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId: parseInt(userId) },
      include: { book: true },
    });
    res.status(200).json(wishlistItems);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching wishlist' });
  }
};


const addToCart = async (req, res) => {
  const { userId, bookId, quantity } = req.body;
  try {
    const cartItem = await prisma.cart.create({
      data: {
        user: { connect: { id: userId } },
        book: { connect: { id: bookId } },
        quantity,
      },
    });
    res.status(201).json(cartItem);
  } catch (error) {
    res.status(500).json({ error: 'Error adding book to cart' });
  }
};

const removeFromCart = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.cart.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error removing book from cart' });
  }
};

module.exports = { getAllBooks, getBookById, createBook, updateBook, deleteBook, createUser, loginUser, deleteUser, buyBook, addToWishlist, getWishlistByUserId,  removeFromWishlist, addToCart, removeFromCart};

