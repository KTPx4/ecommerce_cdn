const express = require('express');
const router = express.Router();
const imageController = require('../controllers/image.controller');

/**
 * @route   GET /api/v1/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', imageController.healthCheck);

module.exports = router;
