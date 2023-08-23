
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const maxbooksnum = require('../store.js');
// This function is responsible for creating a new review.
const createReview = async (req, res) => {
  // Destructure 'bookId', 'userId', 'rating' and 'comment' from the request body.
  const { bookId, userId, rating, comment } = req.body;

  // Get the authenticated user's ID from the request object.
  const authUserId = req.auth.userId;

  // Check if the authenticated user is the same as the user who is supposed to create the review.
  // If not, return a 401 Unauthorized response.
  if(authUserId != userId) {
    return res.status(401).json({ error: 'Unauthorized Request.' });
  }

  // Validate the rating to ensure it's between 1 and 5. If not, return a 400 Bad Request response.
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  try {
    // Check if the user has already reviewed this book by using Prisma's `findFirst` method.
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: userId,  
        bookId: parseInt(bookId),
      },
    });

    // If a review from this user for this book already exists, return a 400 Bad Request response.
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this book' });
    }

    // Create a new review using Prisma's `create` method.
    const review = await prisma.review.create({
      data: {
        userId: userId,  // Assign the review to the authenticated user
        bookId: parseInt(bookId),
        rating: rating,
        comment: comment,
        createdAt: new Date(),
      },
    });

    // Return a 201 Created response along with the newly created review.
    res.status(201).json("Review created successfully.");
  } catch (error) { // If an error occurs while trying to execute the try block, it is caught here.

    // Log the error to the console and return a 500 Internal Server Error response.
    console.error(error);
    res.status(500).json({ error: 'Failed to create review' });
  }
};


// This function is responsible for deleting a review.
const deleteReview = async (req, res) => {
  // Get 'id' from the request parameters.
  const { id } = req.params;
  try {
    // Try to delete the review with the provided 'id' using Prisma's 'delete' method.
    const review = await prisma.review.delete({
      where: {
        id: parseInt(id),
      },
    });
    // If successful, return a 200 OK status and a success message.
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) { // If an error occurs while trying to execute the try block, it is caught here.
    // Log the error to the console and return a 500 Internal Server Error status along with an error message.
    console.error(error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};

// This function is responsible for fetching all reviews of a specific book.
const getBookReviews = async (req, res) => {
  // 'page' and 'id' are extracted from the request parameters. The default value for 'page' is 1.
  const { page = 1, id } = req.params;
  
  try {
    // Count the total number of reviews for the specific book.
    const totalCount = await prisma.review.count({
      where: {
        bookId: parseInt(id),
      },
    });

    // Calculate the total number of pages.
    const totalPages = Math.ceil(totalCount / maxbooksnum);

    // Fetch the reviews for the specific book from the database. The fields selected are 'rating', 'comment', and the user's 'username' and 'profileimageurl'.
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
      take: maxbooksnum,
      skip: (parseInt(page) - 1) * maxbooksnum,
    });

    // Prepare the reviews data to be sent in the response by mapping the review object to include only the 'rating', 'comment', 'username', and 'profileimageurl'.
    const reviewsWithUsername = reviews.map(review => ({
      rating: review.rating,
      comment: review.comment,
      username: review.user.username,
      profileimageurl: review.user.profileimageurl,
    }));

    // Calculate the average rating of the reviews.
    const averageRating = 
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    // Send the reviews data, the average rating, the total pages, the current page number, and the total count of reviews in the response.
    res.status(200).json({ 
      averageRating, 
      reviews: reviewsWithUsername,
      totalPages,
      currentPage: parseInt(page),
      totalCount,
    });
  } catch (error) { // If an error occurs while trying to execute the try block, it is caught here.
    // Log the error to the console and return a 500 Internal Server Error status along with an error message.
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};




module.exports = {createReview, deleteReview, getBookReviews,};