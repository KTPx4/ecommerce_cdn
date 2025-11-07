const storageService = require('../services/storage.service');
const { asyncHandler } = require('../utils/error.utils');
const { successResponse, paginatedResponse } = require('../utils/response.utils');
const { ApiError } = require('../utils/error.utils');
const { validateImage } = require('../utils/image.utils');
const logger = require('../utils/logger.utils');

/**
 * Upload single image
 * POST /api/v1/images/upload
 */
const uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, 'No image file provided');
    }

    // Validate image
    validateImage(req.file);

    // Get options from request body
    const options = {
        category: req.body.category || 'general',
        generateThumb: req.body.generateThumbnails !== 'false',
        optimize: req.body.optimize !== 'false',
    };

    // Upload to local storage
    const result = await storageService.uploadImage(req.file, options);

    // Add additional metadata if provided
    if (req.body.alt) result.alt = req.body.alt;
    if (req.body.tags) result.tags = JSON.parse(req.body.tags);

    logger.info(`Image uploaded: ${result.key} by user: ${req.user?.id || 'anonymous'}`);

    return successResponse(res, 201, 'Image uploaded successfully', result);
});

/**
 * Upload multiple images
 * POST /api/v1/images/upload-multiple
 */
const uploadMultipleImages = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
        throw new ApiError(400, 'No image files provided');
    }

    // Validate all images
    req.files.forEach((file) => validateImage(file));

    // Get options from request body
    const options = {
        category: req.body.category || 'general',
        generateThumb: req.body.generateThumbnails !== 'false',
        optimize: req.body.optimize !== 'false',
    };

    // Upload all images
    const uploadPromises = req.files.map((file) => storageService.uploadImage(file, options));
    const results = await Promise.all(uploadPromises);

    logger.info(
        `${results.length} images uploaded by user: ${req.user?.id || 'anonymous'}`
    );

    return successResponse(res, 201, 'Images uploaded successfully', {
        count: results.length,
        images: results,
    });
});

/**
 * Get image by path
 * GET /api/v1/images/:path
 */
const getImage = asyncHandler(async (req, res) => {
    const { path } = req.params;

    // Decode the path (in case it's URL encoded)
    const decodedPath = decodeURIComponent(path);

    // Check if size parameter is provided
    const size = req.query.size;
    let imagePath = decodedPath;

    if (size && ['small', 'medium', 'large'].includes(size)) {
        // Modify path to get thumbnail
        const ext = decodedPath.substring(decodedPath.lastIndexOf('.'));
        imagePath = decodedPath.replace(ext, `-${size}${ext}`);
    }

    const image = await storageService.getImage(imagePath);

    // Set appropriate headers
    res.set('Content-Type', image.contentType);
    res.set('Cache-Control', 'public, max-age=31536000'); // 1 year

    res.send(image.data);
});

/**
 * Get image metadata
 * GET /api/v1/images/:path/metadata
 */
const getImageMetadata = asyncHandler(async (req, res) => {
    const { path } = req.params;
    const decodedPath = decodeURIComponent(path);

    const metadata = await storageService.getImageMetadataFromStorage(decodedPath);

    return successResponse(res, 200, 'Image metadata retrieved successfully', metadata);
});

/**
 * Delete image
 * DELETE /api/v1/images/:path
 */
const deleteImage = asyncHandler(async (req, res) => {
    const { path } = req.params;
    const decodedPath = decodeURIComponent(path);

    // Check if image exists
    const exists = await storageService.imageExists(decodedPath);
    if (!exists) {
        throw new ApiError(404, 'Image not found');
    }

    await storageService.deleteImage(decodedPath);

    logger.info(`Image deleted: ${decodedPath} by user: ${req.user?.id || 'anonymous'}`);

    return successResponse(res, 200, 'Image deleted successfully', { path: decodedPath });
});

/**
 * List images
 * GET /api/v1/images
 */
const listImages = asyncHandler(async (req, res) => {
    const {
        category,
        page = 1,
        limit = 20,
    } = req.query;

    const options = {
        category,
        page: parseInt(page),
        limit: parseInt(limit),
    };

    const result = await storageService.listImages(options);

    // Calculate pagination info
    const totalPages = Math.ceil(result.total / result.limit);
    const pagination = {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages,
        hasNext: result.page < totalPages,
        hasPrev: result.page > 1,
    };

    return paginatedResponse(res, 200, 'Images retrieved successfully', result.images, pagination);
});

/**
 * Get storage statistics
 * GET /api/v1/images/stats
 */
const getStorageStats = asyncHandler(async (req, res) => {
    const stats = await storageService.getStorageStats();
    return successResponse(res, 200, 'Storage statistics retrieved successfully', stats);
});

/**
 * Health check endpoint
 * GET /api/v1/health
 */
const healthCheck = asyncHandler(async (req, res) => {
    return successResponse(res, 200, 'Service is healthy', {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
    });
});

module.exports = {
    uploadImage,
    uploadMultipleImages,
    getImage,
    getImageMetadata,
    deleteImage,
    listImages,
    getStorageStats,
    healthCheck,
};
