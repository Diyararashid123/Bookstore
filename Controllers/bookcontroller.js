

    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const maxbooksnum = require('../store.js');

    // Function to fetch all books with pagination and sorting feature
    const getAllBooks = async (req, res) => {
      // Destructure query params
      // Default value for page is 1 and sortBy can be undefined
      const {page = 1, sortBy } = req.query; 
    
      // Sort options based on the user request
      const sortOptions = {
        mostPopular: { totalSold: 'desc' }, // Most popular books, sorted by total sold in descending order
        topSelling: { price: 'desc' }, // Top selling books, sorted by price in descending order
        mostWished: {}, // Most wished books (no specific sort option provided)
        latestReleases: { releaseDate: 'desc' }, // Latest releases, sorted by release date in descending order
      };
    
      // If sortBy param is provided and matches any of the sortOptions, use it; otherwise, no sorting
      const orderBy = sortOptions[sortBy] || {};
    
      try {
        // Get total count of books in the database
        const totalCount = await prisma.book.count();
        // Calculate total pages based on count and maximum number of books per page
        const totalPages = Math.ceil(totalCount / maxbooksnum);
    
        // Fetch books from database with included category name, 
        // paginated based on provided page number and sorted according to orderBy
        const books = await prisma.book.findMany({
          include: {
            category: {
              select: {
                name: true,  // Only include the name field of the category
              },
            },
          },
          take: parseInt(maxbooksnum),  // Limit the number of books returned
          skip: (parseInt(page) - 1) * parseInt(maxbooksnum),  // Skip a number of records based on the page number
          orderBy,  // Order the books based on orderBy object
        });
    
        // Send the result with a 200 status code
        res.status(200).json({
          books,
          totalPages,
          currentPage: parseInt(page),
          totalCount,
        });
      } catch (error) {
        // Log error and send a 500 status code with an error message if any error occurs
        console.log(error);
        res.status(500).json({ error: 'An error occurred while fetching books' });
      }
    };

    // Function to get book recommendations based on the user's interactions
    const getBookRecommendations = async (req, res) => {
      // Destructure query params
      const { userId, page = 1, limit} = req.query;
    
      // If no limit is provided, default to 5
      const limitNumber  = limit ? Number(limit) : 5; 
    
      try {
        // Fetch all interactions of the user with books
        const userInteractions = await prisma.interaction.findMany({
          where: {
            clerkId: userId
          },
          include: {
            book: {
              select: {
                category: true
              }
            }
          }
        });
    
        // Initialize category count object
        let categoryCount = {};
        // Count the number of interactions for each category
        for (let interaction of userInteractions) {
          for (let category of interaction.book.category) {
            if (categoryCount[category.id]) {
              categoryCount[category.id]++;
            } else {
              categoryCount[category.id] = 1;
            }
          }
        }
    
        // Find the category with the maximum number of interactions
        let maxCount = 0;
        let maxCategory;
        for (let category in categoryCount) {
          if (categoryCount[category] > maxCount) {
            maxCount = categoryCount[category];
            maxCategory = category;
          }
        }
    
        // Count the total number of books in the most interacted category
        const totalCount = await prisma.book.count({
          where: {
            category: {
              some: {
                id: parseInt(maxCategory)
              }
            },
            id: {
              // Excluding the books that user already interacted with
              notIn: userInteractions.map(interaction => interaction.bookId)
            }
          }
        });
    
        // Calculate the total pages
        const totalPages = Math.ceil(totalCount / maxbooksnum);
    
        // Fetch recommended books from the most interacted category
        const Books = await prisma.book.findMany({
          where: {
            category: {
              some: {
                id: parseInt(maxCategory)
              }
            },
            id: {
              // Excluding the books that user already interacted with
              notIn: userInteractions.map(interaction => interaction.bookId)
            }
          },
          take: maxbooksnum,
          skip: (parseInt(page) - 1) * maxbooksnum,
        });
    
        // Send the result with a 200 status code
        res.status(200).json({
          Books,
          totalPages,
          currentPage: parseInt(page),
          totalCount,
        });
      } catch (error) {
        // Log the error and send a 500 status code with an error message
        console.error('Error details:', error);
        res.status(500).json({ error: 'An error occurred while fetching book recommendations' });
      }
    };

        // Function to get a specific book by its ID
        const getBookById = async (req, res) => {
          // Destructure book ID from request parameters
          const { id } = req.params;
          try {
            // Attempt to find the book in the database using the provided ID
            const book = await prisma.book.findUnique({ where: { id: parseInt(id) } });
            if (book) {
              // If book is found, return it with a 200 status code
              res.status(200).json(book);
            } else {
              // If no book is found, return a 404 status code with a 'Book not found' message
              res.status(404).json({ message: 'Book not found' });
            }
          } catch (error) {
            // If an error occurs (such as providing a non-existing ID), return a 500 status code with an error message
            res.status(500).json({ error: "BOOK ID DOES NOT EXIST" });
          }
        };
    
    // Function to handle book purchase
    const buyBook = async (req, res) => {
      // Extract user ID and cart from request body
      const { userId, cart } = req.body;

      // Extract user ID from the authentication token
      const authUserId = req.auth.userId;

      // Check if the authenticated user is the same as the user making the purchase
      if(authUserId != userId) {
        // If not, return a 401 unauthorized status
        return res.status(401).json({ error: 'You cannot give a review as another user' });
      }
    
      try {
        // Retrieve user from the database
        const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    
        // If user does not exist, return a 404 not found status
        if (!user) {
          res.status(404).json({ error: 'User not found' });
          return;
        }
        // Initialize total cost
        let totalCost = 0;
        
        // Iterate over all items in the cart
        for (let i = 0; i < cart.length; i++) {
          // Extract book ID and quantity from the current cart item
          const { id: bookId, quantity } = cart[i];
    
          // Retrieve book from the database
          const book = await prisma.book.findUnique({ where: { id: bookId } });
    
          // If book doesn't exist, return a 404 not found status
          if (!book) {
            res.status(404).json({error: 'The book does not exist'});
            continue;
          }
    
          // Check if book stock is enough for the requested quantity
          if (book.stock < quantity) {
            // If not enough, return a 400 bad request status
            res.status(400).json({ error: `Requested quantity for ${book.title} exceeds book stock` });
            return;
          }
    
          // Add cost of this book to the total cost
          totalCost += book.price * quantity;
        }
    
        // Check if user has enough balance to purchase the books
        if (user.balance >= totalCost) {
          // If they do, update the user's balance
          const updatedUser = await prisma.user.update({
            where: { clerkId: userId },
            data: { balance: user.balance - totalCost },
          });

          // Iterate over all items in the cart again to make the purchases
          for (let i = 0; i < cart.length; i++) {
            const { id: bookId, quantity } = cart[i];
            const book = await prisma.book.findUnique({ where: { id: bookId} });
    
            // Update the book's total sold and stock in the database
            const updatedBook = await prisma.book.update({
              where: { id: bookId },
              data: { totalSold: book.totalSold + quantity, stock: book.stock - quantity },
            });

            // Create a new purchase record in the database
            const newPurchase = await prisma.purchase.create({
              data: {
                user: {
                  connect:{
                    clerkId: userId
                  },
                },
                book:{
                  connect:{
                    id: book.id
                  }
                },
                quantity,
                createdAt: new Date(),
              },
            });
          } 
    
          // Return a successful purchase message
          res.status(201).json({ message: 'Book purchase successful' });
        } else {
          // If user doesn't have enough balance, return a 400 bad request status
          res.status(400).json({ error: 'Insufficient balance' });
        }
      } catch (error) {
        // If any error occurs, return a 500 internal server error status
        console.error('Error details:', error); 
        res.status(500).json({ error: error})
      };
    };

    
      // Function to create a new book
  const createBook = async (req, res) => {
    // Log the request body
    console.log('Request body:', req.body);

    // Destructure book details from request body
    const { title, description, price, categories, stock } = req.body;

    try {
      // Get current date
      const currentDate = new Date();
      
      // Create a new book in the database
      const newBook = await prisma.book.create({
        data: {
          title,
          stock,
          description,
          price,
          releaseDate: currentDate,
          category: {
            connect: categories.map((categoryID) => {
              return { id: categoryID };
            })
          }
        },
      });

      // Return the newly created book
      res.status(201).json(newBook);
    } catch (error) {
      // Log the error details
      console.error('Error details:', error);
      // Return a server error response
      res.status(500).json({ error: error });
    }
  };

  // Function to get the purchase history of a user
  const getPurchaseHistory = async (req, res) => {
    // Destructure user id, page number, and limit from request query
    const { userId, page = 1, limit } = req.query;

    // Extract user ID from the authentication token
    const authUserId = req.auth.userId;

    // Check if the authenticated user is the same as the user trying to view purchase history
    if(authUserId != userId) {
      // If not, return a 401 unauthorized status
      return res.status(401).json({ error: 'You cannot view the purchase history of another user' });
    }
  
    // If no limit is provided, default to 5
    const limitNumber = limit ? Number(limit) : 5;
  
    try {
      // Count the total purchases of the user
      const totalCount = await prisma.purchase.count({
        where: {
          user: {
            some: {
              clerkId: userId
            }
          }
        },
      });
      // Calculate total pages based on limit
      const totalPages = Math.ceil(totalCount / maxbooksnum);
  
      // Retrieve the purchases from the database
      const Books = await prisma.purchase.findMany({
        where: {
          user: {
            some: {
              clerkId: userId
            }
          }
        },
        include: {
          book: true
        },
        take: limitNumber,
        skip: (parseInt(page) - 1) * maxbooksnum,
      });
  
      // If there are no purchases found, return a 404 not found status
      if(Books.length === 0) {
        return res.status(404).json({ message: 'No purchases found for this user' });
      }
  
      // Return the purchases
      res.status(200).json({
        Books,
        totalPages,
        currentPage: parseInt(page),
        totalCount,
      });
    } catch (error) {
      // Log the error details
      console.error('Error details:', error);
      // Return a server error response
      res.status(500).json({ error: 'An error occurred while fetching the purchase history' });
    }
  };

  // Function to update a book's details
  const updateBook = async (req, res) => {
    // Destructure book id from request parameters
    const { id } = req.params;

    // Destructure book details from request body
    const { title, description, price, authorId, categoryId, stock } = req.body;

    try {
      // Update book details in the database
      const updatedBook = await prisma.book.update({
        where: { id: parseInt(id) },
        data: { title, description, price, authorId, categoryId, stock},
      });

      // Return the updated book
      res.status(200).json(updatedBook);
    } catch (error) {
      // Return a server error response
      res.status(500).json({ error: "THE BOOK CAN NOT BE UPDATED"});
    }
  };

  // Function to delete a book
  const deleteBook = async(req,res) =>{
    // Destructure book id from request parameters
    const {id} = req.params;

    try{
      // Delete the book from the database
      await prisma.book.delete({
        where: {id: parseInt(id)}
      });

      // Return a 204 no content status
      res.status(204).send();
    } catch(error){
      // If the book does not exist, return a 404 not found status
      res.status(404).json({error: error});
    }
  };


    // Function to search for books based on various criteria
