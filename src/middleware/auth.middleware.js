const jwt = require('jsonwebtoken');
const config = require('../config/app.config');
const { ApiError } = require('../utils/error.utils');

/**
 * JWT Authentication Middleware
 * Verifies JWT token from Authorization header
 */
const authenticateJWT = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new ApiError(401, 'Authorization header is required');
        }

        const token = authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            throw new ApiError(401, 'Token is required');
        }

        const decoded = jwt.verify(token, config.jwt.secret);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return next(new ApiError(401, 'Invalid token'));
        }
        if (error.name === 'TokenExpiredError') {
            return next(new ApiError(401, 'Token expired'));
        }
        next(error);
    }
};

/**
 * API Key Authentication Middleware
 * For service-to-service authentication
 */
const authenticateApiKey = (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'];

        if (!apiKey) {
            throw new ApiError(401, 'API key is required');
        }

        if (apiKey !== config.apiKeySecret) {
            throw new ApiError(401, 'Invalid API key');
        }

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Optional Authentication Middleware
 * Verifies token if present, but doesn't require it
 */
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader) {
            const token = authHeader.split(' ')[1];
            if (token) {
                const decoded = jwt.verify(token, config.jwt.secret);
                req.user = decoded;
            }
        }
        next();
    } catch (error) {
        // If token is invalid, just continue without user
        next();
    }
};

/**
 * Role-based Authorization Middleware
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ApiError(401, 'Authentication required'));
        }

        if (!roles.includes(req.user.role)) {
            return next(new ApiError(403, 'Insufficient permissions'));
        }

        next();
    };
};

module.exports = {
    authenticateJWT,
    authenticateApiKey,
    optionalAuth,
    authorize,
};
