
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createReview = async (req, res) => {
  const { bookId, userId, rating, comment } = req.body;
  try {
    const review = await prisma.review.create({
      data: {
        user: {
          connect: { clerkId: userId },
        },
        book: {
          connect: { id: parseInt(bookId) },
        },
        rating: rating,
        comment: comment,
        createdAt: new Date(),
      },
    });
    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create review' });
  }
};

const deleteReview = async (req, res) => {
  const { id } = req.params;
  try {
    const review = await prisma.review.delete({
      where: {
        id: parseInt(id),
      },
    });
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};

const getBookReviews = async (req, res) => {
  const { id } = req.params;
  try {
    const reviews = await prisma.review.findMany({
      where: {
        bookId: parseInt(id),
      },
    });
    res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

module.exports = {createReview, deleteReview, getBookReviews };