const searchBooks = async (req, res) => {
  // Retrieve search parameters from the request query
  let { searchQuery, categories, minPrice, maxPrice, startDate, endDate, sortBy, page = 1, limit } = req.query;

  // If no limit is provided, default limit to 5
  const limitNumber = limit ? Number(limit) : 5;

  // Function to normalize the search query
  function normalize(input) {
    return input.replace(/[-\s]/g, '').toLowerCase();
  }

  // Normalize the search query
  searchQuery = normalize(searchQuery);

  // Split the categories by commas
  const categoryArray = categories ? categories.split(',') : null;

  // Set the sort order
  const orderBy = {};
  if (sortBy) {
    orderBy[sortBy] = 'desc';
  }

  try {
    // Count the total number of books that match the search criteria
    const totalCount = await prisma.book.count({
      where: {
        AND: [
          {
            OR: [
              { title: { contains: searchQuery, mode: 'insensitive' } },
            ],
          },
          categoryArray && { categoryId: { in: categoryArray } },
          minPrice && { price: { gte: parseFloat(minPrice) } },
          maxPrice && { price: { lte: parseFloat(maxPrice) } },
          startDate && { publicationDate: { gte: new Date(startDate) } },
          endDate && { publicationDate: { lte: new Date(endDate) } },
        ].filter(Boolean),
      },
    });

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalCount / maxbooksnum);

    // Retrieve the books that match the search criteria
    const books = await prisma.book.findMany({
      where: {
        AND: [
          {
            OR: [
              { title: { contains: searchQuery, mode: 'insensitive' } },
            ],
          },
          categoryArray && { categoryId: { in: categoryArray } },
          minPrice && { price: { gte: parseFloat(minPrice) } },
          maxPrice && { price: { lte: parseFloat(maxPrice) } },
          startDate && { publicationDate: { gte: new Date(startDate) } },
          endDate && { publicationDate: { lte: new Date(endDate) } },
        ].filter(Boolean),
      },
      orderBy,
      take: limitNumber,
      skip: (parseInt(page) - 1) * maxbooksnum,
    });

    // Filter the books to those that include the search query in their title
    const Books = books.filter(book => normalize(book.title).includes(searchQuery));

    // Respond with a status of 200 and a JSON object containing the matching books, totalPages, currentPage, and totalCount
    res.status(200).json({
      Books,
      totalPages,
      currentPage: parseInt(page),
      totalCount,
    });

  // If there is an error during execution, respond with a status of 500 and an error message
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while searching for books' });
  }
};

    
    // Function to get the top selling books
