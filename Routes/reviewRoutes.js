    // viewRouter.js
    const express = require('express');
    const { ClerkExpressWithAuth } = require ("@clerk/clerk-sdk-node");
    const cors = require('cors');
    const {
      createReview, 
      deleteReview, 
      getBookReviews
    } = require('../Controllers/reviewcontroller.js'); // Adjust the path 

    const router = express.Router();
    router.use(cors());
    // Review-related routes
    router.post('/review/create', ClerkExpressWithAuth(), createReview);
    router.delete('/review/delete/:id', deleteReview);
    router.get('/review/:id', getBookReviews);

    module.exports = router;