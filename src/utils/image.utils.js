const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const config = require('../config/app.config');

/**
 * Generate unique filename
 */
const generateFileName = (originalName, prefix = '') => {
    const ext = path.extname(originalName);
    const uniqueId = uuidv4();
    const timestamp = Date.now();
    return `${prefix}${timestamp}-${uniqueId}${ext}`;
};

/**
 * Get file extension from mimetype
 */
const getExtensionFromMimeType = (mimeType) => {
    const extensions = {
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png',
        'image/webp': '.webp',
        'image/gif': '.gif',
    };
    return extensions[mimeType] || '.jpg';
};

/**
 * Optimize image using Sharp
 */
const optimizeImage = async (buffer, options = {}) => {
    const {
        width,
        height,
        quality = config.image.quality,
        format = 'jpeg',
    } = options;

    let image = sharp(buffer);

    // Resize if dimensions provided
    if (width || height) {
        image = image.resize(width, height, {
            fit: 'inside',
            withoutEnlargement: true,
        });
    }

    // Convert and optimize based on format
    switch (format) {
        case 'jpeg':
        case 'jpg':
            image = image.jpeg({ quality, progressive: true });
            break;
        case 'png':
            image = image.png({ quality, compressionLevel: 9 });
            break;
        case 'webp':
            image = image.webp({ quality });
            break;
        default:
            image = image.jpeg({ quality, progressive: true });
    }

    return image.toBuffer();
};

/**
 * Get image metadata
 */
const getImageMetadata = async (buffer) => {
    const metadata = await sharp(buffer).metadata();
    return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: metadata.size,
        hasAlpha: metadata.hasAlpha,
    };
};

/**
 * Generate thumbnail sizes
 */
const generateThumbnails = async (buffer, originalFormat) => {
    const thumbnails = {};

    for (const size of config.image.thumbnailSizes) {
        const optimized = await optimizeImage(buffer, {
            width: size.width,
            height: size.height,
            format: originalFormat,
        });
        thumbnails[size.name] = optimized;
    }

    return thumbnails;
};

/**
 * Validate image file
 */
const validateImage = (file) => {
    // Check if file exists
    if (!file) {
        throw new Error('No file provided');
    }

    // Check file size
    if (file.size > config.image.maxFileSize) {
        throw new Error(
            `File size exceeds maximum allowed size of ${config.image.maxFileSize / (1024 * 1024)}MB`
        );
    }

    // Check file type
    if (!config.image.allowedTypes.includes(file.mimetype)) {
        throw new Error(
            `Invalid file type. Allowed types: ${config.image.allowedTypes.join(', ')}`
        );
    }

    return true;
};

/**
 * Generate S3 key (path) for image
 */
const generateS3Key = (fileName, category = 'general') => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `images/${category}/${year}/${month}/${fileName}`;
};

module.exports = {
    generateFileName,
    getExtensionFromMimeType,
    optimizeImage,
    getImageMetadata,
    generateThumbnails,
    validateImage,
    generateS3Key,
};