const getTopSellingBooks = async (req, res) => {
  try {
    // Retrieve the limit and page number from the request body
    const { limit, page = 1 } = req.body;

    // If no limit is provided, set default limit to 5
    const limitNumber = limit ? Number(limit) : 5;

    // Use prisma to count the number of books where totalSold is greater than 0
    const totalCount = await prisma.book.count({
      where: {
        totalSold: {
          gt: 0 // Only include books where totalSold is greater than 0
        }
      },
    });

    // Calculate the total number of pages based on the totalCount and limit
    const totalPages = Math.ceil(totalCount / maxbooksnum);

    // Retrieve books from the database where totalSold is greater than 0,
    // and ordered by totalSold in descending order.
    const Books = await prisma.book.findMany({
      where: {
        totalSold: {
          gt: 0 // Only include books where totalSold is greater than 0
        }
      },
      // Use the limitNumber to determine the number of results to return
      take: maxbooksnum,
      // Skip results based on the current page number
      skip: ( parseInt(page) - 1) * maxbooksnum,
      // Order the results by totalSold in descending order
      orderBy: {
        totalSold: 'desc',
      },
    });

    // Respond with a status of 200 and a JSON object containing the books, totalPages, currentPage, and totalCount
    res.status(200).json({
      Books,
      totalPages,
      currentPage: parseInt(page),
      totalCount,
    });

  // If there is an error during execution, log the error and respond with a status of 500 and an error message
  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ error: 'An error occurred while retrieving top selling books' });
  }
};

    // Function to get the most popular books based on views
