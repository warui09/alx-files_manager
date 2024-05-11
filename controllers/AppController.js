import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export const getStatus = () => ({ redis: redisClient.isAlive(), db: dbClient.isAlive() });

export const getStats = async () => {
  const users = await dbClient.nbUsers();
  const files = await dbClient.nbFiles();
  return { users: `${users}`, files: `${files}` };
};
