
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();



const createReview = async (req, res) => {
  const { bookId, userId, rating, comment } = req.body;
  // Validate the rating
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  try {
    // Check if the user has already reviewed this book
    const existingReview = await prisma.review.findFirst({
      where: {
        user: {
          clerkId: userId
        },
        bookId: parseInt(bookId),
      },
    });
    

    // If a review exists, return an error
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this book' });
    }

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
      select: {
        rating: true,
        comment: true,
        user: {
          select: {
            username: true,
            profileimageurl: true
          },
        },
      },
    });

    const reviewsWithUsername = reviews.map(review => ({
      rating: review.rating,
      comment: review.comment,
      username: review.user.username,
      profileimageurl: review.user.profileimageurl
    }));

    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    res.status(200).json({ averageRating, reviews: reviewsWithUsername });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};


module.exports = {createReview, deleteReview, getBookReviews,};