const getMostPopularBooks = async (req, res) => {
  try {
    // Extract 'limit' and 'page' from the request query, if 'page' is not provided default it to 1
    const { limit, page = 1 } = req.query;

    // If no limit is provided, default limit to 5
    const limitNumber = limit ? Number(limit) : 5;

    // Count the total number of books in the database
    const totalCount = await prisma.book.count();
    
    // Calculate the total number of pages based on the total count and maxbooksnum
    const totalPages = Math.ceil(totalCount / maxbooksnum);

    // Get the books from the database ordered by views in descending order
    const Books = await prisma.book.findMany({
      take: maxbooksnum, // limit the number of books to the limitNumber
      skip: (parseInt(page) - 1) * maxbooksnum, // skip the books that come before the current page
      orderBy: { // order the results by the number of views in descending order
        views: 'desc',
      },
    });

    // Respond with a status of 200 and a JSON object containing the books, totalPages, currentPage, and totalCount
    res.status(200).json({
      Books,
      totalPages,
      currentPage: parseInt(page),
      totalCount,
    });
  
  // If an error occurs during the execution of the try block, catch the error and handle it
  } catch (error) {
    // Log the error details to the console
    console.error('Error details:', error);

    // Respond with a status of 500 (Internal Server Error) and a JSON object containing an error message
    res.status(500).json({ error: 'An error occurred while retrieving most popular books' });
  }
};


   // This function is designed to retrieve the most wished books in the database.
