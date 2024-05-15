import dbClient from './utils/db';
import fileQueue from './controllers/FilesController';

const fs = require('fs').promises;
const thumbnail = require('image-thumbnail');

fileQueue.process(async (job) => {
  const { fileId, userId } = job.data;
  if (!fileId) {
    throw new Error('Missing fileId');
  }

  if (!userId) {
    throw new Error('Missing userId');
  }

  const file = await dbClient.findOne({ fileId });
  if (!file) {
    throw new Error('File not found');
  }

  const imagePath = file.localPath;

  const thumbnails = await Promise.all([
    thumbnail(imagePath, { width: 500 }),
    thumbnail(imagePath, { width: 250 }),
    thumbnail(imagePath, { width: 100 }),
  ]);

  await Promise.all(thumbnails.map((thumb, index) => {
    const width = [500, 250, 100][index];
    const thumbPath = `${imagePath}_${width}`;
    return fs.writeFile(thumbPath, thumb);
  }));

  await dbClient.close();
});

fileQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

fileQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with error: ${err.message}`);
});

module.exports = fileQueue;
