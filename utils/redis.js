import { promisify } from 'util';
import { createClient } from 'redis';

class RedisClient {
  constructor () {
    this.client = createClient();
    this.isRedisClientConnected = true;

    this.client.on('error', (err) => {
      console.error(`Error connecting to Redis: ${err}`);
      this.isRedisClientConnected = false;
    });

    this.client.on('connect', () => {console.log('Redis Client connected')
      this.isRedisClientConnected = true;
    });

    this.getAsync = promisify(this.client.get).bind(this.client);
  }

  isAlive () {
    return this.isRedisClientConnected;
  }

  async get (key) {
    return await promisify(this.client.get).bind(this.client)(key);
  }

  async set(key, value, duration) {
    return await promisify(this.client.set).bind(this.client)(key, value, 'EX', duration);
 }


  async del (key) {
    return await promisify(this.client.del).bind(this.client)(key);
  }
}

export const redisClient = new RedisClient();
export default redisClient;
