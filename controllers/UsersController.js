/**
 * User controler module, provides functions to add a user
 */

import sha1 from 'sha1';
import dbClient from '../utils/db';

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

module.exports = { postNew };
