const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const config = require('./config/app.config');
const logger = require('./utils/logger.utils');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const { apiLimiter } = require('./middleware/rate-limit.middleware');

// Import routes
const healthRoutes = require('./routes/health.routes');
const imageRoutes = require('./routes/image.routes');

// Initialize express app
const app = express();

// Trust proxy (important for AWS deployment behind load balancer)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors(config.cors));

// Compression middleware
app.use(compression());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(
        morgan('combined', {
            stream: {
                write: (message) => logger.info(message.trim()),
            },
        })
    );
}

// API rate limiting
app.use(`/api/${config.apiVersion}`, apiLimiter);

// Routes
app.use(`/api/${config.apiVersion}`, healthRoutes);
app.use(`/api/${config.apiVersion}/images`, imageRoutes);

// Welcome route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'CDN Image Service API',
        version: config.apiVersion,
        documentation: '/api/v1/health',
    });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

module.exports = app;
