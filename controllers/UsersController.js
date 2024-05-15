/**
 * User controler module, provides functions to add a user
 */

import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

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

module.exports = { postNew, getMe };
