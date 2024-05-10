const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    this.isMongoClientConnected = false;
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    /* eslint-disable no-unused-vars */
    const database = process.env.DB_DATABASE || 'files_manager';
    const uri = `mongodb://${host}:${port}`;

    this.client = new MongoClient(uri);
    this.client.connect((err) => {
      if (err) {
        console.error(`Error connecting to MongoDB: ${err}`);
        return;
      }
      console.log('Connected to MongoDB');
      this.isMongoClientConnected = true;
    });
  }

  isAlive() {
    return this.isMongoClientConnected;
  }

  async nbUsers() {
    if (!this.isMongoClientConnected) {
      console.error('MongoDB is not connected');
      return null;
    }
    const collection = this.client.db().collection('users');
    /* eslint-disable no-return-await */
    return await collection.countDocuments();
  }

  async nbFiles() {
    if (!this.isMongoClientConnected) {
      console.error('MongoDB is not connected');
      return null;
    }
    const collection = this.client.db().collection('files');
    /* eslint-disable no-return-await */
    return await collection.countDocuments();
  }
}

const dbClient = new DBClient();
export default dbClient;
