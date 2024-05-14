/**
 * App controler, provides two functions:
 * getStatus: returns the status of dbClient and RedisClient
 * getStats: returns number of users and files in mongodb
 */

import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const getStatus = (req, res) => {
  res.status(200).json({ redis: redisClient.isAlive(), db: dbClient.isAlive() });
};

const getStats = async (req, res) => {
  const users = await dbClient.nbUsers();
  const files = await dbClient.nbFiles();
  res.status(200).json({ users: `${users}`, files: `${files}` });
};

module.exports = { getStatus, getStats };
