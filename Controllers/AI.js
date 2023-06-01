// const express = require('express');
// const { WebhookClient } = require('dialogflow-fulfillment');
// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient();
// const app = express();

// app.post('/webhook', express.json(), (req, res) => {
//   const agent = new WebhookClient({ request: req, response: res });

//   function recommendBooks(agent) {
//     const userId = agent.parameters.userId;
//     const genre = agent.parameters.genre;
//     const type = agent.parameters.type;

//     return prisma.user.findUnique({
//       where: { id: userId },
//     })
//     .then(user => {
//       return prisma.book.findMany({
//         where: {
//           AND: [
//             { genre: { contains: genre, mode: 'insensitive' } },
//             { type: { contains: type, mode: 'insensitive' } },
//             { rating: { gte: user.minPreferredRating } },
//           ],
//         },
//       });
//     })
//     .then(books => {
//       if (!books.length) {
//         agent.add(`I'm sorry, I couldn't find any ${type} books in the ${genre} genre.`);
//       } else {
//         const bookTitles = books.map(book => book.title).join(', ');
//         agent.add(`Here are some ${type} books in the ${genre} genre that you might like: ${bookTitles}`);
//       }
//     })
//     .catch(error => {
//       console.error(error);
//       agent.add('I encountered an error while looking for books. Please try again later.');
//     });
//   }

//   function bestSellingBooks(agent) {
//     return prisma.book.findMany({
//       orderBy: { sales: 'desc' },
//       take: 5,
//     })
//     .then(books => {
//       const bookTitles = books.map(book => book.title).join(', ');
//       agent.add(`Here are the best-selling books right now: ${bookTitles}`);
//     })
//     .catch(error => {
//       console.error(error);
//       agent.add('I encountered an error while looking for best-selling books. Please try again later.');
//     });
//   } 

//   function recommendBasedOnPastPurchases(agent) {
//     const userId = agent.parameters.userId;
  
//     return prisma.user.findUnique({
//       where: { id: userId },
//       include: { purchases: { include: { book: true } } },
//     })
//     .then(user => {
//       const bookGenres = user.purchases.map(purchase => purchase.book.genre);
//       // ... use these genres to recommend books
//     })
//     .catch(error => {
//       console.error(error);
//       agent.add('I encountered an error while looking for your past purchases. Please try again later.');
//     });
//   }
  
//   function recommendBasedOnWishlist(agent) {
//     const userId = agent.parameters.userId;
  
//     return prisma.user.findUnique({
//       where: { id: userId },
//       include: { wishlist: { include: { book: true } } },
//     })
//     .then(user => {
//       const bookGenres = user.wishlist.map(wishlistItem => wishlistItem.book.genre);
//       // ... use these genres to recommend books
//     })
//     .catch(error => {
//       console.error(error);
//       agent.add('I encountered an error while looking at your wishlist. Please try again later.');
//     });
//   }
  

//   function fallback(agent) {
//     agent.add(`I'm sorry, I didn't understand that. Could you please rephrase or provide more details?`);
//   }

//   function welcomeUser(agent) {
//     const userId = agent.parameters.userId;

//     return prisma.user.findUnique({
//       where: { id: userId },
//     })
//     .then(user => {
//       agent.add(`Hello ${user.name}, how can I assist you today?`);
//     })
//     .catch(error => {
//       console.error(error);
//       agent.add('I encountered an error while retrieving user information. Please try again later.');
//     });
//   }

//   let intentMap = new Map();
//   intentMap.set('recommendBooks', recommendBooks);
//   intentMap.set('bestSellingBooks', bestSellingBooks);
//   intentMap.set('welcomeUser', welcomeUser);
//   intentMap.set('recommendBasedOnPastPurchases', recommendBasedOnPastPurchases); // Add this line
// intentMap.set('recommendBasedOnWishlist', recommendBasedOnWishlist); // Add this line
//   intentMap.set('Default Fallback Intent', fallback);  // Add this line
//   agent.handleRequest(intentMap);
// });

// app.listen(3000, () => {
//   console.log('Server is running on port 3000');
// });

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Something went wrong, please try again later.');
// });