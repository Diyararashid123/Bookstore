

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const addToWishlist = async (req, res) => {
  const { userId, bookId } = req.body;

  // Find the user with the given clerkId
  const user = await prisma.user.findUnique({
    where: {
      clerkId: userId
    }
  });

  // Check if the user was found
  if (!user) {
    return res.status(400).json({ error: 'User not found' });
  }

  try {
    const wishlistItem = await prisma.wishlist.create({
      data: {
        clerkId: user.clerkId,
        bookId: bookId,
        userId: user.id,
      },
    });
    console.log(wishlistItem);
    res.status(201).json(wishlistItem);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error});
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
      where: { clerkId: parseInt(userId) },
      include: { book: true },
    });
    res.status(200).json(wishlistItems);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching wishlist' });
  }
};

module.exports = {addToWishlist, removeFromWishlist, getWishlistByUserId};