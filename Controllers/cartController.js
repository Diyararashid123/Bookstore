const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


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

const updateCartItem = async (req, res) => {
  const { id, quantity } = req.body;
  try {
    const updatedCartItem = await prisma.cart.update({
      where: { id: parseInt(id) },
      data: { quantity },
    });
    res.status(200).json(updatedCartItem);
  } catch (error) {
    res.status(500).json({ error: 'Error updating book quantity in cart' });
  }
};

const getCartByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const cartItems = await prisma.cart.findMany({
      where: { userId: parseInt(userId) },
      include: { book: true },
    });
    res.status(200).json(cartItems);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching cart items' });
  }
};

module.exports = {addToCart, removeFromCart, updateCartItem, getCartByUserId };