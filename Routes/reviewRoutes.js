    // viewRouter.js
    const express = require('express');
    const {
      createReview, 
      deleteReview, 
      getBookReviews
    } = require('../Controllers/reviewcontroller.js'); // Adjust the path 

    const router = express.Router();

    // Review-related routes
    router.post('/review/create', createReview);
    router.delete('/review/delete/:id', deleteReview);
    router.get('/review/:id', getBookReviews);

    module.exports = router;