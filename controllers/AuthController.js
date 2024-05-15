/**
 * module provides controller for Authentication
 */

import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const { uuid } = require('uuidv4');

/* eslint-disable consistent-return */
const getConnect = async (req, res) => {
  const authHeader = req.headers.authorization;
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [email, password] = credentials.split(':');

  const user = await dbClient.findOne({ email });
  if (!user || user.password !== sha1(password)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = uuid();
  const key = `auth_${token}`;

  await redisClient.set(key, user.id, 'EX', 86400);
  res.status(200).json({ token });
};

const getDisconnect = async (req, res) => {
  const token = req.headers['x-token'];
  await redisClient.del(token);
  res.status(204).end();
};

module.exports = { getConnect, getDisconnect };
