

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllBooks = async (req, res) => {
  try {
    const books = await prisma.book.findMany();
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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
    res.status(404).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
};


const deleteBook = async(req,res) =>{
  const {id} = req.params;
  try{
    await prisma.book.delete({
        where: {id: parseInt(id)}});
    res.status(404).send();
  } catch(error){
   res.status(404).json({error: error.message});
  }

};




module.exports = { getAllBooks, getBookById, createBook, updateBook, deleteBook };

