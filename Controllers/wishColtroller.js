

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


// The 'addToWishlist' function is an asynchronous function that adds a book to a user's wishlist in the database.
const addToWishlist = async (req, res) => {
  // The 'userId' and 'bookId' properties are extracted from the request body.
  const { userId, bookId } = req.body;

  // The authenticated user's ID is extracted from the request object.
  const authUserId = req.auth.userId;

  // If the authenticated user's ID does not match the user ID provided in the request body, an error is returned.
  if(authUserId != userId) {
    return res.status(401).json({ error: 'You cannot give a review as another user' });
  }

  // A user is retrieved from the database where the 'clerkId' matches the provided 'userId'.
  const user = await prisma.user.findUnique({
    where: {
      clerkId: userId
    }
  });

  // If the user is not found, an error is returned.
  if (!user) {
    return res.status(400).json({ error: 'User not found' });
  }

  try {
    // A new wishlist item is created in the database with the retrieved 'clerkId' and provided 'bookId'.
    const wishlistItem = await prisma.wishlist.create({
      data: {
        clerkId: user.clerkId,
        bookId: parseInt(bookId),
      },
    });
    
    // The newly created wishlist item is returned as the response.
    res.status(201).json({success:"Book added to wishlist."});
  } catch (error) {
    // If an error occurs while trying to execute the 'try' block, it is caught here.
    // Log the error to the console and return an error message.
    console.log(error);
    res.status(500).json({ error: error});
  }
};

// The 'removeFromWishlist' function is an asynchronous function that removes a book from a user's wishlist in the database.
const removeFromWishlist = async (req, res) => {
  // The 'userId' and 'id' properties are extracted from the request parameters.
  const {userId, id} = req.params;

  // The authenticated user's ID is extracted from the request object.
  const authUserId = req.auth.userId;

  // If the authenticated user's ID does not match the user ID provided in the request parameters, an error is returned.
  if(authUserId != userId) {
    return res.status(401).json({ error: 'You cannot give a review as another user' });
  }

  // A user is retrieved from the database where the 'clerkId' matches the provided 'userId'.
  const user = await prisma.user.findUnique({
    where: {
      clerkId: userId
    }
  });

  // If the user is not found, an error is returned.
  if (!user) {
    return res.status(400).json({ error: 'User not found' });
  }

  try {
    // The wishlist item with the provided 'id' is retrieved from the database.
    const wishlistItem = await prisma.wishlist.findUnique({ where: { id: parseInt(id) } });

    // If the 'userId' property of the wishlist item does not match the 'id' of the user, an error is returned.
    if(wishlistItem.userId !== user.id){
      return res.status(403).json({ error: 'This book does not belong to the user\'s wishlist' });
    }

    // The wishlist item with the provided 'id' is deleted from the database.
    await prisma.wishlist.delete({ where: { id: parseInt(id) } });
    
    // A 204 No Content status code is returned as the response, indicating that the operation was successful and that there is no additional content to send in the response payload body.
    res.status(204).json({success:"Book removed from wishlist."});
  } catch (error) {
    // If an error occurs while trying to execute the 'try' block, it is caught here.
    // The error message 'Error removing book from wishlist' is returned as the response.
    res.status(500).json({ error: 'Error removing book from wishlist' });
  }
};



// The 'getWishlistByUserId' function is an asynchronous function that retrieves a user's wishlist from the database.
const getWishlistByUserId = async (req, res) => {
  // The 'page', 'limit', and 'userId' properties are extracted from the request parameters.
  const { page = 1, limit = 10 } = req.params;
  const {userId} = req.body;

  // The authenticated user's ID is extracted from the request object.
  const authUserId = req.auth.userId;

  // If the authenticated user's ID does not match the user ID provided in the request parameters, an error is returned.
  if(authUserId != userId) {
    return res.status(401).json({ error: 'You cannot give a review as another user' });
  }

  try {
    // The total count of books in the database is retrieved.
    const totalCount = await prisma.book.count(); 
    
    // The total number of pages is calculated by dividing the total count by the limit and rounding up to the nearest whole number.
    const totalPages = Math.ceil(totalCount / limit);
    
    // The wishlist items for the user with the provided 'userId' are retrieved from the database.
    // This includes the associated book data.
    const Books = await prisma.wishlist.findMany({
      where: { clerkId: userId },
      include: { book: true },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
    });

    // The wishlist items, total pages, current page, and total count are returned as the response.
    res.status(200).json({
      Books: Books.map((item)=>item.book), 
      totalPages,
      currentPage: parseInt(page),
      totalCount});
  } catch (error) {
    // If an error occurs while trying to execute the 'try' block, it is caught here.
    // The error message 'Error fetching wishlist' is returned as the response.
    console.log(error)
    res.status(500).json({ error: 'Error fetching wishlist' });
  }
};


module.exports = {addToWishlist, removeFromWishlist, getWishlistByUserId};