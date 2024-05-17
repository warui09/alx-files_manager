/**
 * User controler module, provides functions to add a user
 */

const { sha1 } = require('sha1');
const { dbClient } = require('../utils/db');
const { redisClient } = require('../utils/redis');

const Queue = require('bull');

const userQueue = new Queue('send emails');

const postNew = async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).send('Missing email');
  }
  if (!password) {
    return res.status(400).send('Missing password');
  }
  const userExists = await dbClient.findOne({ email });
  if (userExists) {
    return res.status(400).send('Already exist');
  }
  const hashedPassword = sha1(password);
  const newUser = { email, password: hashedPassword };
  const result = await dbClient.insert(newUser);
  const insertedUser = { id: result.insertedId, email };
  userQueue.add({ userId: result.insertedId });
  return res.status(201).json(insertedUser);
};

/* eslint-disable consistent-return */
const getMe = async (req, res) => {
  const token = req.headers['x-token'];
  const userId = await redisClient.get(token);
  if (!userId) {
    return res.status(401).json({ error: 'Internal Server Error' });
  }
  const email = await dbClient.findOne({ userId });
  res.json({ email, id: userId });
};

module.exports = { postNew, getMe, userQueue };
