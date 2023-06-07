const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: "USER ID DOES NOT EXIST" });
  }
};

const createUser = async (req, res) => {
  const { id } = req.body;
  try {
    const newUser = await prisma.user.create({
      data: {
        id
      },
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
};


const Cleark = async(req, res) => { 
  const {data} = req.body;
  try{
    const newUser = await prisma.user.create({
      data: {
        clerkId: data.id
      },
    });
    res.status(201).json({message:`Successfully saved user with ID: ${data.id}`});
  } catch(error) {
    res.status(500).json({error: "Failed to save ID"})
  }
};

const createInteraction = async (req, res) => {
  console.log("Received request:", req.body);

  const { userId, bookId, interactionCount } = req.body;

  if (!userId || !bookId || !interactionCount) {
    console.error("Missing userId, bookId or interactionCount");
    res.status(400).json({ error: "Request must include userId, bookId and interactionCount" });
    return;
  }

  try {
    console.log("Creating interaction for userId:", userId, "bookId:", bookId, "interactionCount:", interactionCount);

    // Repeat interaction creation based on the interactionCount
    for(let i=0; i<interactionCount; i++){
        await prisma.interaction.create({
          data: {
            userId,
            bookId,
          },
        });
    }

    console.log("Created interactions");
    res.status(201).json({ message: 'Interactions created' });
  } catch (error) {
    console.error("Failed to create interaction:", error);
    res.status(500).json({ error: 'Failed to create interaction' });
  }
};


module.exports = {getUser, createUser, Cleark, createInteraction};
