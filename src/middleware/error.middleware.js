const logger = require('../utils/logger.utils');
const { ApiError } = require('../utils/error.utils');

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
    let error = err;

    // Convert non-ApiError errors to ApiError
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal Server Error';
        error = new ApiError(statusCode, message);
    }

    // Log error
    const logMessage = {
        method: req.method,
        url: req.url,
        statusCode: error.statusCode,
        message: error.message,
        stack: error.stack,
        ip: req.ip,
        userAgent: req.get('user-agent'),
    };

    if (error.statusCode >= 500) {
        logger.error('Server Error:', logMessage);
    } else {
        logger.warn('Client Error:', logMessage);
    }

    // Send error response
    res.status(error.statusCode).json({
        success: false,
        message: error.message,
        errors: error.errors,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
    const error = new ApiError(404, `Route ${req.originalUrl} not found`);
    next(error);
};

module.exports = {
    errorHandler,
    notFoundHandler,
};
