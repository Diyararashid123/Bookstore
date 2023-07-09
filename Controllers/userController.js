const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// This function is responsible for fetching a user's data based on their ID.
const getUser = async (req, res) => {
  // The 'id' is extracted from the request parameters.
  const { id } = req.params;
  try {
    // Try to find the user in the database using the user's ID.
    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (user) {
      // If the user is found, return the user's data with a 200 OK status.
      res.status(200).json(user);
    } else {
      // If the user is not found, return a 404 Not Found status along with a message.
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    // If an error occurs while trying to execute the try block, it is caught here.
    // Log the error to the console and return a 500 Internal Server Error status along with an error message.
    res.status(500).json({ error: "USER ID DOES NOT EXIST" });
  }
};

// The 'Cleark' function is an asynchronous function responsible for creating a user in the database.
const Cleark = async(req, res) => { 
  // The 'data' property is extracted from the request body.
  const {data} = req.body;
  try{
    // The 'prisma.user.create' method is called to create a new user.
    const newUser = await prisma.user.create({
      data: {
        // The user's ID is set as 'data.id'.
        clerkId: data.id,
        // The username is set as 'data.username'.
        username: data.username,
        // The profile image URL is set as 'data.profile_image_url'.
        profileimageurl: data.profile_image_url,
      },
    });
    // If the user is created successfully, a 201 Created status code is returned along with a success message.
    res.status(201).json({message:`Successfully saved user with ID: ${data.id}`});
  } catch(error) {
    // If an error occurs while trying to execute the 'try' block, it is caught here.
    // Log the error to the console and return a 500 Internal Server Error status along with an error message.
    res.status(500).json({error: "Failed to save ID"})
  }
};



// The 'createInteraction' function is an asynchronous function responsible for creating or updating user interactions with books in the database.
const createInteraction = async (req, res) => {
  // The 'userId' and 'interactions' properties are extracted from the request body and renamed as 'clerkId' and 'interactions' respectively.
  const { userId, interactions } = req.body;

  // The authenticated user's ID is extracted from the request object.
  const authUserId = req.auth.userId;

  // If the authenticated user's ID does not match the user ID provided in the request body, an error is returned.
  if(authUserId != userId) {
    return res.status(401).json({ error: 'Unauthorized Request.' });
  }

  try {
    // Iterate over the 'interactions' array.
    for (let i = 0; i < interactions.length; i++) {
      // Extract 'id' and 'interactionsCount' properties from each 'interaction' object in the 'interactions' array.
      const { id: bookId, interactionsCount } = interactions[i];

      // Attempt to find an interaction in the database where the 'clerkId' and 'bookId' match the provided values.
      let interaction = await prisma.interaction.findFirst({
        where: {
          clerkId: userId,
          bookId: bookId
        }
      });

      // If an interaction is found, update the 'interactionsCount' in the database.
      if (interaction) {
        interaction = await prisma.interaction.update({
          where: {
            id: interaction.id
          },
          data: {
            interactionsCount: {
              increment: interactionsCount
            }
          }
        });
      } else {
        // If no interaction is found, create a new interaction in the database with the provided 'clerkId', 'bookId', and 'interactionsCount'.
        interaction = await prisma.interaction.create({
          data: {
            clerkId: userId,
            bookId: bookId,
            interactionsCount: interactionsCount
          }
        });
      }
    }

    // If all interactions are created or updated successfully, return a success message.
    res.status(201).json({ message: 'Interactions updated successfully.' });
  } catch (error) {
    // If an error occurs while trying to execute the 'try' block, it is caught here.
    // Log the error to the console and return an error message.
    console.error("Failed to create or update interactions:", error);
    res.status(400).json({ error: 'Failed to create or update interactions' });
  }
};



module.exports = {getUser, Cleark, createInteraction};
