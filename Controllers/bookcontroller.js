

    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const maxbooksnum = require('../store.js');

    const getAllBooks = async (req, res) => {
      const {page = 1, sortBy } = req.query; 
    
      const sortOptions = {
        mostPopular: { totalSold: 'desc' },
        topSelling: { price: 'desc' },
        mostWished: {},
        latestReleases: { releaseDate: 'desc' },
      };
    
      const orderBy = sortOptions[sortBy] || {};
    
      try {
        const totalCount = await prisma.book.count();
        const totalPages = Math.ceil(totalCount / maxbooksnum);
    
        const books = await prisma.book.findMany({
          include: {
            category: {
              select: {
                name: true,
              },
            },
          },
          take: parseInt(maxbooksnum),
          skip: (parseInt(page) - 1) * parseInt(maxbooksnum),
          orderBy,
        });
    
        res.status(200).json({
          books,
          totalPages,
          currentPage: parseInt(page),
          totalCount,
        });
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'An error occurred while fetching books' });
      }
    };

    const getBookRecommendations = async (req, res) => {
      const { userId, page = 1, limit } = req.query;
    
      const limitNumber = limit ? Number(limit) : 5; // If no limit is provided, default to 5
    
      try {
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
    
        let categoryCount = {};
        for (let interaction of userInteractions) {
          for (let category of interaction.book.category) {
            if (categoryCount[category.id]) {
              categoryCount[category.id]++;
            } else {
              categoryCount[category.id] = 1;
            }
          }
        }
    
        let maxCount = 0;
        let maxCategory;
        for (let category in categoryCount) {
          if (categoryCount[category] > maxCount) {
            maxCount = categoryCount[category];
            maxCategory = category;
          }
        }
    
        const totalCount = await prisma.book.count({
          where: {
            category: {
              some: {
                id: parseInt(maxCategory)
              }
            },
            // Exclude books the user has already interacted with
            id: {
              notIn: userInteractions.map(interaction => interaction.bookId)
            }
          },
        });
        const totalPages = Math.ceil(totalCount / limitNumber);
    
        const recommendedBooks = await prisma.book.findMany({
          where: {
            category: {
              some: {
                id: parseInt(maxCategory)
              }
            },
            id: {
              notIn: userInteractions.map(interaction => interaction.bookId)
            }
          },
          take: limitNumber,
          skip: (parseInt(page) - 1) * limitNumber,
        });
    
        res.status(200).json({
          recommendedBooks,
          totalPages,
          currentPage: parseInt(page),
          totalCount,
        });
      } catch (error) {
        console.error('Error details:', error);
        res.status(500).json({ error: 'An error occurred while fetching book recommendations' });
      }
    };
    
    
    
    const getBookById = async (req, res) => {
      const { id } = req.params;
      try {
        const book = await prisma.book.findUnique({ where: { id: parseInt(id) } });
        if (book) {
          res.status(200).json(book);
        } else {
          res.status(404).json({ message: 'Book not found' });
        }
      } catch (error) {
        res.status(500).json({ error: "BOOK ID DOSE NOT EXIST" });
      }
    };

    const buyBook = async (req, res) => {
      // Extract user ID and cart from request body
      const { userId, cart } = req.body;
    
      try {
        // Find user in database
        const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    
        // Check if user exists
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
    
          // Find the corresponding book in the database
          const book = await prisma.book.findUnique({ where: { id: bookId } });
    
          // If the book doesn't exist, skip to the next item in the cart
          if (!book) {
            res.status(404).json({error: 'The book does not exist'});
            continue;
          }
    
          // Check if the quantity requested is more than the books stock
          if (book.stock < quantity) {
            // If it is, return an error message
            res.status(400).json({ error: `Requested quantity for ${book.title} exceeds book stock` });
            return;
          }
    
          // Calculate the cost for this book and add it to the total cost
          totalCost += book.price * quantity;
        }
    
        if (user.balance >= totalCost) {
          // If they do, update the user's balance in the database
          const updatedUser = await prisma.user.update({
            where: { clerkId: userId },
            data: { balance: user.balance - totalCost },
          });

          for (let i = 0; i < cart.length; i++) {
            const { id: bookId, quantity } = cart[i];
            const book = await prisma.book.findUnique({ where: { id: bookId} });

    
             // Update the book sold count and stock in the database
             const updatedBook = await prisma.book.update({
              where: { id: bookId },
              data: { totalSold: book.totalSold + quantity, stock: book.stock - quantity },
            });

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
          console.log(cart);
    
          // Then return a successful purchase message
          res.status(201).json({ message: 'Book purchase successful' });
        } else {
          console.log(newPurchase);
          // If the user doesn't have enough balance, return an error message
          res.status(400).json({ error: 'Insufficient balance' });
        }
      } catch (error) {
        // If something went wrong during the process, return an error message
        console.error('Error details:', error); 
        res.status(500).json({ error: error})
      };
    };
    
    
  const createBook = async (req, res) => {
    console.log('Request body:', req.body); // Log the request body

    const { title, description, price, categories, stock } = req.body;

    try {
      const currentDate = new Date();
      
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

      res.status(201).json(newBook);
    } catch (error) {
      console.error('Error details:', error); // Log the error details
      res.status(500).json({ error: error });
    }
  };

  const getPurchaseHistory = async (req, res) => {
    const { userId, page = 1, limit } = req.query;
  
    const limitNumber = limit ? Number(limit) : 5; // If no limit is provided, default to 5
  
    try {
      const totalCount = await prisma.purchase.count({
        where: {
          user: {
            some: {
              clerkId: userId
            }
          }
        },
      });
      const totalPages = Math.ceil(totalCount / limitNumber);
  
      const purchases = await prisma.purchase.findMany({
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
        skip: (parseInt(page) - 1) * limitNumber,
      });
  
      if(purchases.length === 0) {
        return res.status(404).json({ message: 'No purchases found for this user' });
      }
  
      res.status(200).json({
        purchases,
        totalPages,
        currentPage: parseInt(page),
        totalCount,
      });
    } catch (error) {
      console.error('Error details:', error);
      res.status(500).json({ error: 'An error occurred while fetching the purchase history' });
    }
  };
  
  

    const updateBook = async (req, res) => {
      const { id } = req.params;
      const { title, description, price, authorId, categoryId, stock } = req.body;
      try {
        const updatedBook = await prisma.book.update({
          where: { id: parseInt(id) },
          data: { title, description, price, authorId, categoryId, stock},
        });
        res.status(200).json(updatedBook);
      } catch (error) {
        res.status(500).json({ error: "THE BOOK CAN NOT BE UPDATED"});
      }
    };

    const deleteBook = async(req,res) =>{
      const {id} = req.params;
      try{
        await prisma.book.delete({
            where: {id: parseInt(id)}});
        res.status(404).send();
      } catch(error){
      res.status(404).json({error: "THE BOOK DOSE NOT EXIST"});
      }

    };
    const searchBooks = async (req, res) => {
      let { searchQuery, categories, minPrice, maxPrice, startDate, endDate, sortBy, page = 1, limit } = req.query;
    
      const limitNumber = limit ? Number(limit) : 5; // If no limit is provided, default to 5
    
      function normalize(input) {
        return input.replace(/[-\s]/g, '').toLowerCase();
      }
    
      searchQuery = normalize(searchQuery);
    
      const categoryArray = categories ? categories.split(',') : null;
    
      const orderBy = {};
      if (sortBy) {
        orderBy[sortBy] = 'desc';
      }
    
      try {
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
        const totalPages = Math.ceil(totalCount / limitNumber);
    
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
          skip: (parseInt(page) - 1) * limitNumber,
        });
    
        const matchingBooks = books.filter(book => normalize(book.title).includes(searchQuery));
    
        res.status(200).json({
          matchingBooks,
          totalPages,
          currentPage: parseInt(page),
          totalCount,
        });
      } catch (error) {
        res.status(500).json({ error: 'An error occurred while searching for books' });
      }
    };
    

    const getTopSellingBooks = async (req, res) => {
      try {
        const { limits } = req.body;

        const books = await prisma.book.findMany({
          where: {
            totalSold: {
              gt: 0 // Only include books where totalSold is greater than 0
            }
          },
          take: parseInt(limits) || undefined,
          orderBy: {
            totalSold: 'desc',
          },
        });
        res.status(200).json(books);
      } catch (error) {
        res.status(500).json({ error: 'An error occurred while retrieving top selling books' });
      }
    };
    
    const getMostPopularBooks = async (req, res) => {
      try {
        const { limits } = req.query;
        const books = await prisma.book.findMany({
          take: parseInt(limits) || undefined,
          orderBy: {
            views: 'desc',
          },
        });
        res.status(200).json(books);
      } catch (error) {
        res.status(500).json({ error: 'An error occurred while retrieving most popular books' });
      }
    };
    
    const getMostWishedBooks = async (req, res) => {
      try {
        const { limits } = req.query;
        const books = await prisma.book.findMany({
          take: parseInt(limits) || undefined,
          orderBy: {
            wishlistCount: 'desc',
          },
        });
        res.status(200).json(books);
      } catch (error) {
        res.status(500).json({ error: 'An error occurred while retrieving most wished books' });
      }
    };
    
    const getLatestReleasedBooks = async (req, res) => {
      try {
        const { limits } = req.query;
        const books = await prisma.book.findMany({
          take: parseInt(limits) || undefined,
          orderBy: {
            releaseDate: 'desc',
          },
        });
        res.status(200).json(books);
      } catch (error) {
        res.status(500).json({ error: 'An error occurred while retrieving latest released books' });
      }
    };

    const getSimilarBooks = async (req, res) => {
      const { id } = req.params;
      const limit = parseInt(req.query.limit) || 5; 
    
      try {
        const book = await prisma.book.findUnique({
          where: { id: parseInt(id) },
          include: { category: true }
        });
    
        if (!book) {
          return res.status(404).json({ error: `No book found with id: ${id}` });
        }
    
        // Find books that share at least one category with the given book
        const similarBooks = await prisma.book.findMany({
          where: { 
            category: {
              some: {
                id: {
                  in: book.category.map(c => c.id),
                },
              },
            },
            id: {
              not: parseInt(id) // exclude the book itself
            }
          },
          take: limit
        });
    
        return res.json(similarBooks);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while trying to fetch similar books' });
      }
    };
    
    const getFeaturedBooks = async (req, res) => {
      try {
        const featuredBooks = await prisma.book.findMany({
          where: {
            featured: true,
          },
          orderBy: {
            id: 'asc',
          },
        });
    
        return res.json(featuredBooks);
      } catch (error) {
        console.error(error);
        // Handle error
      }
    };

    module.exports = { getAllBooks,searchBooks,getMostPopularBooks, getLatestReleasedBooks, getMostWishedBooks,getTopSellingBooks, getSimilarBooks, getBookRecommendations, getFeaturedBooks, getPurchaseHistory,getBookById,createBook, updateBook, deleteBook, buyBook};