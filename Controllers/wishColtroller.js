

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

module.exports = {addToWishlist, removeFromWishlist, getWishlistByUserId};