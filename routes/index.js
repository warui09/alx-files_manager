/**
 * contains all endpoints for the API
 */

const express = require('express');

const router = express.Router();
const AppController = require('../controllers/AppController');

router.get('/status', (req, res) => res.json(AppController.getStatus()));

router.get('/stats', (req, res) => res.json(AppController.getStats()));

module.exports = router;
