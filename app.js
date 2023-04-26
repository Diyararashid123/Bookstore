const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const bookRoutes = require('./Routes/bookRoutes.js'); // Import the bookRoutes

const port = 3000;
const app = express();
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

app.use(cors());

app.use(bookRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;
