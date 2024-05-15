/**
 * module defines the files controller
 */

import dbClient from '../utils/db';

const fs = require('fs');
const path = require('path');
const Queue = require('bull');
const mime = require('mime-types');
const { uuid } = require('uuidv4');
const { getMe } = require('./UsersController');

/**
 * creates a new file in DB and in disk
 */
/* eslint-disable consistent-return */
const postUpload = async (req, res) => {
  const { email, userId } = await getMe();
  const name = req.body.filename;
  const { type } = req.body;
  const parentId = req.body.parentId || 0;
  const isPublic = req.body.isPublic || false;
  const fileQueue = new Queue('generate thumbnails');
  let localPath = '';

  if (!email || !userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!name) {
    return res.status(400).json({ error: 'Missing name' });
  }

  if (!type || !['folder', 'file', 'image'].includes(type)) {
    return res.status(400).json({ error: 'Missing type' });
  }

  if (type !== 'folder' && !req.body.data) {
    return res.status(400).json({ error: 'Missing data' });
  }

  if (parentId !== 0) {
    const parentFile = await dbClient.findOne({ parentId });
    if (!parentFile) {
      return res.status(400).json({ error: 'Parent not found' });
    }

    if (parentFile.type !== 'folder') {
      return res.status(400).json({ error: 'Parent is not a folder' });
    }
  }

  if (type === 'folder') {
    const newFolder = {
      userId,
      name,
      type,
      isPublic,
      parentId,
    };
    await dbClient.insertOne(newFolder);
    return res.status(201).json(newFolder);
  }
  const data = Buffer.from(req.body.data, 'base64');
  const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
  localPath = `${folderPath}/${uuid()}`;

  fs.writeFile(localPath, data, (err) => {
    if (err) {
      console.error('Error writing file to local storage:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const newFile = {
      userId,
      name,
      type,
      isPublic,
      parentId,
      localPath,
    };
    dbClient.insertOne(newFile);

    if (newFile.type === 'image') {
      fileQueue.add({ userId: newFile.userId, fileId: newFile.localPath });
    }

    return res.status(201).json(newFile);
  });
};

/**
 * retrieves the file document based on the ID
 */
const getShow = async (req, res) => {
  const fileId = req.params.id;
  const { email, userId } = await getMe();
  if (!email || !userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const file = await dbClient.findOne({ fileId });

  if (!file || file.length === 0) {
    return res.status(404).json({ error: 'Not found' });
  }

  const filePath = file[0].localPath;
  res.sendFile(filePath);
};

/**
 * retrieves all users file documents for a specific parentId and paginates
 * the results
 */
const getIndex = async (req, res) => {
  const { email, userId } = await getMe();
  if (!email || !userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const parentId = req.query.parentId || '0';
  const page = parseInt(req.query.page, 10) || 0;
  const limit = 20;
  const skip = page * limit;

  const files = await dbClient.aggregate([
    { $match: { parentId } },
    { $skip: skip },
    { $limit: limit },
  ]).toArray();

  res.status(200).json({ files });
};

/**
 * Sets isPublic to true on the file document based on the ID
 */
const putPublish = async (req, res) => {
  const fileId = req.params.id;
  const { email, userId } = await getMe();
  if (!email || !userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const file = await dbClient.findOne({ fileId });
  if (!file || file.length === 0) {
    return res.status(404).json({ error: 'Not found' });
  }

  file.isPublic = true;
  const filePath = file[0].localPath;
  res.status(200).sendFile(filePath);
};

/**
 * Sets isPublic to false on the file document based on the ID
 */
const putUnpublish = async (req, res) => {
  const fileId = req.params.id;
  const { email, userId } = await getMe();
  if (!email || !userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const file = await dbClient.findOne({ fileId });
  if (!file || file.length === 0) {
    return res.status(404).json({ error: 'Not found' });
  }

  file.isPublic = false;
  const filePath = file[0].localPath;
  res.status(200).sendFile(filePath);
};

/**
 * Returns the content of the file document based on the ID
 */
const getFile = async (req, res) => {
  const size = req.params.size;
  const fileId = req.params.id;
  const { email, userId } = await getMe();
  const file = await dbClient.findOne({ _id: fileId });
  if (!file || file.length === 0) {
    return res.status(404).json({ error: 'Not found' });
  }

  if ((!file.isPublic && !email) || userId !== file.userId) {
    res.status(404).json({ error: 'Not found' });
  }

  if (file.type === 'folder') {
    res.status(400).json({ error: 'A folder doesn\'t have content' });
  }

  const filePath = path.join(process.env.FOLDER_PATH || '/tmp/files_manager', file.localPath);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Not found' });
  }

  const mimeType = mime.lookup(file.name);
  res.setHeader('Content-Type', mimeType);
  fs.createReadStream(filePath).pipe(res);
};

module.exports = {
  postUpload, getShow, getIndex, putPublish, putUnpublish, getFile, fileQueue,
};
