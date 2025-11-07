const rateLimit = require('express-rate-limit');
const config = require('../config/app.config');

/**
 * General API Rate Limiter
 */
const apiLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Upload Rate Limiter (more restrictive)
 */
const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 uploads per 15 minutes
    message: {
        success: false,
        message: 'Too many upload requests, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Delete Rate Limiter
 */
const deleteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // 30 deletes per 15 minutes
    message: {
        success: false,
        message: 'Too many delete requests, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Auth Rate Limiter (for login/register endpoints)
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    apiLimiter,
    uploadLimiter,
    deleteLimiter,
    authLimiter,
};
