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
        id: data.id
      },
    });
    res.status(201).json({message:`Successfully saved user with ID: ${data.id}`});
  } catch(error) {
    res.status(500).json({error: "Failed to save ID"})
  }
};


module.exports = {getUser, createUser,Cleark }; 