const getMostWishedBooks = async (req, res) => {
  try {
    // Destructuring limit and page from request's query parameters. If page is not provided, default it to 1.
    const { limit, page = 1 } = req.query;

    // If no limit is provided, set it as 5 by default.
    const limitNumber = limit ? Number(limit) : 5;

    // Count the total number of books in the database.
    const totalCount = await prisma.book.count();
    
    // Compute the total pages based on totalCount and the number of maximum books per page (maxbooksnum).
    const totalPages = Math.ceil(totalCount / maxbooksnum);

    // Query the database to retrieve books, sorted by the number of times they've been wished for in descending order.
    const Books = await prisma.book.findMany({
      take: limitNumber, // limit the number of books returned based on limitNumber.
      skip: (parseInt(page) - 1) * maxbooksnum, // skip a certain number of books based on the current page.
      orderBy: { // Order by wishlistCount in descending order.
        wishlistCount: 'desc',
      },
    });

    // Send a HTTP status 200 (OK) response along with a JSON containing the books, totalPages, current page number, and total book count.
    res.status(200).json({
      Books,
      totalPages,
      currentPage: parseInt(page),
      totalCount,
    });
  
  } catch (error) { // If an error is encountered while trying to execute the try block, it is caught here.
    // Log the error details to the console.
    console.error('Error details:', error);

    // Send a HTTP status 500 (Internal Server Error) response along with a JSON containing an error message.
    res.status(500).json({ error: 'An error occurred while retrieving most wished books' });
  }
};

    // This function retrieves the latest released books from the database.
const getLatestReleasedBooks = async (req, res) => {
  try {
    // Destructuring limit and page from the request's query parameters. If page is not provided, it defaults to 1.
    const { limit, page = 1 } = req.query;

    // If no limit is provided, it defaults to 5.
    const limitNumber = limit ? Number(limit) : 5;

    // Counting the total number of books in the database.
    const totalCount = await prisma.book.count();
    
    // Compute the total pages based on totalCount and the number of maximum books per page (maxbooksnum).
    const totalPages = Math.ceil(totalCount / maxbooksnum);

    // Query the database to retrieve books, ordered by releaseDate in descending order.
    const Books = await prisma.book.findMany({
      take: limitNumber, // Limit the number of books returned based on limitNumber.
      skip: (parseInt(page) - 1) * maxbooksnum, // Skip a certain number of books based on the current page.
      orderBy: { // Order by releaseDate in descending order.
        releaseDate: 'desc',
      },
    });

    // Send a HTTP status 200 (OK) response along with a JSON containing the books, totalPages, current page number, and total book count.
    res.status(200).json({
      Books,
      totalPages,
      currentPage: parseInt(page),
      totalCount,
    });
  
  } catch (error) { // If an error is encountered while trying to execute the try block, it is caught here.
    // Log the error details to the console.
    console.error('Error details:', error);

    // Send a HTTP status 500 (Internal Server Error) response along with a JSON containing an error message.
    res.status(500).json({ error: 'An error occurred while retrieving latest released books' });
  }
};

  // This function retrieves books that are similar to the provided book id. This function dosenot have pagenation becuase we only need 5 books.
