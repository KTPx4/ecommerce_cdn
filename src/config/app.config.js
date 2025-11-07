require('dotenv').config();
const path = require('path');

module.exports = {
    // Server
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    apiVersion: process.env.API_VERSION || 'v1',
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',

    // Storage
    storage: {
        path: path.resolve(process.env.STORAGE_PATH || './storage/images'),
        tempPath: path.resolve(process.env.TEMP_PATH || './storage/temp'),
    },

    // JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },

    // API Key
    apiKeySecret: process.env.API_KEY_SECRET || 'your-api-key-secret',

    // Rate Limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    },

    // Image Configuration
    image: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
        allowedTypes: (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp,image/gif').split(','),
        quality: parseInt(process.env.IMAGE_QUALITY) || 80,
        generateThumbnails: process.env.GENERATE_THUMBNAILS === 'true',
        thumbnailSizes: [
            { name: 'small', width: 150, height: 150 },
            { name: 'medium', width: 300, height: 300 },
            { name: 'large', width: 800, height: 800 },
        ],
    },

    // CORS
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true,
    },

    // Logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        filePath: process.env.LOG_FILE_PATH || './logs',
    },
};
