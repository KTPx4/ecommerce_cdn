const express = require('express');
const router = express.Router();
const imageController = require('../controllers/image.controller');
const upload = require('../middleware/upload.middleware');
const { authenticateApiKey, optionalAuth } = require('../middleware/auth.middleware');
const { uploadLimiter, deleteLimiter } = require('../middleware/rate-limit.middleware');
const {
    uploadValidation,
    imageIdValidation,
    imagePathValidation,
    listImagesValidation,
    imageSizeValidation,
} = require('../middleware/validation.middleware');

/**
 * @route   POST /api/v1/images/upload
 * @desc    Upload single image
 * @access  Private (API Key required)
 */
router.post(
    '/upload',
    authenticateApiKey,
    uploadLimiter,
    upload.single('image'),
    uploadValidation,
    imageController.uploadImage
);

/**
 * @route   POST /api/v1/images/upload-multiple
 * @desc    Upload multiple images
 * @access  Private (API Key required)
 */
router.post(
    '/upload-multiple',
    authenticateApiKey,
    uploadLimiter,
    upload.array('images', 10), // Max 10 images at once
    uploadValidation,
    imageController.uploadMultipleImages
);

/**
 * @route   GET /api/v1/images/stats
 * @desc    Get storage statistics
 * @access  Private (API Key required)
 */
router.get('/stats', authenticateApiKey, imageController.getStorageStats);

/**
 * @route   GET /api/v1/images/list
 * @desc    List all images
 * @access  Public (with optional auth)
 */
router.get('/list', optionalAuth, listImagesValidation, imageController.listImages);

/**
 * @route   GET /api/v1/images/:path
 * @desc    Get image by path
 * @access  Public
 */
router.get('/:path(*)', imageSizeValidation, imageController.getImage);

/**
 * @route   GET /api/v1/images/:path/metadata
 * @desc    Get image metadata
 * @access  Public (with optional auth)
 */
router.get('/:path(*)/metadata', optionalAuth, imageController.getImageMetadata);

/**
 * @route   DELETE /api/v1/images/:path
 * @desc    Delete image
 * @access  Private (API Key required)
 */
router.delete(
    '/:path(*)',
    authenticateApiKey,
    deleteLimiter,
    imagePathValidation,
    imageController.deleteImage
);

module.exports = router;