const getSimilarBooks = async (req, res) => {
  // Destructuring id from the request's parameters.
  const { id } = req.params;
  
  // Parsing limit from the request's query parameters. If not provided, it defaults to 5.
  const limit = parseInt(req.query.limit) || 5; 

  try {
    // Fetch the book with the provided id, including its associated categories.
    const book = await prisma.book.findUnique({
      where: { id: parseInt(id) },
      include: { category: true }
    });

    // If no book is found with the provided id, return a 404 status code and an error message.
    if (!book) {
      return res.status(404).json({ error: `No book found with id: ${id}` });
    }

    // Find books that share at least one category with the given book
    const similarBooks = await prisma.book.findMany({
      where: { 
        category: {
          some: {
            id: {
              // Filter for books that have a category id that exists in the book's category id array.
              in: book.category.map(c => c.id),
            },
          },
        },
        id: {
          // Exclude the original book itself.
          not: parseInt(id)
        }
      },
      // Limit the number of similar books returned.
      take: limit
    });

    // Return the similar books in the response.
    return res.json(similarBooks);

  } catch (error) { // If an error is encountered while trying to execute the try block, it is caught here.
    // Log the error to the console.
    console.error(error);

    // Return a 500 status code (Internal Server Error) and an error message.
    return res.status(500).json({ error: 'An error occurred while trying to fetch similar books' });
  }
};

// This function retrieves the featured books from the database.
const getFeaturedBooks = async (req, res) => {
  try {
    // Destructuring limit and page from the request's query parameters.
    // If no page number is provided, it defaults to 1.
    const { limit, page = 1 } = req.query;

    // Parsing limit from the query parameters. If not provided, it defaults to 5.
    const limitNumber = limit ? Number(limit) : 5;

    // Count the total number of featured books in the database.
    const totalCount = await prisma.book.count({
      where: {
        // Only count books where the 'featured' attribute is true.
        featured: true,
      },
    });

    // Calculate the total number of pages by dividing the total count by the max number of books per page, rounding up to ensure all books are included.
    const totalPages = Math.ceil(totalCount / maxbooksnum);

    // Fetch the featured books from the database.
    const Books = await prisma.book.findMany({
      where: {
        // Only fetch books where the 'featured' attribute is true.
        featured: true,
      },
      orderBy: {
        // Order the books by id in ascending order.
        id: 'asc',
      },
      // Limit the number of books returned.
      take: limitNumber,
      // Skip the books of the previous pages.
      skip: (parseInt(page) - 1) * maxbooksnum,
    });

    // Send a successful response with the featured books, total pages, current page, and total count.
    res.status(200).json({
      Books,
      totalPages,
      currentPage: parseInt(page),
      totalCount,
    });

  } catch (error) { // If an error is encountered while trying to execute the try block, it is caught here.
    // Log the error to the console.
    console.error('Error details:', error);

    // Send a 500 status code (Internal Server Error) and an error message.
    res.status(500).json({ error: 'An error occurred while retrieving featured books' });
  }
};



    module.exports = { getAllBooks,searchBooks,getMostPopularBooks, getLatestReleasedBooks, getMostWishedBooks,getTopSellingBooks, getSimilarBooks, getBookRecommendations, getFeaturedBooks, getPurchaseHistory,getBookById,createBook, updateBook, deleteBook, buyBook};