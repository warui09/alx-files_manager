import { promisify } from 'util';
import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.isRedisClientConnected = false;
    this.client = createClient();

    this.client.on('error', (err) => {
      console.error(`Error connecting to Redis: ${err}`);
    });

    this.client.on('connect', () => {
      console.log('Redis Client connected');
      this.isRedisClientConnected = true;
    });
  }

  isAlive() {
    return this.isRedisClientConnected;
  }

  async get(key) {
    if (!this.isRedisClientConnected) {
      console.error('Redis Client is not connected');
      return;
    }
    /* eslint-disable no-return-await */
    /* eslint-disable consistent-return */
    return await promisify(this.client.get).bind(this.client)(key);
  }

  async set(key, value, duration) {
    if (!this.isRedisClientConnected) {
      console.error('Redis Client is not connected');
      return;
    }
    /* eslint-disable no-return-await */
    /* eslint-disable consistent-return */
    return await promisify(this.client.set).bind(this.client)(key, value, 'EX', duration);
  }

  async del(key) {
    if (!this.isRedisClientConnected) {
      console.error('Redis Client is not connected');
      return;
    }
    /* eslint-disable no-return-await */
    /* eslint-disable consistent-return */
    return await promisify(this.client.del).bind(this.client)(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;
