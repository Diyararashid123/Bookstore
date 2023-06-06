  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  const getAllCategories = async (req, res) => {
    try {
      const categories = await prisma.category.findMany();
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ error: "Error retrieving categories" });
    }
  };

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
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving category and its books" });
  }
};




  const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
      const updatedCategory = await prisma.category.update({
        where: { id: parseInt(id) },
        data: { name },
      });
      res.status(200).json(updatedCategory);
    } catch (error) {
      res.status(500).json({ error: "Error updating category" });
    }
  };

  const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.category.delete({
        where: { id: parseInt(id) },
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Error deleting category" });
    }
  };

  module.exports = { getAllCategories, getCategoryWithBooks ,createCategory, updateCategory, deleteCategory };
