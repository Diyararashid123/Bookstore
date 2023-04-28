const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createUser = async (req, res) => {
  const { username, password } = req.body;
  console.log("Username:", username, "Password:", password);
  try {
    const newUser = await prisma.user.create({
      data: { username, password },
    });
    res.status(201).json(newUser);
  } catch (error) {
    console.log(error); 
    res.status(400).json({ error: error.message }); 
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (user && user.password === password) {
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ error: "YOU NEED TO CREATE AN ACCOUNT"});
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "USER DOES NOT EXIST"});
  }
};

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


module.exports = {createUser, loginUser, deleteUser, getUser };