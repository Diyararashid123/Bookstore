const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const bookRoutes = require('./Routes/bookRoutes.js');
const userRoutes = require('./Routes/userRoutes.js');
const wishlistRoutes = require('./Routes/wishlistRoutes.js');
const categoryRoutes = require('./Routes/categoryRoutes.js');
const reviewRoutes = require('../Controllers/reviewcontroller.js');

const port = 3000;
const app = express();
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

const corsOptions = {
  origin: '*', // Or specify the allowed domains, for example: ['http://localhost:3001', 'https://yourdomain.com']
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(bookRoutes);
app.use(userRoutes);
app.use(wishlistRoutes);
app.use(categoryRoutes);
app.use(reviewRoutes);

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong, please try again later.');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;