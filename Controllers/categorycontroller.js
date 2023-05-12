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
  // when you wanna change name to something that aren't unique then you need to make it unique in prisma first
const getCategoryWithBooks = async (req, res) => {
  const { name } = req.params;
  try {
    const category = await prisma.category.findUnique({
      where: { name: name },
      include: { book: true },
    });
    if (category) {
      res.status(200).json(category);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
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
